import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings2, 
  PiggyBank, 
  Target, 
  Home, 
  Plane, 
  GraduationCap, 
  ShoppingBag,
  History,
  BarChart3,
  DollarSign,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [dailyBudget, setDailyBudget] = useState("0");
  const [notifications, setNotifications] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currency, formatCurrency } = useApp();

  const savingsCategories = [
    { id: "daily", title: "Daily Savings", description: "Track daily", icon: PiggyBank, color: "bg-emerald-100 hover:bg-emerald-200 border-emerald-200" },
    { id: "goal", title: "Goal Savings", description: "Set targets", icon: Target, color: "bg-blue-100 hover:bg-blue-200 border-blue-200" },
    { id: "emergency", title: "Emergency Fund", description: "Safety net", icon: Home, color: "bg-orange-100 hover:bg-orange-200 border-orange-200" },
    { id: "travel", title: "Travel Fund", description: "Adventures", icon: Plane, color: "bg-purple-100 hover:bg-purple-200 border-purple-200" },
    { id: "education", title: "Education", description: "Learning", icon: GraduationCap, color: "bg-indigo-100 hover:bg-indigo-200 border-indigo-200" },
    { id: "shopping", title: "Shopping", description: "Wishlist", icon: ShoppingBag, color: "bg-pink-100 hover:bg-pink-200 border-pink-200" },
  ];

  const handleSavingsClick = (categoryId: string) => {
    navigate(`/savings/${categoryId}`);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
            <Settings2 className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your experience</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Savings Options */}
          <Card>
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Savings Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {savingsCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleSavingsClick(category.id)}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${category.color}`}
                    >
                      <Icon className="w-6 h-6 mb-2 text-gray-600" />
                      <h3 className="font-semibold text-gray-800">{category.title}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
                Choose a savings category to start tracking your financial goals
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
              <CardContent className="p-4 text-center">
                <History className="w-6 h-6 mx-auto mb-2 text-accent-foreground" />
                <h3 className="font-semibold">History</h3>
                <p className="text-sm text-muted-foreground">View all expenses</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-accent-foreground" />
                <h3 className="font-semibold">Reports</h3>
                <p className="text-sm text-muted-foreground">Download data</p>
              </CardContent>
            </Card>
          </div>

          {/* Currency Settings */}
          <Card>
            <CardHeader className="bg-accent text-accent-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Currency Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Current Currency</Label>
                <div className="text-lg font-medium text-primary">
                  {currency} - {formatCurrency(0).replace('0.00', 'Format')}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Use the currency selector in the header to change your preferred currency. All amounts will be displayed in the selected format.
              </p>
            </CardContent>
          </Card>

          {/* Budget Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Daily Budget Limit ({currency})</Label>
                <Input
                  id="budget"
                  type="number"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Set to 0 to disable budget alerts
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Daily Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Show reminder to log expenses 📱
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About SmartSpend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Version:</span>
                <span className="text-sm font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Purpose:</span>
                <span className="text-sm">Student Tracker</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Features:</span>
                <span className="text-sm">Offline • PWA</span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Settings;