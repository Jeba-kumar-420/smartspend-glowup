import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingChart } from "./SpendingChart";
import { useApp } from "@/contexts/AppContext";
import { useSavings } from "@/hooks/useSavings";
import { TrendingUp, TrendingDown } from "lucide-react";

export const DailyChartsSection = () => {
  const { expenses } = useApp();
  const { savings } = useSavings();

  // Generate spending chart data from expenses
  const spendingChartData = useMemo(() => {
    const now = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });

      const totalAmount = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const mainCategory = dayExpenses.length > 0 ? dayExpenses[0].category : 'spending';

      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: totalAmount,
        category: mainCategory,
      });
    }

    return weekData;
  }, [expenses]);

  // Generate savings chart data from actual savings
  const savingsChartData = useMemo(() => {
    const now = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const daySavings = savings.filter(saving => {
        const savingDate = new Date(saving.date);
        return savingDate.toDateString() === date.toDateString();
      });

      const totalAmount = daySavings.reduce((sum, saving) => sum + saving.amount, 0);

      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: totalAmount,
        category: 'savings',
      });
    }

    return weekData;
  }, [savings]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Spending Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Daily Spending Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart 
              data={spendingChartData} 
              showAverage={true}
              title=""
              lineColor="hsl(var(--destructive))"
            />
          </CardContent>
        </Card>

        {/* Daily Savings Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Daily Savings Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart 
              data={savingsChartData} 
              showAverage={true}
              title="Daily Savings (Last 7 Days)"
              lineColor="hsl(var(--success))"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};