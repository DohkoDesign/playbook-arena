import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User } from "@supabase/supabase-js";
import { LogOut, Settings } from "lucide-react";

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Tableau de bord</h1>
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle />
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Connecté en tant que</span>
          <span className="font-medium">{user?.email}</span>
        </div>

        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};