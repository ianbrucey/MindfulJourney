import { Moon, Sun, Sunrise, Sunset, Cloud, Stars, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const themes = [
  {
    id: "default",
    name: "Default Theme",
    icon: RotateCcw,
    primary: "hsl(222.2 47.4% 11.2%)",
    variant: "professional",
  },
  {
    id: "ocean",
    name: "Ocean Calm",
    icon: Sunset,
    primary: "hsl(199, 89%, 48%)",
    variant: "professional",
  },
  {
    id: "forest",
    name: "Forest Serenity",
    icon: Sunrise,
    primary: "hsl(150, 60%, 40%)",
    variant: "tint",
  },
  {
    id: "night",
    name: "Night Meditation",
    icon: Moon,
    primary: "hsl(245, 40%, 40%)",
    variant: "vibrant",
  },
  {
    id: "dawn",
    name: "Morning Zen",
    icon: Sun,
    primary: "hsl(35, 95%, 60%)",
    variant: "tint",
  },
  {
    id: "misty",
    name: "Misty Mountain",
    icon: Cloud,
    primary: "hsl(210, 20%, 60%)",
    variant: "professional",
  },
  {
    id: "cosmos",
    name: "Cosmic Flow",
    icon: Stars,
    primary: "hsl(280, 60%, 45%)",
    variant: "vibrant",
  },
] as const;

export default function ThemeSelector() {
  const { setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stars className="h-5 w-5 text-primary" />
          Relaxation Themes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <Button
                key={theme.id}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 px-2 hover:bg-accent transition-colors"
                onClick={() => {
                  setTheme({
                    primary: theme.primary,
                    variant: theme.variant,
                    appearance: "light",
                    radius: 0.5,
                  });
                }}
              >
                <Icon className="h-8 w-8" style={{ color: theme.primary }} />
                <span className="text-sm font-medium text-center">{theme.name}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}