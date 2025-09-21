import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <Dashboard />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Index;
