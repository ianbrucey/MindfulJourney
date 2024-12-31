import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Play, Pause, Brain, Wind, Volume2, Waves, TreePine, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
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

const meditationTypes = [
  {
    id: "breathing",
    name: "Breathing Exercise",
    duration: 180,
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
    duration: 300,
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

const soundTypes = [
  { id: "pink", name: "Pink Noise", icon: Wind, frequency: 0.5, noiseType: "pink" },
  { id: "waves", name: "Ocean Waves", icon: Waves, frequency: 0.1, noiseType: "brown" },
  { id: "forest", name: "Forest Birds", icon: TreePine, frequency: 0.4, noiseType: "pink" },
];

export default function GuidedMeditation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentType, setCurrentType] = useState(meditationTypes[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const [currentSound, setCurrentSound] = useState(soundTypes[0]);
  const [currentPattern, setCurrentPattern] = useState(patterns[0]);
  const [currentScale, setCurrentScale] = useState<keyof typeof scales>("pentatonic");
  const [ambientVolume, setAmbientVolume] = useState(30);
  const [musicVolume, setMusicVolume] = useState(30);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const phaseTimerRef = useRef<NodeJS.Timeout>();
  const sequencerRef = useRef<Tone.Sequence | null>(null);

  const [noise, setNoise] = useState<Tone.Noise | null>(null);
  const [filter, setFilter] = useState<Tone.Filter | null>(null);
  const [lfo, setLfo] = useState<Tone.LFO | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  const bells = useRef<Howl>(new Howl({
    src: ['/meditation-bell.mp3'],
    volume: 0.5,
  }));

  useEffect(() => {
    // Initialize ambient sound chain
    const newNoise = new Tone.Noise({
      type: currentSound.noiseType,
      volume: Tone.gainToDb(ambientVolume / 100),
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

    // Connect the ambient sound chain
    newNoise.connect(newFilter);
    newFilter.toDestination();
    newLfo.connect(newFilter.frequency);

    setNoise(newNoise);
    setFilter(newFilter);
    setLfo(newLfo);

    // Initialize music synthesizer
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

    synth.volume.value = Tone.gainToDb(musicVolume / 100);
    synthRef.current = synth;

    return () => {
      newNoise.dispose();
      newFilter.dispose();
      newLfo.dispose();
      synth.dispose();
      delay.dispose();
      reverb.dispose();
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
    };
  }, [currentSound]);

  useEffect(() => {
    if (noise) {
      noise.volume.value = Tone.gainToDb(ambientVolume / 100);
    }
  }, [ambientVolume, noise]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = Tone.gainToDb(musicVolume / 100);
    }
  }, [musicVolume]);

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
          pattern.push("");
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

  const startMeditation = async () => {
    if (!noise || !lfo || !synthRef.current) return;

    await Tone.start();
    bells.current.play();

    // Start ambient sound
    noise.start();
    lfo.start();

    // Start music if enabled
    if (isMusicEnabled) {
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
    }

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
        setBreathPhase((prev) => (prev + 1) % 4);
      }, cycleDuration / 4);
    }
  };

  const stopMeditation = () => {
    if (noise) {
      noise.stop();
    }
    if (lfo) {
      lfo.stop();
    }
    if (sequencerRef.current) {
      sequencerRef.current.stop();
      Tone.Transport.stop();
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Background Sound</label>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[ambientVolume]}
                onValueChange={([value]) => setAmbientVolume(value)}
                max={100}
                step={1}
                className="w-[100px]"
              />
            </div>
          </div>
          <Select
            value={currentSound.id}
            onValueChange={(value) => {
              const newSound = soundTypes.find((s) => s.id === value);
              if (newSound) {
                setCurrentSound(newSound);
              }
            }}
            disabled={isPlaying}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select background sound" />
            </SelectTrigger>
            <SelectContent>
              {soundTypes.map((sound) => {
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <label className="text-sm font-medium">Background Music</label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMusicEnabled(!isMusicEnabled)}
              disabled={isPlaying}
            >
              {isMusicEnabled ? "Disable" : "Enable"}
            </Button>
          </div>

          {isMusicEnabled && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Music Volume</label>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={[musicVolume]}
                    onValueChange={([value]) => setMusicVolume(value)}
                    max={100}
                    step={1}
                    className="w-[100px]"
                  />
                </div>
              </div>

              <Select
                value={currentPattern.id}
                onValueChange={(value) => {
                  const pattern = patterns.find((p) => p.id === value);
                  if (pattern) {
                    setCurrentPattern(pattern);
                    if (isPlaying) {
                      stopMeditation();
                      setTimeout(startMeditation, 100);
                    }
                  }
                }}
                disabled={isPlaying}
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

              <Select
                value={currentScale}
                onValueChange={(value: keyof typeof scales) => {
                  setCurrentScale(value);
                  if (isPlaying) {
                    stopMeditation();
                    setTimeout(startMeditation, 100);
                  }
                }}
                disabled={isPlaying}
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
            </>
          )}
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
                      scale: breathPhase === 0 ? [1, 1.5] :
                        breathPhase === 1 ? 1.5 :
                        breathPhase === 2 ? [1.5, 1] : 1,
                    }}
                    transition={{
                      duration: (currentType.pattern?.inhale || 0) + (currentType.pattern?.hold || 0) +
                        (currentType.pattern?.exhale || 0) + (currentType.pattern?.rest || 0),
                      ease: "easeInOut",
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