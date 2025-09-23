import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Calendar } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface ExpenseFiltersProps {
  onFilteredExpensesChange?: (expenses: any[]) => void;
}

export const ExpenseFilters = ({ onFilteredExpensesChange }: ExpenseFiltersProps) => {
  const { expenses } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "Food & Dining" },
    { value: "transport", label: "Transportation" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "bills", label: "Bills & Utilities" },
    { value: "health", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "travel", label: "Travel" },
    { value: "other", label: "Other" },
  ];

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "month", label: "This Month" },
    { value: "30days", label: "Last 30 Days" },
    { value: "week", label: "This Week" },
  ];

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Text search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        (expense.note && expense.note.toLowerCase().includes(search)) ||
        expense.category.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case "month":
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "30days":
          startDate.setDate(now.getDate() - 30);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
      }

      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate;
      });
    }

    // Notify parent component of filtered results
    onFilteredExpensesChange?.(filtered);
    
    return filtered;
  }, [expenses, searchTerm, selectedCategory, dateRange, onFilteredExpensesChange]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setDateRange("all");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by notes or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {range.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Summary & Clear */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </span>
          {(searchTerm || selectedCategory !== "all" || dateRange !== "all") && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};