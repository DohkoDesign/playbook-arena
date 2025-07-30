import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, BookOpen, Video, Plus } from "lucide-react";
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
    { id: "players", label: "Joueurs", icon: Users },
    { id: "coaching", label: "Coaching", icon: Video },
  ];

  const currentTeam = teams.find(team => team.id === selectedTeam);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-4 space-y-6">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <span className="text-xl font-semibold tracking-tight">Shadow Hub</span>
      </div>

      {/* Team Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Équipe active
        </label>
        {teams.length > 0 ? (
          <Select value={selectedTeam || ""} onValueChange={onTeamSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une équipe" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.nom} ({team.jeu})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground">
            Aucune équipe créée
          </div>
        )}
      </div>

      {/* Current Team Info */}
      {currentTeam && (
        <div className="p-3 bg-muted rounded-lg">
          <h3 className="font-medium">{currentTeam.nom}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {currentTeam.jeu.replace('_', ' ')}
          </p>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              currentView === item.id && "bg-secondary"
            )}
            onClick={() => onViewChange(item.id)}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Actions rapides
        </h4>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle équipe
        </Button>
      </div>
    </div>
  );
};