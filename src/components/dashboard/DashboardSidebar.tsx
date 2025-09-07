import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, BookOpen, Video, Plus, UserSearch, MessageSquare, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardSidebarProps {
  teams: any[];
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
  currentView: string;
  onViewChange: (view: string) => void;
  onNewTeam: () => void;
  currentUserId?: string;
  userName?: string;
}

export const DashboardSidebar = ({
  teams,
  selectedTeam,
  onTeamSelect,
  currentView,
  onViewChange,
  onNewTeam,
  currentUserId,
  userName,
}: DashboardSidebarProps) => {
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!currentUserId) return;
      
      try {
        const { data } = await supabase
          .from("profiles")
          .select("photo_profil")
          .eq("user_id", currentUserId)
          .single();

        if (data?.photo_profil) {
          setUserAvatar(data.photo_profil);
        }
      } catch (error) {
        console.log("Could not load user avatar:", error);
      }
    };

    loadUserAvatar();
  }, [currentUserId]);
  // Définir d'abord les variables nécessaires
  const currentTeamData = teams.find(team => team.id === selectedTeam);
  const isTeamOwner = currentTeamData && currentUserId && currentTeamData.created_by === currentUserId;
  
  // Navigation organisée par catégories - défini après isTeamOwner
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
      ]
    },
    {
      title: "Coaching & Analyse",
      items: [
        { id: "match-analysis", label: "Post-Match", icon: BarChart3 },
        { id: "coaching-analysis", label: "Analyse VOD", icon: Video },
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
        { id: "recruitment", label: "Recrutement", icon: UserSearch }
      ]
    }
  ];
  
  // Utiliser les données de l'équipe courante
  const teamLogo = currentTeamData?.logo;
  const teamName = currentTeamData?.nom || "Équipe non sélectionnée";

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
      <div className="flex-shrink-0 space-y-6">
        {/* Header avec photo de profil utilisateur */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-border">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-gradient-brand text-white font-medium">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{userName || "Utilisateur"}</h1>
            <p className="text-xs text-muted-foreground">Staff Manager</p>
          </div>
        </div>

        {/* Team info */}
        <div className="flex items-center space-x-3 p-3 bg-accent/30 rounded-xl border border-border/50">
          {teamLogo ? (
            <img 
              src={teamLogo} 
              alt={`Logo de ${teamName}`} 
              className="w-8 h-8 rounded-xl object-cover shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">
                {teamName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-sm font-medium">{teamName}</h2>
            <p className="text-xs text-muted-foreground">
              {currentTeamData ? getGameDisplayName(currentTeamData.jeu) : "Esport Manager"}
            </p>
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