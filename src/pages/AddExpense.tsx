import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useExpenses } from "@/hooks/useExpenses";
import { useProfile } from "@/hooks/useProfile";
import { SavingsGoals } from "@/components/SavingsGoals";
import { ExpenseFilters } from "@/components/ExpenseFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Receipt } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CSVExport } from "@/components/CSVExport";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { motion, AnimatePresence } from "framer-motion";

const AddExpense = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [recurringInterval, setRecurringInterval] = useState("none");
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { addExpense } = useExpenses();
  const { profile } = useProfile();

  const formatCurrency = (amount: number) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CNY: '¥', CAD: 'C$', AUD: 'A$'
    };
    const symbol = currencySymbols[profile?.currency || 'USD'] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const categories = [
    { value: "food", label: "Food & Dining", icon: "🍕" },
    { value: "transport", label: "Transportation", icon: "🚗" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
    { value: "bills", label: "Bills & Utilities", icon: "💡" },
    { value: "health", label: "Healthcare", icon: "🏥" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "travel", label: "Travel", icon: "✈️" },
    { value: "other", label: "Other", icon: "📝" },
  ];

  const handleSave = async () => {
    if (!amount || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in the amount and category.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    // Add expense using hook
    await addExpense({
      amount: numericAmount,
      category,
      notes: notes,
      date: format(date, 'yyyy-MM-dd'),
      recurringInterval,
      source: 'manual',
    });

    const selectedCategory = categories.find(cat => cat.value === category);
    toast({
      title: "Expense saved successfully!",
      description: `Added ${formatCurrency(numericAmount)} for ${selectedCategory?.label || category}`,
    });

    // Reset form
    setAmount("");
    setCategory("");
    setNotes("");
    setRecurringInterval("none");
    setDate(new Date());
    
    // Navigate back to dashboard
    navigate("/");
  };

  const handleReceiptScan = (expenseData: any) => {
    setAmount(expenseData.amount.toString());
    setCategory(expenseData.category);
    setDate(new Date(expenseData.date));
    setNotes(expenseData.notes);
    setRecurringInterval('none');
    setShowReceiptScanner(false);
    
    toast({
      title: "Receipt data loaded!",
      description: "Review and save the extracted expense details",
    });
  };

  const handleSaveReceiptExpense = async (expenseData: any) => {
    try {
      await addExpense({
        amount: expenseData.amount,
        category: expenseData.category,
        notes: expenseData.notes,
        date: expenseData.date,
        recurringInterval: 'none',
        source: expenseData.source,
        ocrRaw: expenseData.ocrRaw,
        ocrParsed: expenseData.ocrParsed,
      });

      toast({
        title: "Receipt expense saved!",
        description: `Added ₹${expenseData.amount} from receipt scan`,
      });

      setShowReceiptScanner(false);
      navigate("/");
    } catch (error) {
      toast({
        title: "Failed to save expense",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">Add Expense</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Record your spending and track your budget</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">New Expense</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReceiptScanner(true)}
                  className="flex items-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Scan Receipt
                </Button>
              </div>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16"
                  step="0.01"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {profile?.currency || 'USD'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MM/dd/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurring">Recurring</Label>
              <Select value={recurringInterval} onValueChange={setRecurringInterval}>
                <SelectTrigger>
                  <SelectValue placeholder="Select repeat frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Expense
              </Button>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Expense Filters */}
        <ExpenseFilters />

        {/* Export Options */}
        <Card className="max-w-md mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <CSVExport />
          </CardContent>
        </Card>
      </main>

      <AnimatePresence>
        {showReceiptScanner && (
          <ReceiptScanner
            onSave={handleSaveReceiptExpense}
            onClose={() => setShowReceiptScanner(false)}
          />
        )}
      </AnimatePresence>

      <BottomNavigation />
    </div>
  );
};

export default AddExpense;