import { Switch } from "@/components/ui/switch";
import { ProfileDropdown } from "./ProfileDropdown";
import { CurrencySelector } from "./CurrencySelector";
import { Receipt, Moon, Sun } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
              <Receipt className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SmartSpend</h1>
              <p className="text-sm text-muted-foreground">Track your expenses smartly</p>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <CurrencySelector />
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={onToggleDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};