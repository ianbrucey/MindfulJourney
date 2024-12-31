import { cn } from "@/lib/utils";
import {
  Frown,
  MehIcon,
  SmileIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface MoodPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const moods = [
  { value: 1, icon: Frown, label: "Terrible" },
  { value: 2, icon: AlertCircle, label: "Bad" },
  { value: 3, icon: MehIcon, label: "Okay" },
  { value: 4, icon: SmileIcon, label: "Good" },
  { value: 5, icon: CheckCircle2, label: "Great" },
];

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex justify-between gap-2">
      {moods.map((mood) => {
        const Icon = mood.icon;
        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={cn(
              "p-3 rounded-full transition-colors",
              value === mood.value
                ? "bg-primary text-primary-foreground"
                : "hover:bg-primary/10"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="sr-only">{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
