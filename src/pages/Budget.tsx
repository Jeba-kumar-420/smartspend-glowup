import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/contexts/ThemeContext";
import { useBudget } from "@/hooks/useBudget";
import { useApp } from "@/contexts/AppContext";
import { Target, TrendingUp, AlertCircle } from "lucide-react";

const Budget = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { getCurrentBudget, setBudget, loading } = useBudget();
  const { formatCurrency, getTotalSpending } = useApp();
  const [budgetAmount, setBudgetAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentBudget = getCurrentBudget();
  const monthlySpending = getTotalSpending('month');
  
  const budgetProgress = useMemo(() => {
    if (!currentBudget) return 0;
    return Math.min((monthlySpending / currentBudget.monthly_budget) * 100, 100);
  }, [monthlySpending, currentBudget]);

  const remainingBudget = useMemo(() => {
    if (!currentBudget) return 0;
    return Math.max(currentBudget.monthly_budget - monthlySpending, 0);
  }, [monthlySpending, currentBudget]);

  const isOverBudget = currentBudget && monthlySpending > currentBudget.monthly_budget;

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetAmount);
    
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setIsSubmitting(true);
    await setBudget(amount);
    setBudgetAmount("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Budget Tracker
            </h1>
            <p className="text-muted-foreground">
              Set and track your monthly spending budget
            </p>
          </div>

          {/* Current Budget Status */}
          {currentBudget && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  This Month's Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(currentBudget.monthly_budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                      {formatCurrency(monthlySpending)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-success'}`}>
                      {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(remainingBudget))}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{budgetProgress.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={budgetProgress} 
                    className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>

                {isOverBudget && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">
                      You're over budget by {formatCurrency(monthlySpending - currentBudget.monthly_budget)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Set Budget Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {currentBudget ? 'Update Budget' : 'Set Monthly Budget'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetBudget} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Amount</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Enter your monthly budget"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? 'Setting...' : (currentBudget ? 'Update Budget' : 'Set Budget')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Budget Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">50/30/20 Rule</h4>
                <p className="text-sm text-muted-foreground">
                  Allocate 50% for needs, 30% for wants, and 20% for savings
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Track Daily</h4>
                <p className="text-sm text-muted-foreground">
                  Check your spending daily to stay on track
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Emergency Buffer</h4>
                <p className="text-sm text-muted-foreground">
                  Keep 10-15% buffer in your budget for unexpected expenses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Budget;