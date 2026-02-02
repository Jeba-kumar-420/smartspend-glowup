import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyChartsSection } from "./DailyChartsSection";
import { ReportGenerator } from "./ReportGenerator";
import { ExpenseAnalytics } from "./ExpenseAnalytics";
import { StatsCards } from "./StatsCards";
import { useApp } from "@/contexts/AppContext";
import { User, Plus, TrendingUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Dashboard = () => {
  const { user, expenses } = useApp();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  // Auto-dismiss welcome popup after 4 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Generate chart data from actual expenses
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
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">
                      Welcome back, {user?.name || 'User'}!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Track your expenses and manage your budget
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <StatsCards />

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