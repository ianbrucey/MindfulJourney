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
import { Volume2, Play, Pause, Music, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";

// Musical scales for relaxing melodies
const scales = {
  pentatonic: ["C4", "D4", "F4", "G4", "A4", "C5"],
  majorScale: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  minorScale: ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
};

// Different musical patterns
const patterns = [
  { id: "ambient", name: "Ambient Flow", tempo: 60, noteLength: "4n" },
  { id: "meditation", name: "Meditation Bells", tempo: 45, noteLength: "2n" },
  { id: "nature", name: "Nature Inspired", tempo: 75, noteLength: "8n" },
];

export default function MusicPlaylistGenerator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentPattern, setCurrentPattern] = useState(patterns[0]);
  const [currentScale, setCurrentScale] = useState<keyof typeof scales>("pentatonic");
  const [savedPatterns, setSavedPatterns] = useState<typeof patterns[0][]>([]);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const sequencerRef = useRef<Tone.Sequence | null>(null);

  useEffect(() => {
    // Initialize the synthesizer with reverb and delay effects
    const reverb = new Tone.Reverb({ decay: 5, wet: 0.6 }).toDestination();
    const delay = new Tone.FeedbackDelay("8n", 0.5).connect(reverb);
    
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.4,
        release: 2,
      },
    }).connect(delay);

    synth.volume.value = Tone.gainToDb(volume / 100);
    synthRef.current = synth;

    return () => {
      synth.dispose();
      delay.dispose();
      reverb.dispose();
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = Tone.gainToDb(volume / 100);
    }
  }, [volume]);

  const generateSequence = () => {
    const scale = scales[currentScale];
    const pattern: string[] = [];
    const patternLength = 8;

    // Generate a relaxing pattern based on the current pattern type
    for (let i = 0; i < patternLength; i++) {
      if (currentPattern.id === "meditation") {
        // Meditation pattern: sparse, contemplative notes
        if (Math.random() > 0.6) {
          pattern.push(scale[Math.floor(Math.random() * scale.length)]);
        } else {
          pattern.push(null);
        }
      } else if (currentPattern.id === "ambient") {
        // Ambient pattern: long, overlapping notes
        if (Math.random() > 0.3) {
          pattern.push(scale[Math.floor(Math.random() * scale.length)]);
        } else {
          pattern.push(scale[0]); // Root note for stability
        }
      } else {
        // Nature pattern: more melodic movement
        const noteIndex = Math.floor(Math.random() * scale.length);
        pattern.push(scale[noteIndex]);
      }
    }

    return pattern;
  };

  const startPlaying = async () => {
    if (!synthRef.current) return;

    await Tone.start();
    Tone.Transport.bpm.value = currentPattern.tempo;

    if (sequencerRef.current) {
      sequencerRef.current.dispose();
    }

    const sequence = new Tone.Sequence(
      (time, note) => {
        if (note && synthRef.current) {
          synthRef.current.triggerAttackRelease(note, currentPattern.noteLength, time);
        }
      },
      generateSequence(),
      currentPattern.noteLength
    );

    sequencerRef.current = sequence;
    sequence.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopPlaying = () => {
    if (sequencerRef.current) {
      sequencerRef.current.stop();
      Tone.Transport.stop();
    }
    setIsPlaying(false);
  };

  const saveCurrentPattern = () => {
    setSavedPatterns(prev => [...prev, currentPattern]);
  };

  const deletePattern = (index: number) => {
    setSavedPatterns(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          Music Playlist Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pattern Style</label>
          <Select
            value={currentPattern.id}
            onValueChange={(value) => {
              const pattern = patterns.find(p => p.id === value);
              if (pattern) {
                setCurrentPattern(pattern);
                if (isPlaying) {
                  stopPlaying();
                  setTimeout(startPlaying, 100);
                }
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a pattern" />
            </SelectTrigger>
            <SelectContent>
              {patterns.map((pattern) => (
                <SelectItem key={pattern.id} value={pattern.id}>
                  {pattern.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Musical Scale</label>
          <Select
            value={currentScale}
            onValueChange={(value: keyof typeof scales) => {
              setCurrentScale(value);
              if (isPlaying) {
                stopPlaying();
                setTimeout(startPlaying, 100);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a scale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pentatonic">Pentatonic (Peaceful)</SelectItem>
              <SelectItem value="majorScale">Major Scale (Uplifting)</SelectItem>
              <SelectItem value="minorScale">Minor Scale (Contemplative)</SelectItem>
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

        <div className="flex gap-2">
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={isPlaying ? stopPlaying : startPlaying}
              className="w-full"
              size="lg"
              variant={isPlaying ? "destructive" : "default"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Music
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate & Play
                </>
              )}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={saveCurrentPattern}
              variant="outline"
              disabled={isPlaying}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {savedPatterns.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Saved Patterns</h3>
            <div className="space-y-2">
              {savedPatterns.map((pattern, index) => (
                <motion.div
                  key={`${pattern.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-2 bg-secondary/20 rounded-md"
                >
                  <span className="text-sm">{pattern.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePattern(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
