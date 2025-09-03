import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@supabase/supabase-js";
import { LogOut, Settings, Shield, UserCog } from "lucide-react";
import { ProfileSettings } from "./ProfileSettings";
import { NotificationCenter } from "./NotificationCenter";
import { TeamSettingsView } from "./TeamSettingsView";
import { supabase } from "@/integrations/supabase/client";
import { getGameConfig } from "@/data/gameConfigs";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
  currentTeam?: any;
}

export const DashboardHeader = ({ user, onLogout, currentTeam }: DashboardHeaderProps) => {
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();
  
  const gameConfig = currentTeam?.jeu ? getGameConfig(currentTeam.jeu) : null;
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.email === 'dohkoworld@gmail.com';

  useEffect(() => {
    if (user) {
      loadUserAvatar();
    }
  }, [user]);

  const loadUserAvatar = async () => {
    if (!user) return;
    
    console.log("🖼️ Loading user avatar for:", user.id);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("photo_profil")
        .eq("user_id", user.id)
        .single();

      console.log("📸 Avatar query result:", { data, error });

      if (error && error.code !== "PGRST116") {
        console.error("Error loading avatar:", error);
      } else if (data?.photo_profil) {
        console.log("✅ Setting avatar URL:", data.photo_profil);
        setAvatarUrl(data.photo_profil);
      } else {
        console.log("❌ No avatar found in profile");
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
    }
  };

  return (
    <header className="glass h-16 border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Left section - Title and actions */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <div>
            <h1 className="text-lg font-semibold">
              {currentTeam?.nom || "Dashboard"}
            </h1>
            {gameConfig && (
              <p className="text-xs text-muted-foreground">
                {gameConfig.name}
              </p>
            )}
          </div>
        </div>
        </div>

      {/* Right section - Actions and User avatar */}
      <div className="flex items-center space-x-4">
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {user && currentTeam && (
            <NotificationCenter 
              teamId={currentTeam.id} 
              userId={user.id} 
            />
          )}
        </div>
        
        {/* User avatar with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
              <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-800">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-gradient-brand text-white font-medium text-sm">
                  {(user?.user_metadata?.pseudo || user?.email)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-background border-border shadow-lg z-50" align="end" forceMount>
            <DropdownMenuItem 
              onClick={() => setShowProfileSettings(true)}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres du profil</span>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem 
                onClick={() => navigate('/admin')}
                className="cursor-pointer"
              >
                <UserCog className="mr-2 h-4 w-4" />
                <span>Administration</span>
              </DropdownMenuItem>
            )}
            {currentTeam && currentTeam.created_by === user?.id && (
              <DropdownMenuItem 
                onClick={() => setShowTeamSettings(true)}
                className="cursor-pointer"
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>Paramètres de l'équipe</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showProfileSettings} onOpenChange={setShowProfileSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle>Paramètres du profil</DialogTitle>
          </DialogHeader>
          <ProfileSettings 
            user={user} 
            onProfileUpdate={() => {
              loadUserAvatar(); // Recharger l'avatar après mise à jour
            }} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showTeamSettings} onOpenChange={setShowTeamSettings}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle>Paramètres de l'équipe</DialogTitle>
          </DialogHeader>
          {currentTeam && (
            <TeamSettingsView 
              teamId={currentTeam.id}
              gameType={currentTeam.jeu}
              teams={[currentTeam]}
              onTeamUpdated={() => {
                // Recharger les données de l'équipe si nécessaire
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
};