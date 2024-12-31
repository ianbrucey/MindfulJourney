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
  Music,
} from "lucide-react";
import { motion } from "framer-motion";
import * as Tone from "tone";

const soundLibrary = [
  { id: "white", name: "White Noise", icon: Wind, frequency: 1 },
  { id: "pink", name: "Pink Noise", icon: Wind, frequency: 0.5 },
  { id: "brown", name: "Brown Noise", icon: Wind, frequency: 0.25 },
  { id: "waves", name: "Ocean Waves", icon: Waves, frequency: 0.1 },
  { id: "rain", name: "Gentle Rain", icon: Umbrella, frequency: 0.3 },
  { id: "thunder", name: "Distant Thunder", icon: Cloud, frequency: 0.05 },
  { id: "forest", name: "Forest Birds", icon: TreePine, frequency: 0.4 },
  { id: "chimes", name: "Wind Chimes", icon: Music, frequency: 0.2 },
];

export default function AmbientSoundLibrary() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(soundLibrary[0]);
  const [volume, setVolume] = useState(30);
  const [duration, setDuration] = useState(15); // minutes

  const [noise, setNoise] = useState<Tone.Noise | null>(null);
  const [filter, setFilter] = useState<Tone.Filter | null>(null);
  const [lfo, setLfo] = useState<Tone.LFO | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Create the noise generator and filter chain
    const newNoise = new Tone.Noise({
      type: currentSound.id as "white" | "pink" | "brown",
      volume: Tone.gainToDb(volume / 100),
    });

    const newFilter = new Tone.Filter({
      frequency: 800,
      type: "lowpass",
      rolloff: -24,
    });

    const newLfo = new Tone.LFO({
      frequency: currentSound.frequency,
      min: 400,
      max: 1200,
    });

    // Connect the audio chain
    newNoise.connect(newFilter);
    newFilter.toDestination();
    newLfo.connect(newFilter.frequency);

    setNoise(newNoise);
    setFilter(newFilter);
    setLfo(newLfo);

    return () => {
      newNoise.dispose();
      newFilter.dispose();
      newLfo.dispose();
    };
  }, [currentSound]);

  useEffect(() => {
    if (noise) {
      noise.volume.value = Tone.gainToDb(volume / 100);
    }
  }, [volume, noise]);

  const toggleSound = async () => {
    if (!noise || !lfo) return;

    if (!isPlaying) {
      await Tone.start();
      noise.start();
      lfo.start();

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
    if (noise) noise.stop();
    if (lfo) lfo.stop();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPlaying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          Ambient Sound Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Sound Type</label>
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
              <SelectValue placeholder="Select a sound" />
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
