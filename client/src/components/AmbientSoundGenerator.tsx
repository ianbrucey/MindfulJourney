import { useState, useEffect } from "react";
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
import { Volume2, Play, Pause } from "lucide-react";
import * as Tone from "tone";

const soundTypes = {
  white: "White Noise",
  pink: "Pink Noise",
  brown: "Brown Noise",
} as const;

export default function AmbientSoundGenerator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [soundType, setSoundType] = useState<keyof typeof soundTypes>("white");
  const [noise, setNoise] = useState<Tone.Noise | null>(null);

  useEffect(() => {
    // Initialize Tone.js
    const newNoise = new Tone.Noise({
      type: soundType,
      volume: Tone.gainToDb(volume / 100),
    }).toDestination();

    setNoise(newNoise);

    return () => {
      newNoise.dispose();
    };
  }, [soundType]);

  useEffect(() => {
    if (noise) {
      noise.volume.value = Tone.gainToDb(volume / 100);
    }
  }, [volume, noise]);

  const togglePlay = async () => {
    if (!noise) return;

    await Tone.start();

    if (isPlaying) {
      noise.stop();
    } else {
      noise.start();
    }

    setIsPlaying(!isPlaying);
  };

  const handleTypeChange = (value: keyof typeof soundTypes) => {
    if (isPlaying && noise) {
      noise.stop();
    }
    setSoundType(value);
    setIsPlaying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          Ambient Sounds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Sound Type</label>
          <Select value={soundType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a sound type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(soundTypes).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Volume</label>
          <div className="flex items-center gap-4">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              max={100}
              step={1}
            />
            <span className="text-sm text-muted-foreground w-8">
              {volume}%
            </span>
          </div>
        </div>

        <Button
          onClick={togglePlay}
          className="w-full"
          size="lg"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Play
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}