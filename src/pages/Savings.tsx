import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useSavings } from "@/hooks/useSavings";
import { SavingsGoals } from "@/components/SavingsGoals";
import { SavingsGrowthSuggestions } from "@/components/SavingsGrowthSuggestions";
import { SpendingChart } from "@/components/SpendingChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank, Target, TrendingUp, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SavingEntry {
  id: string;
  amount: number;
  date: string;
  category?: string;
}

const Savings = () => {
  const [newSaving, setNewSaving] = useState("");
  const [savingDate, setSavingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [savingCategory, setSavingCategory] = useState("general");
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { formatCurrency } = useApp();
  const { savings, addSaving, loading } = useSavings();

  // Generate savings chart data for last 7 days
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

  const handleAddSaving = async () => {
    if (!newSaving || isNaN(Number(newSaving))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    await addSaving({
      amount: Number(newSaving),
      date: savingDate,
      category: savingCategory,
    });

    setNewSaving("");
    setSavingCategory("general");
    setSavingDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-4">
            <PiggyBank className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">My Savings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your daily savings</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Savings Trends Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Savings Trends
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

          {/* Savings Goals */}
          <SavingsGoals />

          {/* Savings Growth Suggestions */}
          <SavingsGrowthSuggestions />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5" />
                Add New Savings Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={newSaving}
                    onChange={(e) => setNewSaving(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={savingDate}
                    onChange={(e) => setSavingDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={savingCategory} onValueChange={setSavingCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddSaving} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Savings Entry
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PiggyBank className="w-5 h-5" />
                Savings History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading savings...</p>
                </div>
              ) : savings.length === 0 ? (
                <div className="text-center py-8">
                  <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-base font-medium text-muted-foreground">No savings recorded yet</p>
                  <p className="text-sm text-muted-foreground">Start saving today!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savings.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {format(new Date(entry.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        {entry.category && (
                          <div className="text-xs text-muted-foreground capitalize">
                            Category: {entry.category}
                          </div>
                        )}
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-lg font-bold text-success">
                          +{formatCurrency(entry.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Savings;