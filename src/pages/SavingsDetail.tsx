import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, TrendingUp, Calendar, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SavingsDetail = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [goalAmount, setGoalAmount] = useState("1000");
  const [currentSavings, setCurrentSavings] = useState("250");
  const [monthlyContribution, setMonthlyContribution] = useState("100");
  const [isEditing, setIsEditing] = useState(false);

  const categoryData = {
    daily: { title: "Daily Savings", color: "emerald", emoji: "💰" },
    goal: { title: "Goal Savings", color: "blue", emoji: "🎯" },
    emergency: { title: "Emergency Fund", color: "orange", emoji: "🏠" },
    travel: { title: "Travel Fund", color: "purple", emoji: "✈️" },
    education: { title: "Education", color: "indigo", emoji: "📚" },
    shopping: { title: "Shopping", color: "pink", emoji: "🎁" },
  };

  const currentCategory = categoryData[category as keyof typeof categoryData] || categoryData.daily;
  const progress = (Number(currentSavings) / Number(goalAmount)) * 100;
  const remaining = Number(goalAmount) - Number(currentSavings);
  const monthsToGoal = Math.ceil(remaining / Number(monthlyContribution));

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Settings updated",
      description: `${currentCategory.title} goals have been saved.`,
    });
  };

  const handleBack = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-2xl">{currentCategory.emoji}</span>
                {currentCategory.title}
              </h1>
              <p className="text-muted-foreground">Manage your savings goal</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Progress Overview
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">${currentSavings}</p>
                    <p className="text-sm text-muted-foreground">Current Savings</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-accent-foreground">${goalAmount}</p>
                    <p className="text-sm text-muted-foreground">Goal Amount</p>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    ${remaining.toFixed(2)} remaining
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    {monthsToGoal} months to goal
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Goal Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal Amount ($)</Label>
                  <Input
                    id="goal"
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current">Current Savings ($)</Label>
                  <Input
                    id="current"
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly">Monthly Contribution ($)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <Button onClick={handleSave} className="w-full">
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Estimated completion</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Weekly savings needed</span>
                  </div>
                  <span className="text-sm font-medium">
                    ${(Number(monthlyContribution) / 4).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavingsDetail;