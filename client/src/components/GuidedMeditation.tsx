import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Play, Pause, Brain, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import * as Tone from "tone";

const meditationTypes = [
  {
    id: "breathing",
    name: "Breathing Exercise",
    duration: 180, // 3 minutes
    description: "Focus on your breath with guided inhales and exhales",
    icon: Wind,
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      rest: 2,
    },
  },
  {
    id: "body-scan",
    name: "Body Scan",
    duration: 300, // 5 minutes
    description: "Progressive relaxation through body awareness",
    icon: Brain,
    instructions: [
      "Focus on your feet and toes",
      "Move to your ankles and calves",
      "Notice your knees and thighs",
      "Feel your hips and lower back",
      "Bring attention to your stomach",
      "Observe your chest and breathing",
      "Relax your shoulders and arms",
      "Release tension in your neck",
      "Soften your face and jaw",
      "Be aware of your whole body",
    ],
  },
];

export default function GuidedMeditation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentType, setCurrentType] = useState(meditationTypes[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const phaseTimerRef = useRef<NodeJS.Timeout>();
  const [noise, setNoise] = useState<Tone.Noise | null>(null);
  const [volume, setVolume] = useState(30);

  const bells = useRef<Howl>(new Howl({
    src: ['/meditation-bell.mp3'],
    volume: 0.5,
  }));

  useEffect(() => {
    const newNoise = new Tone.Noise({
      type: "pink",
      volume: Tone.gainToDb(volume / 100),
    }).toDestination();

    setNoise(newNoise);

    return () => {
      newNoise.dispose();
    };
  }, []);

  useEffect(() => {
    if (noise) {
      noise.volume.value = Tone.gainToDb(volume / 100);
    }
  }, [volume, noise]);

  const startMeditation = async () => {
    if (!noise) return;

    await Tone.start();
    bells.current.play();
    noise.start();

    setIsPlaying(true);
    setBreathPhase(0);
    startTimeRef.current = Date.now();

    // Set up the main progress timer
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current!;
      const newProgress = (elapsed / (currentType.duration * 1000)) * 100;

      if (newProgress >= 100) {
        stopMeditation();
      } else {
        setProgress(newProgress);

        if (currentType.id === "body-scan" && currentType.instructions) {
          const stepDuration = currentType.duration / currentType.instructions.length;
          const currentStepIndex = Math.floor(elapsed / 1000 / stepDuration);
          if (currentStepIndex !== currentStep) {
            setCurrentStep(currentStepIndex);
            if (currentStepIndex < currentType.instructions.length) {
              bells.current.play();
            }
          }
        }
      }
    }, 100);

    // Set up the breathing phase timer if in breathing mode
    if (currentType.id === "breathing" && currentType.pattern) {
      const breathingCycle = currentType.pattern;
      const cycleDuration = 
        (breathingCycle.inhale + breathingCycle.hold + 
         breathingCycle.exhale + breathingCycle.rest) * 1000;

      phaseTimerRef.current = setInterval(() => {
        setBreathPhase(prev => (prev + 1) % 4);
      }, cycleDuration / 4);
    }
  };

  const stopMeditation = () => {
    if (noise) {
      noise.stop();
    }
    bells.current.play();
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
    setBreathPhase(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = Math.max(
    0,
    Math.ceil(currentType.duration * (1 - progress / 100))
  );

  const getBreathingPhase = () => {
    switch (breathPhase) {
      case 0:
        return "Inhale...";
      case 1:
        return "Hold...";
      case 2:
        return "Exhale...";
      case 3:
        return "Rest...";
      default:
        return "Inhale...";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Guided Meditation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Meditation Type</label>
          <Select
            value={currentType.id}
            onValueChange={(value) => {
              const newType = meditationTypes.find((t) => t.id === value);
              if (newType) {
                setCurrentType(newType);
                setProgress(0);
                setCurrentStep(0);
              }
            }}
            disabled={isPlaying}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a meditation type" />
            </SelectTrigger>
            <SelectContent>
              {meditationTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name} ({formatTime(type.duration)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {currentType.description}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{formatTime(remainingTime)}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-primary/5 rounded-lg p-4"
            >
              {currentType.id === "breathing" ? (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1.2, 1, 1],
                    }}
                    transition={{
                      duration: currentType.pattern?.inhale + currentType.pattern?.hold + 
                               currentType.pattern?.exhale + currentType.pattern?.rest,
                      repeat: Infinity,
                      times: [0, 0.25, 0.5, 0.75, 1],
                    }}
                    className="w-16 h-16 rounded-full bg-primary/20 mb-4"
                  />
                  <p className="text-lg font-medium text-center">
                    {getBreathingPhase()}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-medium text-center">
                  {currentType.instructions?.[currentStep]}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={isPlaying ? stopMeditation : startMeditation}
          className="w-full"
          size="lg"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              End Session
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Begin Session
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}