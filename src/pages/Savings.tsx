import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
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
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [newSaving, setNewSaving] = useState("");
  const [savingDate, setSavingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [savingCategory, setSavingCategory] = useState("");
  const [savingsEntries, setSavingsEntries] = useState<SavingEntry[]>([]);
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { formatCurrency } = useApp();

  // Load savings from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('dailySavings');
    if (savedEntries) {
      setSavingsEntries(JSON.parse(savedEntries));
    }
  }, []);

  const handleAddSaving = () => {
    if (!newSaving || isNaN(Number(newSaving))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(newSaving);
    const newEntry: SavingEntry = {
      id: Date.now().toString(),
      amount,
      date: savingDate,
      category: savingCategory || undefined,
    };

    const updatedEntries = [newEntry, ...savingsEntries];
    setSavingsEntries(updatedEntries);
    localStorage.setItem('dailySavings', JSON.stringify(updatedEntries));
    
    setThisMonth(prev => prev + amount);
    setNewSaving("");
    setSavingCategory("");
    setSavingDate(format(new Date(), 'yyyy-MM-dd'));
    
    toast({
      title: "Savings added",
      description: `Added ${formatCurrency(amount)} to your savings!`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <PiggyBank className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">My Savings</h1>
          <p className="text-muted-foreground">Track your daily savings</p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Monthly Target</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyTarget)}</p>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-accent-foreground" />
                  <span className="text-sm font-medium text-accent-foreground">This Month</span>
                </div>
                <p className="text-2xl font-bold text-accent-foreground">{formatCurrency(thisMonth)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Savings Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Savings History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {savingsEntries.length === 0 ? (
                <div className="text-center py-8">
                  <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No savings recorded yet</p>
                  <p className="text-sm text-muted-foreground">Start saving today!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savingsEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                      <div className="text-right">
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