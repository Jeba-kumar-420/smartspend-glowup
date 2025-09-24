import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ProfileModal } from "./ProfileModal";

export const ProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  const handleLogoutClick = async () => {
    await signOut();
    navigate('/auth');
    setIsOpen(false);
  };

  if (!user) {
    return (
      <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
        <AvatarFallback className="bg-muted text-muted-foreground">
          <UserCircle className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <>
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
          <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {profile?.full_name ? getInitials(profile.full_name) : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg">
        <div className="flex items-center space-x-2 p-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {profile?.full_name ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-foreground">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
};