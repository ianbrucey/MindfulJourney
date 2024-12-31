import { Moon, Sun, Sunrise, Sunset, Cloud, Stars } from "lucide-react";
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
    id: "ocean",
    name: "Ocean Calm",
    icon: Sunset,
    primary: "hsl(199, 89%, 48%)",
    description: "Serene blues inspired by peaceful ocean waves",
    variant: "professional",
  },
  {
    id: "forest",
    name: "Forest Serenity",
    icon: Sunrise,
    primary: "hsl(150, 60%, 40%)",
    description: "Calming greens from a peaceful forest",
    variant: "tint",
  },
  {
    id: "night",
    name: "Night Meditation",
    icon: Moon,
    primary: "hsl(245, 40%, 40%)",
    description: "Deep purples for evening relaxation",
    variant: "vibrant",
  },
  {
    id: "dawn",
    name: "Morning Zen",
    icon: Sun,
    primary: "hsl(35, 95%, 60%)",
    description: "Warm sunrise colors for morning meditation",
    variant: "tint",
  },
  {
    id: "misty",
    name: "Misty Mountain",
    icon: Cloud,
    primary: "hsl(210, 20%, 60%)",
    description: "Soft, misty grays for deep focus",
    variant: "professional",
  },
  {
    id: "cosmos",
    name: "Cosmic Flow",
    icon: Stars,
    primary: "hsl(280, 60%, 45%)",
    description: "Cosmic purples for transcendent meditation",
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
                className="flex flex-col items-center gap-2 h-auto p-4 hover:bg-accent transition-colors"
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
                <span className="text-sm font-medium">{theme.name}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {theme.description}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
