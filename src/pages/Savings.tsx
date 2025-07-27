import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PiggyBank, Target, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Savings = () => {
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [newSaving, setNewSaving] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { formatCurrency } = useApp();

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
    setThisMonth(prev => prev + amount);
    setNewSaving("");
    setIsDialogOpen(false);
    
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Today's Savings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Savings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newSaving}
                    onChange={(e) => setNewSaving(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddSaving} className="w-full">
                  Add Savings
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Savings History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No savings recorded yet</p>
                <p className="text-sm text-muted-foreground">Start saving today!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Savings;