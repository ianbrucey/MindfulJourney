import { Moon, Sun, Sunrise, Sunset, Cloud, Stars, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-container";
import { motion } from "framer-motion";

const themes = [
  {
    id: "default",
    name: "Default Theme",
    icon: RotateCcw,
    primary: "hsl(262, 83%, 58%)",
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
        <AnimatedList className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <AnimatedListItem key={theme.id}>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 px-2 hover:bg-accent transition-all duration-300 group w-full"
                  onClick={() => {
                    setTheme({
                      primary: theme.primary,
                      variant: theme.variant,
                      appearance: "light",
                      radius: 0.5,
                    });
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="h-8 w-8 transition-colors duration-300" style={{ color: theme.primary }} />
                  </motion.div>
                  <span className="text-sm font-medium text-center group-hover:text-primary transition-colors duration-300">
                    {theme.name}
                  </span>
                </Button>
              </AnimatedListItem>
            );
          })}
        </AnimatedList>
      </CardContent>
    </Card>
  );
}