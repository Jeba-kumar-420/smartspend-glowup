import { Link, useLocation } from "react-router-dom";
import { Home, Plus, PiggyBank, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/add-expense", icon: Plus, label: "Add" },
    { path: "/savings", icon: PiggyBank, label: "Savings" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 text-xs transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.path === "/add-expense" ? (
                <div className={cn(
                  "flex items-center justify-center w-12 h-8 rounded-full transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon className="w-5 h-5 mb-1" />
              )}
              {item.path !== "/add-expense" && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};