import React from "react";
import { Switch } from "@/components/ui/switch";
import { ProfileDropdown } from "./ProfileDropdown";
import { CurrencySelector } from "./CurrencySelector";
import { NotificationBell } from "./NotificationBell";
import { Receipt, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-primary p-2 rounded-lg">
              <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">SmartSpend</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Track your expenses smartly</p>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Currency Selector */}
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>
            
            {/* Notifications Bell */}
            {user && <NotificationBell />}
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={onToggleDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </div>

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};