import { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { profile, updateProfile, loading } = useProfile();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [currency, setCurrency] = useState(profile?.currency || "USD");
  const [isEditing, setIsEditing] = useState(false);

  const currencies = [
    { value: "USD", label: "$", name: "US Dollar" },
    { value: "EUR", label: "€", name: "Euro" },
    { value: "GBP", label: "£", name: "British Pound" },
    { value: "INR", label: "₹", name: "Indian Rupee" },
    { value: "JPY", label: "¥", name: "Japanese Yen" },
    { value: "CNY", label: "¥", name: "Chinese Yuan" },
    { value: "CAD", label: "C$", name: "Canadian Dollar" },
    { value: "AUD", label: "A$", name: "Australian Dollar" },
  ];

  const handleSave = async () => {
    await updateProfile({
      full_name: fullName,
      currency: currency,
    });
    setIsEditing(false);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just show a toast - file upload to Supabase storage would be implemented later
      toast({
        title: "Feature coming soon",
        description: "Avatar upload will be available in the next update.",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">Profile</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Upload className="h-4 w-4" />
                      Change Avatar
                    </div>
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">Preferred Currency</Label>
                <Select value={currency} onValueChange={setCurrency} disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{curr.label}</span>
                          <span>{curr.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(profile?.full_name || "");
                        setCurrency(profile?.currency || "USD");
                      }} 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={loading} 
                      className="flex-1"
                    >
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;