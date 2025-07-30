import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { LogOut, Settings, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileSettings } from "./ProfileSettings";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
  currentTeam?: any;
}

export const DashboardHeader = ({ user, onLogout, currentTeam }: DashboardHeaderProps) => {
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      loadUserAvatar();
    }
  }, [user]);

  const loadUserAvatar = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("photo_profil")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading avatar:", error);
      } else if (data?.photo_profil) {
        setAvatarUrl(data.photo_profil);
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
    }
  };

  return (
    <header className="glass h-16 border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <h1 className="text-lg font-semibold">
            {currentTeam?.nom || "Dashboard"}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-9 h-9 p-0 hover:bg-accent/60"
        >
          <Bell className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-full w-9 h-9 p-0 hover:bg-accent/60"
          onClick={() => setShowProfileSettings(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.user_metadata?.pseudo || "Utilisateur"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-gradient-brand text-white font-medium text-sm">
              {(user?.user_metadata?.pseudo || user?.email)?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogout}
          className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <Dialog open={showProfileSettings} onOpenChange={setShowProfileSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
    </header>
  );
};