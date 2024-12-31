import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWellnessGoals } from "@/hooks/use-wellness-goals";
import WellnessGoalForm from "@/components/WellnessGoalForm";
import WellnessGoalCard from "@/components/WellnessGoalCard";

export default function WellnessGoals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { goals, createGoal } = useWellnessGoals();

  const handleSubmit = async (values: any) => {
    await createGoal(values);
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Wellness Goal</DialogTitle>
            </DialogHeader>
            <WellnessGoalForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">No Goals Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first wellness goal to start tracking your progress.
              </p>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </DialogTrigger>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <WellnessGoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
