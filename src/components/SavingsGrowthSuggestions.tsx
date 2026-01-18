import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceSummary } from "@/hooks/useFinanceSummary";
import { useApp } from "@/contexts/AppContext";
import { 
  Lightbulb, 
  Shield, 
  TrendingUp, 
  Target, 
  Landmark,
  GraduationCap,
  Plane,
  PiggyBank
} from "lucide-react";

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  minSavings: number;
}

const allSuggestions: Suggestion[] = [
  {
    id: "emergency",
    icon: <Shield className="w-5 h-5 text-blue-500" />,
    title: "Build an Emergency Fund",
    description: "Aim to save 3-6 months of expenses. Start with a small goal and grow it over time.",
    minSavings: 0,
  },
  {
    id: "recurring",
    icon: <Landmark className="w-5 h-5 text-emerald-500" />,
    title: "Set Up Recurring Deposits",
    description: "Automate your savings with recurring deposits to build wealth consistently.",
    minSavings: 100,
  },
  {
    id: "fd",
    icon: <PiggyBank className="w-5 h-5 text-amber-500" />,
    title: "Consider Fixed Deposits",
    description: "Lock in higher interest rates with fixed deposits for guaranteed returns.",
    minSavings: 500,
  },
  {
    id: "mutual",
    icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
    title: "Explore Mutual Funds",
    description: "For long-term growth, diversified mutual funds can help your money work harder.",
    minSavings: 200,
  },
  {
    id: "education",
    icon: <GraduationCap className="w-5 h-5 text-indigo-500" />,
    title: "Education Savings Goal",
    description: "Start saving early for education expenses — small contributions add up over time.",
    minSavings: 0,
  },
  {
    id: "travel",
    icon: <Plane className="w-5 h-5 text-cyan-500" />,
    title: "Plan a Travel Fund",
    description: "Set aside a portion of your savings for future travel and experiences.",
    minSavings: 50,
  },
  {
    id: "goals",
    icon: <Target className="w-5 h-5 text-rose-500" />,
    title: "Goal-Based Savings",
    description: "Define specific goals (home, car, gadgets) and track progress towards each.",
    minSavings: 0,
  },
];

export const SavingsGrowthSuggestions = () => {
  const { loading, currentMonthSummary } = useFinanceSummary();
  const { formatCurrency } = useApp();

  const monthlySavings = currentMonthSummary.netSavings;

  const relevantSuggestions = useMemo(() => {
    // Filter suggestions based on monthly savings amount
    const filtered = allSuggestions.filter(s => monthlySavings >= s.minSavings);
    // Show at most 4 suggestions
    return filtered.slice(0, 4);
  }, [monthlySavings]);

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
          Based on your monthly savings of{" "}
          <span className={monthlySavings >= 0 ? "text-success font-medium" : "text-destructive font-medium"}>
            {formatCurrency(Math.abs(monthlySavings))}
          </span>
          {monthlySavings < 0 && " (deficit)"}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {monthlySavings <= 0 ? (
          <div className="text-center py-4">
            <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Focus on reducing expenses to start saving. Even small amounts count!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {relevantSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="mt-0.5 shrink-0">{suggestion.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          These are educational suggestions only. Please consult a financial advisor for personalized advice.
        </p>
      </CardContent>
    </Card>
  );
};
