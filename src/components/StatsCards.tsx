import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { useBudget } from "@/hooks/useBudget";
import { useSavings } from "@/hooks/useSavings";
import { TrendingUp, DollarSign, Target, PiggyBank } from "lucide-react";
import { useMemo } from "react";

export const StatsCards = () => {
  const { formatCurrency, getTotalSpending, getSpendingByCategory } = useApp();
  const { getCurrentBudget } = useBudget();
  const currentBudget = getCurrentBudget();
  const { savings } = useSavings();

  const monthlySpending = getTotalSpending('month');
  const spendingByCategory = getSpendingByCategory();
  
  const topCategory = useMemo(() => {
    const categories = Object.entries(spendingByCategory);
    if (categories.length === 0) return { name: 'None', amount: 0 };
    
    return categories.reduce((max, [name, amount]) => 
      amount > max.amount ? { name, amount } : max
    , { name: categories[0][0], amount: categories[0][1] });
  }, [spendingByCategory]);

  const totalSavings = useMemo(() => {
    return savings.reduce((sum, saving) => sum + saving.amount, 0);
  }, [savings]);

  const budgetRemaining = currentBudget ? currentBudget.monthly_budget - monthlySpending : 0;
  const budgetProgress = currentBudget ? (monthlySpending / currentBudget.monthly_budget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Monthly Spending */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(monthlySpending)}
          </div>
        </CardContent>
      </Card>

      {/* Budget Remaining */}
      <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Budget Left
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {currentBudget ? formatCurrency(Math.max(0, budgetRemaining)) : 'No Budget'}
          </div>
          {currentBudget && (
            <div className="mt-2">
              <Progress value={Math.min(100, budgetProgress)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {budgetProgress.toFixed(0)}% of budget used
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-warning capitalize">
            {topCategory.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(topCategory.amount)}
          </div>
        </CardContent>
      </Card>

      {/* Total Savings */}
      <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            Total Saved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-info">
            {formatCurrency(totalSavings)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};