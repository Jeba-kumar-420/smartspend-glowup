import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { useSavings } from "@/hooks/useSavings";
import { useExpenses } from "@/hooks/useExpenses";
import {
  Lightbulb,
  Shield,
  TrendingUp,
  Target,
  Landmark,
  AlertTriangle,
  PiggyBank,
} from "lucide-react";

interface SuggestionResult {
  status: string;
  message: string;
  tips: string[];
  icon: React.ReactNode;
}

const getSuggestions = (monthlySavings: number): SuggestionResult => {
  if (monthlySavings < 0) {
    return {
      status: "Savings Deficit",
      icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
      message:
        "You are currently spending more than you save. Focus on reducing non-essential expenses and tracking daily spending carefully.",
      tips: [
        "Start with small daily savings to slowly move out of deficit.",
      ],
    };
  }

  if (monthlySavings <= 500) {
    return {
      status: "Low Savings",
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      message:
        "You have started saving. Consider building an emergency fund for basic needs.",
      tips: [
        "Avoid unnecessary subscriptions.",
        "Track expenses category-wise to identify leaks.",
      ],
    };
  }

  if (monthlySavings <= 2000) {
    return {
      status: "Moderate Savings",
      icon: <Landmark className="w-5 h-5 text-emerald-500" />,
      message:
        "Good savings progress. You may consider structured saving options.",
      tips: [
        "Recurring Deposit (RD)",
        "Monthly SIP in mutual funds",
        "Short-term fixed deposits",
      ],
    };
  }

  return {
    status: "Strong Savings",
    icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
    message:
      "Excellent savings habit. You can explore long-term wealth-building options.",
    tips: [
      "Equity mutual funds",
      "Index funds",
      "Long-term fixed deposits",
      "Goal-based investments",
    ],
  };
};

export const SavingsGrowthSuggestions = () => {
  const { formatCurrency } = useApp();
  const { savings, loading: savingsLoading } = useSavings();
  const { expenses, loading: expensesLoading } = useExpenses();

  const loading = savingsLoading || expensesLoading;

  const monthlySavings = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const totalSavings = savings
      .filter((s) => {
        const d = new Date(s.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + s.amount, 0);

    const totalExpenses = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return totalSavings - totalExpenses;
  }, [savings, expenses]);

  const suggestion = useMemo(() => getSuggestions(monthlySavings), [monthlySavings]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Savings Growth Suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on your monthly net savings of{" "}
          <span
            className={
              monthlySavings >= 0
                ? "text-success font-medium"
                : "text-destructive font-medium"
            }
          >
            {formatCurrency(Math.abs(monthlySavings))}
          </span>
          {monthlySavings < 0 && " (deficit)"}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status badge */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {suggestion.icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground">
                {suggestion.status}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {suggestion.message}
              </p>
            </div>
          </div>

          {/* Tips */}
          {suggestion.tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="mt-0.5 shrink-0">
                {monthlySavings < 0 ? (
                  <PiggyBank className="w-5 h-5 text-amber-500" />
                ) : monthlySavings <= 500 ? (
                  <Target className="w-5 h-5 text-rose-500" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{tip}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          These suggestions are educational only and not financial advice.
        </p>
      </CardContent>
    </Card>
  );
};
