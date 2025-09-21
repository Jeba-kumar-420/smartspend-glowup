import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SpendingChart } from "./SpendingChart";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { PiggyBank, Plus, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

interface DailySaving {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export const DailySavingsTracker = () => {
  const [savingAmount, setSavingAmount] = useState("");
  const [savingNote, setSavingNote] = useState("");
  const [dailySavings, setDailySavings] = useState<DailySaving[]>(() => {
    const saved = localStorage.getItem('smartspend_daily_savings');
    return saved ? JSON.parse(saved) : [];
  });

  const { formatCurrency } = useApp();
  const { toast } = useToast();

  const addDailySaving = () => {
    const amount = parseFloat(savingAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid saving amount.",
        variant: "destructive",
      });
      return;
    }

    const newSaving: DailySaving = {
      id: Date.now().toString(),
      amount,
      date: new Date().toISOString(),
      note: savingNote.trim() || undefined,
    };

    const updatedSavings = [newSaving, ...dailySavings].slice(0, 50); // Keep last 50 entries
    setDailySavings(updatedSavings);
    localStorage.setItem('smartspend_daily_savings', JSON.stringify(updatedSavings));

    // Reset form
    setSavingAmount("");
    setSavingNote("");

    toast({
      title: "Saving recorded",
      description: `Added ${formatCurrency(amount)} to your daily savings.`,
    });
  };

  const savingsChartData = useMemo(() => {
    // Generate chart data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Get savings for this day
      const daySavings = dailySavings.filter(saving => 
        format(new Date(saving.date), 'yyyy-MM-dd') === dateStr
      );
      
      const amount = daySavings.reduce((sum, saving) => sum + saving.amount, 0);
      
      // Format day label
      let day: string;
      if (i === 6) {
        day = 'Today';
      } else if (i === 5) {
        day = 'Yesterday';
      } else {
        day = format(date, 'EEE');
      }

      return {
        date: dateStr,
        amount,
        day,
        category: 'savings',
      };
    });

    return last7Days;
  }, [dailySavings]);

  const totalSavings = dailySavings.reduce((sum, saving) => sum + saving.amount, 0);
  const thisWeekSavings = dailySavings
    .filter(saving => {
      const savingDate = new Date(saving.date);
      const weekAgo = subDays(new Date(), 7);
      return savingDate >= weekAgo;
    })
    .reduce((sum, saving) => sum + saving.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-success/10 text-success-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Daily Savings Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {formatCurrency(totalSavings)}
              </div>
              <div className="text-sm text-muted-foreground">Total Saved</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-info">
                {formatCurrency(thisWeekSavings)}
              </div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>

          {/* Add Saving Form */}
          <div className="space-y-4 p-4 border rounded-lg bg-background">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="saving-amount">Amount Saved Today</Label>
                <Input
                  id="saving-amount"
                  type="number"
                  placeholder="0.00"
                  value={savingAmount}
                  onChange={(e) => setSavingAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saving-note">Note (Optional)</Label>
                <Input
                  id="saving-note"
                  placeholder="e.g., skipped coffee"
                  value={savingNote}
                  onChange={(e) => setSavingNote(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={addDailySaving} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Record Saving
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Savings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Savings Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-4">
            <SpendingChart data={savingsChartData} showAverage={true} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Savings */}
      {dailySavings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dailySavings.slice(0, 10).map((saving) => (
                <div
                  key={saving.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(saving.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {saving.note && (
                      <p className="text-sm text-muted-foreground">
                        {saving.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-success">
                      +{formatCurrency(saving.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};