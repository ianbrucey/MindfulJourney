import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Volume2,
  PlayCircle,
  PauseCircle,
  Wind,
  Waves,
  TreePine,
  Cloud,
  Umbrella,
  Sunrise,
  Moon,
  Mountain,
} from "lucide-react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import WaveformVisualizer from "./WaveformVisualizer";

type NoiseType = "white" | "pink" | "brown";

interface SoundLayer {
  type: NoiseType;
  frequency: number;
  volume: number;
  filter: {
    frequency: number;
    Q: number;
  };
}

interface SoundPreset {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  sounds: SoundLayer[];
  lfoSettings: {
    frequency: number;
    min: number;
    max: number;
  };
}

const soundLibrary: SoundPreset[] = [
  {
    id: "forest-day",
    name: "Daytime Forest",
    icon: TreePine,
    description: "Gentle rustling leaves with distant birdsong",
    sounds: [
      { type: "pink", frequency: 0.4, volume: -20, filter: { frequency: 2000, Q: 1 } },
      { type: "brown", frequency: 0.1, volume: -30, filter: { frequency: 800, Q: 2 } },
    ],
    lfoSettings: { frequency: 0.2, min: 400, max: 1200 }
  },
  {
    id: "forest-night",
    name: "Nighttime Forest",
    icon: Moon,
    description: "Cricket chirps and soft night winds",
    sounds: [
      { type: "pink", frequency: 0.3, volume: -25, filter: { frequency: 3000, Q: 1 } },
      { type: "white", frequency: 0.2, volume: -40, filter: { frequency: 4000, Q: 3 } }
    ],
    lfoSettings: { frequency: 0.15, min: 2000, max: 4000 }
  },
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    icon: Waves,
    description: "Rhythmic waves with distant seabirds",
    sounds: [
      { type: "brown", frequency: 0.1, volume: -15, filter: { frequency: 600, Q: 0.5 } },
      { type: "pink", frequency: 0.05, volume: -35, filter: { frequency: 1500, Q: 2 } }
    ],
    lfoSettings: { frequency: 0.08, min: 200, max: 800 }
  },
  {
    id: "gentle-rain",
    name: "Gentle Rain",
    icon: Umbrella,
    description: "Soft rainfall on a quiet afternoon",
    sounds: [
      { type: "pink", frequency: 0.3, volume: -20, filter: { frequency: 3000, Q: 1 } },
      { type: "white", frequency: 0.4, volume: -30, filter: { frequency: 4000, Q: 2 } }
    ],
    lfoSettings: { frequency: 0.25, min: 2000, max: 4000 }
  },
  {
    id: "thunderstorm",
    name: "Distant Storm",
    icon: Cloud,
    description: "Rolling thunder with heavy rain",
    sounds: [
      { type: "brown", frequency: 0.05, volume: -20, filter: { frequency: 400, Q: 0.7 } },
      { type: "pink", frequency: 0.3, volume: -25, filter: { frequency: 2000, Q: 1 } }
    ],
    lfoSettings: { frequency: 0.1, min: 100, max: 1000 }
  },
  {
    id: "mountain-wind",
    name: "Mountain Winds",
    icon: Mountain,
    description: "High-altitude gusts and whistling breezes",
    sounds: [
      { type: "pink", frequency: 0.5, volume: -22, filter: { frequency: 1500, Q: 1 } },
      { type: "white", frequency: 0.3, volume: -35, filter: { frequency: 3000, Q: 2 } }
    ],
    lfoSettings: { frequency: 0.3, min: 800, max: 2000 }
  },
  {
    id: "morning-meadow",
    name: "Morning Meadow",
    icon: Sunrise,
    description: "Early morning nature awakening",
    sounds: [
      { type: "pink", frequency: 0.4, volume: -25, filter: { frequency: 2500, Q: 1 } },
      { type: "brown", frequency: 0.2, volume: -35, filter: { frequency: 1000, Q: 1.5 } }
    ],
    lfoSettings: { frequency: 0.2, min: 1000, max: 3000 }
  },
];

export default function AmbientSoundLibrary() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(soundLibrary[0]);
  const [volume, setVolume] = useState(30);
  const [duration, setDuration] = useState(15); // minutes

  const noiseGenerators = useRef<Tone.Noise[]>([]);
  const filters = useRef<Tone.Filter[]>([]);
  const lfos = useRef<Tone.LFO[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Cleanup previous sound chain
    noiseGenerators.current.forEach(noise => noise.dispose());
    filters.current.forEach(filter => filter.dispose());
    lfos.current.forEach(lfo => lfo.dispose());
    noiseGenerators.current = [];
    filters.current = [];
    lfos.current = [];

    // Create layered sound generators for the current preset
    currentSound.sounds.forEach(sound => {
      const noise = new Tone.Noise({
        type: sound.type,
        volume: Tone.gainToDb(volume / 100) + sound.volume,
      });

      const filter = new Tone.Filter({
        frequency: sound.filter.frequency,
        type: "lowpass",
        Q: sound.filter.Q,
      });

      const lfo = new Tone.LFO({
        frequency: currentSound.lfoSettings.frequency * sound.frequency,
        min: currentSound.lfoSettings.min,
        max: currentSound.lfoSettings.max,
      });

      noise.connect(filter);
      filter.toDestination();
      lfo.connect(filter.frequency);

      noiseGenerators.current.push(noise);
      filters.current.push(filter);
      lfos.current.push(lfo);
    });

    return () => {
      noiseGenerators.current.forEach(noise => noise.dispose());
      filters.current.forEach(filter => filter.dispose());
      lfos.current.forEach(lfo => lfo.dispose());
    };
  }, [currentSound]);

  useEffect(() => {
    noiseGenerators.current.forEach((noise, index) => {
      const baseVolume = currentSound.sounds[index].volume;
      noise.volume.value = Tone.gainToDb(volume / 100) + baseVolume;
    });
  }, [volume, currentSound]);

  const toggleSound = async () => {
    if (!noiseGenerators.current.length) return;

    if (!isPlaying) {
      await Tone.start();
      noiseGenerators.current.forEach(noise => noise.start());
      lfos.current.forEach(lfo => lfo.start());

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          stopSound();
        }, duration * 60 * 1000);
      }
    } else {
      stopSound();
    }

    setIsPlaying(!isPlaying);
  };

  const stopSound = () => {
    noiseGenerators.current.forEach(noise => noise.stop());
    lfos.current.forEach(lfo => lfo.stop());
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPlaying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          Ambient Sound Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <WaveformVisualizer
          isPlaying={isPlaying}
          ambientVolume={volume}
          musicVolume={0}
          isMusicEnabled={false}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Sound Scene</label>
          <Select
            value={currentSound.id}
            onValueChange={(value) => {
              const newSound = soundLibrary.find((s) => s.id === value);
              if (newSound) {
                stopSound();
                setCurrentSound(newSound);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a sound scene" />
            </SelectTrigger>
            <SelectContent>
              {soundLibrary.map((sound) => {
                const Icon = sound.icon;
                return (
                  <SelectItem key={sound.id} value={sound.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {sound.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {currentSound.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <label className="text-sm font-medium">Volume</label>
          </div>
          <Slider
            value={[volume]}
            onValueChange={([value]) => setVolume(value)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Continuous</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={toggleSound}
            className="w-full"
            size="lg"
            variant={isPlaying ? "destructive" : "default"}
          >
            {isPlaying ? (
              <>
                <PauseCircle className="h-4 w-4 mr-2" />
                Stop Sound
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Play Sound
              </>
            )}
          </Button>
        </motion.div>

        {isPlaying && duration > 0 && (
          <p className="text-sm text-center text-muted-foreground">
            Sound will stop automatically in {duration} minutes
          </p>
        )}
      </CardContent>
    </Card>
  );
}