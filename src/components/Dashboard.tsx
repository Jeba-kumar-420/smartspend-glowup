import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpendingChart } from "./SpendingChart";
import { DailyChartsSection } from "./DailyChartsSection";
import { ReportGenerator } from "./ReportGenerator";
import { ExpenseAnalytics } from "./ExpenseAnalytics";
import { useApp } from "@/contexts/AppContext";
import { useSavings } from "@/hooks/useSavings";
import { User, Plus, History, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export const Dashboard = () => {
  const { user, formatCurrency, getTotalSpending, expenses } = useApp();
  const { savings } = useSavings();
  const navigate = useNavigate();

  // Get savings data for chart
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

  // Generate chart data from actual expenses or use empty data
  const generateChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
      const mainCategory = dayExpenses.length > 0 ? dayExpenses[0].category : 'other';

      weekData.push({
        day: days[date.getDay()],
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: totalAmount,
        category: mainCategory,
      });
    }

    return weekData;
  };

  const chartData = generateChartData();
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Welcome back, {user?.name || 'User'}!
              </h2>
              <p className="text-muted-foreground">
                Track your expenses and manage your budget effectively
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(getTotalSpending('today'))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {formatCurrency(getTotalSpending('week'))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(getTotalSpending('month'))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Savings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-success" />
            Daily Savings for Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <SpendingChart 
              data={savingsChartData} 
              showAverage={true}
              title=""
              lineColor="#ffffff"
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      <ExpenseAnalytics />

      {/* Daily Charts Section */}
      <DailyChartsSection />

      {/* Action Buttons */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-4">
        <Button 
          className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground"
          size="lg"
          onClick={() => navigate('/add-expense')}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Expense
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="outline" className="h-12 w-full" onClick={() => navigate('/savings')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Savings
          </Button>
          <ReportGenerator />
        </div>
      </div>
    </div>
  );
};