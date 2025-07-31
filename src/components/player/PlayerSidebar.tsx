import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, BookOpen, Video, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerSidebarProps {
  teamData: any;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const PlayerSidebar = ({
  teamData,
  currentView,
  onViewChange,
}: PlayerSidebarProps) => {
  // Navigation pour les joueurs (sans recrutement et sans créer nouvelle équipe)
  const navigationSections = [
    {
      title: "Navigation",
      items: [
        { id: "calendar", label: "Calendrier", icon: Calendar },
      ]
    },
    {
      title: "Équipe",
      items: [
        { id: "players", label: "Membres", icon: Users },
        { id: "strategies", label: "Stratégies", icon: BookOpen },
        { id: "coaching", label: "Coaching", icon: Video },
      ]
    },
    {
      title: "Profil",
      items: [
        { id: "profile", label: "Mon Profil", icon: Settings },
      ]
    }
  ];
  
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
    <div className="sidebar-apple fixed left-0 top-0 h-full w-72 p-6 space-y-8">
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

      {/* Team Info (read-only) */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Mon équipe
        </label>
        {teamData ? (
          <div className="nav-item px-3 py-2.5 bg-accent/30 border border-border/50 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-brand rounded-lg flex items-center justify-center text-white text-xs font-medium">
                {teamData.nom.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="truncate text-sm font-medium">{teamData.nom}</span>
                <p className="text-xs text-muted-foreground">
                  {getGameDisplayName(teamData.jeu)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Aucune équipe assignée
          </div>
        )}
      </div>

      {/* Navigation par sections */}
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
  );
};