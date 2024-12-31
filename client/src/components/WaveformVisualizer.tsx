import { useEffect, useRef } from "react";
import * as Tone from "tone";

interface WaveformVisualizerProps {
  isPlaying: boolean;
  ambientVolume: number;
  musicVolume: number;
  isMusicEnabled: boolean;
}

export default function WaveformVisualizer({
  isPlaying,
  ambientVolume,
  musicVolume,
  isMusicEnabled,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create analyzer node
    analyserRef.current = new Tone.Analyser({
      type: "waveform",
      size: 1024,
    });

    // Connect to master output
    Tone.Destination.connect(analyserRef.current);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    // Handle canvas resize
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation function
    const draw = () => {
      if (!analyserRef.current || !isPlaying) return;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const values = analyserRef.current.getValue();
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw ambient sound waveform
      ctx.beginPath();
      ctx.strokeStyle = `hsla(var(--primary), ${ambientVolume / 100})`;
      ctx.lineWidth = 2;

      const sliceWidth = width / values.length;
      let x = 0;

      for (let i = 0; i < values.length; i++) {
        const v = (values[i] as number + 1) / 2;
        const y = v * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Draw music waveform if enabled
      if (isMusicEnabled && musicVolume > 0) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(var(--secondary), ${musicVolume / 100})`;
        ctx.lineWidth = 1.5;

        x = 0;
        for (let i = 0; i < values.length; i++) {
          const v = ((values[i] as number + 1) / 2) * 0.8; // Slightly smaller amplitude
          const y = v * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      }

      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = "hsla(var(--primary), 0.3)";

      frameRef.current = requestAnimationFrame(draw);
    };

    // Start animation if playing
    if (isPlaying) {
      draw();
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameRef.current);
      if (analyserRef.current) {
        analyserRef.current.dispose();
      }
    };
  }, [isPlaying, ambientVolume, musicVolume, isMusicEnabled]);

  return (
    <div className="relative w-full h-32 mb-4 overflow-hidden rounded-lg bg-background/5">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ opacity: isPlaying ? 1 : 0.3 }}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Visualization paused
        </div>
      )}
    </div>
  );
}
