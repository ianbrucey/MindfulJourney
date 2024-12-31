import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  ListTodo,
  Volume2,
  Music,
  Wind,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";

const sessionDurations = [
  { value: "25", label: "25 minutes (Pomodoro)" },
  { value: "45", label: "45 minutes (Deep Focus)" },
  { value: "90", label: "90 minutes (Flow State)" },
  { value: "custom", label: "Custom Duration" },
];

const soundscapes = [
  { id: "white-noise", name: "White Noise", type: "noise", noiseType: "white" },
  { id: "binaural", name: "Binaural Beats", type: "music", frequency: 40 },
  { id: "nature", name: "Nature Sounds", type: "ambient", preset: "forest" },
  { id: "minimal", name: "Minimal Piano", type: "music", preset: "ambient" },
];

export default function DeepWorkGuide() {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState("25");
  const [customDuration, setCustomDuration] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [selectedSound, setSelectedSound] = useState(soundscapes[0]);
  const [volume, setVolume] = useState(30);
  const [notes, setNotes] = useState("");

  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const noiseRef = useRef<Tone.Noise | null>(null);
  const synthRef = useRef<Tone.Synth | null>(null);
  const bellRef = useRef<Howl>(new Howl({
    src: ['/meditation-bell.mp3'],
    volume: 0.5,
  }));

  useEffect(() => {
    // Initialize audio
    const noise = new Tone.Noise({
      type: "white",
      volume: Tone.gainToDb(volume / 100),
    }).toDestination();

    const filter = new Tone.Filter({
      type: "lowpass",
      frequency: 1000,
    }).toDestination();

    noise.connect(filter);
    noiseRef.current = noise;

    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 1,
        release: 0.8,
      },
    }).toDestination();
    synthRef.current = synth;

    return () => {
      noise.dispose();
      filter.dispose();
      synth.dispose();
    };
  }, []);

  useEffect(() => {
    if (noiseRef.current) {
      noiseRef.current.volume.value = Tone.gainToDb(volume / 100);
    }
    if (synthRef.current) {
      synthRef.current.volume.value = Tone.gainToDb(volume / 100);
    }
  }, [volume]);

  const startSession = async () => {
    await Tone.start();
    const sessionDuration = duration === "custom" 
      ? parseInt(customDuration) 
      : parseInt(duration);
    
    setRemainingTime(sessionDuration * 60);
    startTimeRef.current = Date.now();

    // Start audio based on selected soundscape
    if (selectedSound.type === "noise" && noiseRef.current) {
      noiseRef.current.start();
    } else if (selectedSound.type === "music" && synthRef.current) {
      // Play binaural beats or ambient music
      const playNote = () => {
        if (synthRef.current && isRunning) {
          synthRef.current.triggerAttackRelease("C2", "4n");
          setTimeout(playNote, 1000);
        }
      };
      playNote();
    }

    bellRef.current.play();
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current!;
      const remaining = Math.max(0, sessionDuration * 60 - Math.floor(elapsed / 1000));
      const newProgress = ((sessionDuration * 60 - remaining) / (sessionDuration * 60)) * 100;

      setRemainingTime(remaining);
      setProgress(newProgress);

      if (remaining === 0) {
        endSession();
      }
    }, 1000);
  };

  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (noiseRef.current) {
      noiseRef.current.stop();
    }
    bellRef.current.play();
    setIsRunning(false);
    setProgress(0);
    
    if (currentTask) {
      setCompletedTasks(prev => [...prev, currentTask]);
      setCurrentTask("");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Deep Work Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Session Progress</span>
            <span className="font-medium">{formatTime(remainingTime)}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Session Duration</label>
          <Select
            value={duration}
            onValueChange={setDuration}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {sessionDurations.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {duration === "custom" && (
            <Input
              type="number"
              placeholder="Enter minutes"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              min="1"
              max="180"
              className="mt-2"
              disabled={isRunning}
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Current Task</label>
          <Input
            placeholder="What are you working on?"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              <label className="text-sm font-medium">Focus Soundscape</label>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          </div>

          <Select
            value={selectedSound.id}
            onValueChange={(value) => {
              const sound = soundscapes.find(s => s.id === value);
              if (sound) setSelectedSound(sound);
            }}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sound" />
            </SelectTrigger>
            <SelectContent>
              {soundscapes.map((sound) => (
                <SelectItem key={sound.id} value={sound.id}>
                  {sound.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Session Notes</label>
          <Textarea
            placeholder="Capture your thoughts and progress..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Completed Tasks
            </label>
            <div className="space-y-2">
              {completedTasks.map((task, index) => (
                <div
                  key={index}
                  className="p-2 bg-primary/5 rounded-md text-sm"
                >
                  {task}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={isRunning ? endSession : startSession}
          className="w-full"
          size="lg"
          variant={isRunning ? "destructive" : "default"}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              End Session
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Deep Work Session
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
