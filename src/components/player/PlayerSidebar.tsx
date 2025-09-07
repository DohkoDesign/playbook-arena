import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, BookOpen, Video, Settings, Target, TrendingUp, User, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlayerSidebarProps {
  teamData: any;
  currentView: string;
  onViewChange: (view: string) => void;
  userId?: string;
  userName?: string;
}

export const PlayerSidebar = ({
  teamData,
  currentView,
  onViewChange,
  userId,
  userName,
}: PlayerSidebarProps) => {
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!userId) return;
      
      try {
        const { data } = await supabase
          .from("profiles")
          .select("photo_profil")
          .eq("user_id", userId)
          .single();

        if (data?.photo_profil) {
          setUserAvatar(data.photo_profil);
        }
      } catch (error) {
        console.log("Could not load user avatar:", error);
      }
    };

    loadUserAvatar();
  }, [userId]);
  // Navigation pour les joueurs avec sections personnelles
  const navigationSections = [
    {
      title: "Navigation",
      items: [
        { id: "dashboard", label: "Dashboard", icon: TrendingUp },
        { id: "calendar", label: "Calendrier", icon: Calendar },
      ]
    },
    {
      title: "Mon Espace",
      items: [
        { id: "fiche", label: "Ma Fiche", icon: User },
        { id: "objectives", label: "Mes Objectifs", icon: Target },
        { id: "planning", label: "Planning Personnel", icon: Calendar },
        { id: "feedback", label: "Mes Feedbacks", icon: MessageSquare },
      ]
    },
    {
      title: "Équipe",
      items: [
        { id: "team-availabilities", label: "Disponibilités équipe", icon: Clock },
        { id: "team-coaching", label: "Coaching", icon: Video },
      ]
    }
  ];
  
  // Utiliser les données de l'équipe
  const teamLogo = teamData?.logo;
  const teamName = teamData?.nom || "Équipe non assignée";

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
    <div className="sidebar-apple fixed left-0 top-0 h-full w-72 p-6 space-y-6">
      {/* Header avec photo de profil joueur */}
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10 ring-2 ring-border">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-gradient-brand text-white font-medium">
            {userName ? userName.charAt(0).toUpperCase() : "J"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{userName || "Joueur"}</h1>
          <p className="text-xs text-muted-foreground">Joueur</p>
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
            {teamData ? getGameDisplayName(teamData.jeu) : "Esport Manager"}
          </p>
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