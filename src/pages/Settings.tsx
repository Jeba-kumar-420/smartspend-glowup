import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { HistorySection } from "@/components/HistorySection";
import { ReportGenerator } from "@/components/ReportGenerator";
import { DailySavingsTracker } from "@/components/DailySavingsTracker";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useExpenses } from "@/hooks/useExpenses";
import { useSavings } from "@/hooks/useSavings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Bell,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [dailyBudget, setDailyBudget] = useState("0");
  const [notifications, setNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { expenses } = useExpenses();
  const { savings } = useSavings();

  const formatCurrency = (amount: number) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CNY: '¥', CAD: 'C$', AUD: 'A$'
    };
    const symbol = currencySymbols[profile?.currency || 'USD'] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

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

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-accent/10 rounded-full mb-4">
            <Settings2 className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Customize your experience</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
              <TabsTrigger value="settings" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Settings2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Set</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <History className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">Hist</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reports</span>
                <span className="sm:hidden">Rep</span>
              </TabsTrigger>
              <TabsTrigger value="savings" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <PiggyBank className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Savings</span>
                <span className="sm:hidden">Save</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-6">
          {/* Savings Options */}
          <Card>
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PiggyBank className="w-5 h-5" />
                Savings Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                {savingsCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleSavingsClick(category.id)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-colors text-left ${category.color}`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-2 text-gray-600" />
                      <h3 className="font-semibold text-sm sm:text-base text-gray-800">{category.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{category.description}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                Choose a savings category to start tracking your financial goals
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => setActiveTab("history")}
            >
              <CardContent className="p-4 text-center">
                <History className="w-6 h-6 mx-auto mb-2 text-accent-foreground" />
                <h3 className="font-semibold">History</h3>
                <p className="text-sm text-muted-foreground">View all expenses</p>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => setActiveTab("reports")}
            >
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                Currency Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Current Currency</Label>
                <div className="text-base sm:text-lg font-medium text-primary">
                  {profile?.currency || 'USD'} - {formatCurrency(0).replace('0.00', 'Format')}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Use the currency selector in the header to change your preferred currency. All amounts will be displayed in the selected format.
              </p>
            </CardContent>
          </Card>

          {/* Budget Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm">Daily Budget Limit ({profile?.currency || 'USD'})</Label>
                <Input
                  id="budget"
                  type="number"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Set to 0 to disable budget alerts
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <Label htmlFor="notifications" className="text-sm font-medium">Daily Reminders</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
              <CardTitle className="text-lg">About SmartSpend</CardTitle>
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

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSaveSettings} className="flex-1">
                  Save Settings
                </Button>
                <Button onClick={handleLogout} variant="destructive" className="flex-1">
                  Logout
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <HistorySection />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader className="bg-accent text-accent-foreground rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="w-5 h-5" />
                    Financial Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Generate comprehensive reports of your financial data including expenses, 
                      savings, and spending patterns.
                    </p>
                    <ReportGenerator />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="savings">
              <DailySavingsTracker />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Settings;