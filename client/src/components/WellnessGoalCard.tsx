import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Target,
  Calendar,
  Timer,
  BarChart,
  PlusCircle,
} from "lucide-react";
import type { SelectWellnessGoal } from "@db/schema";
import { useWellnessGoals } from "@/hooks/use-wellness-goals";

interface WellnessGoalCardProps {
  goal: SelectWellnessGoal;
}

export default function WellnessGoalCard({ goal }: WellnessGoalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const { recordProgress } = useWellnessGoals();

  const progress = ((goal.currentValue ?? 0) / goal.targetValue) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await recordProgress({
      goalId: goal.id,
      progress: {
        value: parseInt(value),
        note: note.trim() || undefined,
      }
    });
    setValue("");
    setNote("");
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{goal.title}</span>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Progress</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Progress Value
                  </label>
                  <Input
                    type="number"
                    placeholder={`Enter ${goal.category} value`}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes about your progress..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Save Progress
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            {goal.frequency}
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {goal.targetValue} {goal.category === "meditation" ? "minutes" : "times"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(goal.startDate).toLocaleDateString()}
          </span>
        </div>

        {goal.description && (
          <p className="text-sm text-muted-foreground">{goal.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              Progress
            </span>
            <span>
              {goal.currentValue ?? 0} / {goal.targetValue}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}