import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useApp } from "@/contexts/AppContext";
import { Plus, Target, Calendar as CalendarIcon, Trophy, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const SavingsGoals = () => {
  const { goals, loading, addGoal, updateGoalProgress, deleteGoal } = useSavingsGoals();
  const { formatCurrency } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    deadline: undefined as Date | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.target_amount) return;

    await addGoal({
      title: formData.title,
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline ? format(formData.deadline, 'yyyy-MM-dd') : undefined,
    });

    setFormData({ title: "", target_amount: "", deadline: undefined });
    setIsAddModalOpen(false);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const isGoalCompleted = (current: number, target: number) => {
    return current >= target;
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return <div className="text-center p-4">Loading goals...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Savings Goals
            </span>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Savings Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Vacation Fund, Emergency Fund"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Target Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Deadline (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.deadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.deadline ? format(formData.deadline, "MM/dd/yyyy") : <span>Set deadline</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.deadline}
                          onSelect={(date) => setFormData({ ...formData, deadline: date })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Create Goal
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No savings goals yet.</p>
              <p className="text-sm">Create your first goal to start tracking progress!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
                const isCompleted = isGoalCompleted(goal.current_amount, goal.target_amount);
                const isPastDeadline = isDeadlinePassed(goal.deadline);
                
                return (
                  <Card key={goal.id} className={cn(
                    "border-l-4",
                    isCompleted ? "border-l-success bg-success/5" : 
                    isPastDeadline ? "border-l-destructive bg-destructive/5" :
                    "border-l-primary"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            {goal.title}
                            {isCompleted && <Trophy className="h-4 w-4 text-success" />}
                          </h4>
                          {goal.deadline && (
                            <p className={cn(
                              "text-sm",
                              isPastDeadline ? "text-destructive" : "text-muted-foreground"
                            )}>
                              Deadline: {format(new Date(goal.deadline), "MMM dd, yyyy")}
                              {isPastDeadline && " (Overdue)"}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{formatCurrency(goal.current_amount)}</span>
                          <span>{formatCurrency(goal.target_amount)}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress.toFixed(1)}% completed</span>
                          <span>
                            {formatCurrency(goal.target_amount - goal.current_amount)} remaining
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};