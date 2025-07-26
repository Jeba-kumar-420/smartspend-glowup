import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpendingChart } from "./SpendingChart";
import { User, Plus, History, Download } from "lucide-react";

// Mock data for the chart
const mockSpendingData = [
  { day: "Sun", date: "Dec 15", amount: 0, category: "food" },
  { day: "Mon", date: "Dec 16", amount: 0, category: "transport" },
  { day: "Tue", date: "Dec 17", amount: 0, category: "entertainment" },
  { day: "Wed", date: "Dec 18", amount: 0, category: "shopping" },
  { day: "Thu", date: "Dec 19", amount: 0, category: "bills" },
  { day: "Fri", date: "Dec 20", amount: 0, category: "food" },
  { day: "Sat", date: "Dec 21", amount: 0, category: "other" },
];

export const Dashboard = () => {
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
                Welcome to SmartSpend!
              </h2>
              <p className="text-muted-foreground">
                Track your expenses and manage your budget effectively
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">$0.00</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">$0.00</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">$0.00</div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Chart */}
      <SpendingChart data={mockSpendingData} showAverage={true} />

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          className="h-12 bg-success hover:bg-success/90 text-success-foreground"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Expense
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="outline" className="h-12">
            <Download className="mr-2 h-4 w-4" />
            Report
          </Button>
        </div>
      </div>
    </div>
  );
};