import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, BookOpen, Video, Plus, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  teams: any[];
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const DashboardSidebar = ({
  teams,
  selectedTeam,
  onTeamSelect,
  currentView,
  onViewChange,
}: DashboardSidebarProps) => {
  const menuItems = [
    { id: "calendar", label: "Calendrier", icon: Calendar },
    { id: "strategies", label: "Stratégies", icon: BookOpen },
    { id: "players", label: "Équipe", icon: Users },
    { id: "coaching", label: "Coaching", icon: Video },
    { id: "profile", label: "Profil", icon: User },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  const currentTeam = teams.find(team => team.id === selectedTeam);

  return (
    <div className="sidebar-apple fixed left-0 top-0 h-full w-72 p-6 space-y-8">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Shadow Hub</h1>
          <p className="text-xs text-muted-foreground">Esport Manager</p>
        </div>
      </div>

      {/* Team Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Équipe active
        </label>
        {teams.length > 0 ? (
          <Select value={selectedTeam || ""} onValueChange={onTeamSelect}>
            <SelectTrigger className="rounded-xl border-border/50 bg-card hover:bg-accent/50 transition-colors">
              <SelectValue placeholder="Sélectionner une équipe" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 bg-card shadow-dropdown">
              {teams.map((team) => (
                <SelectItem 
                  key={team.id} 
                  value={team.id}
                  className="rounded-lg mx-1 my-0.5"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{team.nom}</span>
                    <span className="text-xs text-muted-foreground">({team.jeu.replace('_', ' ')})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
            Aucune équipe créée
          </div>
        )}
      </div>

      {/* Current Team Info */}
      {currentTeam && (
        <div className="card-apple p-4">
          <h3 className="font-semibold text-base">{currentTeam.nom}</h3>
          <p className="text-sm text-muted-foreground capitalize mt-1">
            {currentTeam.jeu.replace('_', ' ')}
          </p>
          <div className="flex items-center mt-3 space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Équipe active</span>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground mb-3">
          Navigation
        </div>
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start rounded-xl h-11 font-medium transition-all duration-200",
              currentView === item.id 
                ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onViewChange(item.id)}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          Actions rapides
        </div>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start rounded-xl border-border/50 hover:bg-accent/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle équipe
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start rounded-xl border-border/50 hover:bg-accent/50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>
    </div>
  );
};