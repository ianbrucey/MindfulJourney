import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const colors = [
  "bg-red-200",
  "bg-orange-200",
  "bg-yellow-200",
  "bg-green-200",
  "bg-blue-200",
  "bg-indigo-200",
  "bg-purple-200",
  "bg-pink-200",
];

export default function ColorTherapy() {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [pattern, setPattern] = useState<string[]>([]);

  const addColor = (color: string) => {
    setSelectedColors((prev) => [...prev, color]);
  };

  const generatePattern = () => {
    if (selectedColors.length === 0) return;
    const newPattern: string[] = [];
    for (let i = 0; i < 16; i++) {
      newPattern.push(
        selectedColors[Math.floor(Math.random() * selectedColors.length)]
      );
    }
    setPattern(newPattern);
  };

  const resetPattern = () => {
    setSelectedColors([]);
    setPattern([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Color Therapy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Select colors that make you feel calm and relaxed. Then generate a soothing pattern.
        </div>

        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-lg ${color} cursor-pointer transition-all duration-300 ${
                selectedColors.includes(color) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => addColor(color)}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={generatePattern} disabled={selectedColors.length === 0}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Pattern
          </Button>
          <Button variant="outline" onClick={resetPattern}>
            Reset
          </Button>
        </div>

        {pattern.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-4 gap-2"
          >
            {pattern.map((color, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`aspect-square rounded-lg ${color}`}
              />
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
