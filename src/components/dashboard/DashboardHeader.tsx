import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User } from "@supabase/supabase-js";
import { LogOut, Settings, Bell } from "lucide-react";

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  return (
    <header className="glass h-16 border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
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

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.user_metadata?.pseudo || "Utilisateur"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          
          <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white font-medium text-sm">
            {(user?.user_metadata?.pseudo || user?.email)?.charAt(0).toUpperCase()}
          </div>
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
    </header>
  );
};