import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, BookOpen, Video, Plus, Settings, UserSearch, MessageSquare, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  teams: any[];
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
  currentView: string;
  onViewChange: (view: string) => void;
  onNewTeam: () => void;
}

export const DashboardSidebar = ({
  teams,
  selectedTeam,
  onTeamSelect,
  currentView,
  onViewChange,
  onNewTeam,
}: DashboardSidebarProps) => {
  // Navigation organisée par catégories
  const navigationSections = [
    {
      title: "Navigation",
      items: [
        { id: "dashboard", label: "Dashboard", icon: TrendingUp },
      ]
    },
    {
      title: "Équipe",
      items: [
        { id: "calendar", label: "Calendrier", icon: Calendar },
        { id: "players", label: "Membres", icon: Users },
        { id: "strategies", label: "Stratégies", icon: BookOpen },
      ]
    },
    {
      title: "Coaching & Analyse",
      items: [
        { id: "coaching-analysis", label: "Analyses VOD", icon: Video },
        { id: "match-analysis", label: "Post-Match", icon: BarChart3 },
      ]
    },
    {
      title: "Communication",
      items: [
        { id: "feedbacks", label: "Feedbacks Joueurs", icon: MessageSquare },
        { id: "availabilities", label: "Disponibilités", icon: Clock },
      ]
    },
    {
      title: "Gestion",
      items: [
        { id: "recruitment", label: "Recrutement", icon: UserSearch },
        { id: "settings", label: "Paramètres", icon: Settings },
      ]
    }
  ];
  
  const currentTeamData = teams.find(team => team.id === selectedTeam);
  
  // Récupérer le logo de l'organisation depuis localStorage
  const organizationLogo = localStorage.getItem("organization_logo");
  const organizationName = localStorage.getItem("organization_name") || "Esport Manager";

  // Obtenir le nom du jeu pour l'équipe
  const getGameDisplayName = (gameType: string) => {
    const gameNames: {[key: string]: string} = {
      'valorant': 'Valorant',
      'rocket_league': 'Rocket League',
      'league_of_legends': 'League of Legends',
      'counter_strike': 'CS2',
      'overwatch': 'Overwatch 2',
      'apex_legends': 'Apex Legends',
      'call_of_duty': 'Call of Duty'
    };
    return gameNames[gameType] || gameType;
  };

  return (
    <div className="sidebar-apple fixed left-0 top-0 h-full w-72 p-6 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-8">
        {/* Header avec logo de l'organisation */}
        <div className="flex items-center space-x-3">
          {organizationLogo ? (
            <img 
              src={organizationLogo} 
              alt="Logo de l'organisation" 
              className="w-10 h-10 rounded-2xl object-cover shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">EM</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{organizationName}</h1>
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
              <SelectTrigger className="nav-item">
                <SelectValue placeholder="Sélectionner une équipe">
                  {currentTeamData ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-brand rounded-lg flex items-center justify-center text-white text-xs font-medium">
                        {currentTeamData.nom.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{currentTeamData.nom}</span>
                    </div>
                  ) : (
                    "Sélectionner une équipe"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-brand rounded flex items-center justify-center text-white text-xs font-medium">
                        {team.nom.charAt(0).toUpperCase()}
                      </div>
                      <span>{team.nom}</span>
                    </div>
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
      </div>

      {/* Navigation scrollable */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="space-y-6 py-4">
          <nav className="space-y-6">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                          "nav-item w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-gradient-subtle text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Séparateur entre les sections (sauf pour la dernière) */}
                {sectionIndex < navigationSections.length - 1 && (
                  <div className="pt-2">
                    <div className="h-px bg-border/50"></div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Create Team Button - fixe en bas */}
      <div className="flex-shrink-0 pt-4 border-t border-border/50">
        <Button 
          onClick={onNewTeam}
          className="w-full justify-start space-x-2"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle équipe</span>
        </Button>
      </div>
    </div>
  );
};