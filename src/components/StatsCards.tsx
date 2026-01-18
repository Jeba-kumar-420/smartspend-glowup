import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
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

  const statsCards = [
    {
      id: 'monthly',
      title: 'This Month',
      value: formatCurrency(monthlySpending),
      icon: DollarSign,
      gradient: 'from-primary/10 to-primary/5',
      border: 'border-primary/20',
      textColor: 'text-primary'
    },
    {
      id: 'budget',
      title: 'Budget Left',
      value: currentBudget ? formatCurrency(Math.max(0, budgetRemaining)) : 'No Budget',
      icon: Target,
      gradient: 'from-success/10 to-success/5',
      border: 'border-success/20',
      textColor: 'text-success',
      extra: currentBudget ? (
        <div className="mt-2">
          <Progress value={Math.min(100, budgetProgress)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {budgetProgress.toFixed(0)}% of budget used
          </p>
        </div>
      ) : null
    },
    {
      id: 'category',
      title: 'Top Category',
      value: topCategory.name,
      subtitle: formatCurrency(topCategory.amount),
      icon: TrendingUp,
      gradient: 'from-warning/10 to-warning/5',
      border: 'border-warning/20',
      textColor: 'text-warning',
      minHeight: true
    },
    {
      id: 'savings',
      title: 'Total Saved',
      value: formatCurrency(totalSavings),
      icon: PiggyBank,
      gradient: 'from-info/10 to-info/5',
      border: 'border-info/20',
      textColor: 'text-info'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${card.gradient} ${card.border} hover:shadow-lg transition-shadow duration-300 h-full flex flex-col`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <div className={`text-2xl font-bold ${card.textColor} ${card.id === 'category' ? 'text-lg capitalize' : ''}`}>
                    {card.value}
                  </div>
                  {card.subtitle && (
                    <div className="text-sm text-muted-foreground">
                      {card.subtitle}
                    </div>
                  )}
                </div>
                {card.extra}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};