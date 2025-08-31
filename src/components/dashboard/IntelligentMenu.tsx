import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Target, 
  TrendingUp, 
  MapPin, 
  MessageSquare, 
  Settings, 
  UserPlus,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlayCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IntelligentMenuProps {
  teamId: string;
  gameType?: string;
  isStaff?: boolean;
  onViewChange: (view: string) => void;
  currentView: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  badge?: string;
  priority: 'high' | 'medium' | 'low';
  notifications?: number;
}

export const IntelligentMenu = ({ teamId, gameType, isStaff = true, onViewChange, currentView }: IntelligentMenuProps) => {
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateIntelligentMenu();
  }, [teamId, isStaff]);

  const generateIntelligentMenu = async () => {
    try {
      setLoading(true);

      // Récupérer les données pour personnaliser le menu
      const [eventsRes, membersRes, strategiesRes] = await Promise.all([
        supabase.from("events").select("*").eq("team_id", teamId).gte("date_debut", new Date().toISOString()),
        supabase.from("team_members").select("*").eq("team_id", teamId),
        supabase.from("strategies").select("*").eq("team_id", teamId)
      ]);

      const upcomingEvents = eventsRes.data?.length || 0;
      const memberCount = membersRes.data?.length || 0;
      const strategyCount = strategiesRes.data?.length || 0;

      if (isStaff) {
        setMenuSections(generateStaffMenu(upcomingEvents, memberCount, strategyCount));
      } else {
        setMenuSections(generatePlayerMenu(upcomingEvents, memberCount, strategyCount));
      }
    } catch (error) {
      console.error("Erreur lors de la génération du menu intelligent:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateStaffMenu = (events: number, members: number, strategies: number): MenuSection[] => {
    return [
      {
        title: "Gestion d'équipe",
        items: [
          {
            id: "calendar",
            title: "Calendrier",
            description: `${events} événements à venir`,
            icon: Calendar,
            badge: events > 0 ? String(events) : undefined,
            priority: events === 0 ? 'high' : 'medium',
            notifications: events > 5 ? 1 : 0
          },
          {
            id: "players",
            title: "Joueurs",
            description: `${members} membres dans l'équipe`,
            icon: Users,
            badge: members < 5 ? 'Incomplet' : 'Complet',
            priority: members < 5 ? 'high' : 'low',
            notifications: members < 5 ? 1 : 0
          },
          {
            id: "recruitment",
            title: "Recrutement",
            description: "Inviter de nouveaux joueurs",
            icon: UserPlus,
            priority: members < 5 ? 'high' : 'low'
          }
        ]
      },
      {
        title: "Stratégie & Performance",
        items: [
          {
            id: "strategies",
            title: "Stratégies",
            description: `${strategies} stratégies créées`,
            icon: MapPin,
            badge: strategies === 0 ? 'Nouveau' : undefined,
            priority: strategies === 0 ? 'high' : 'medium'
          },
          {
            id: "coaching",
            title: "Analyses",
            description: "Analyser les performances",
            icon: TrendingUp,
            priority: 'medium'
          },
          {
            id: "feedbacks",
            title: "Feedback",
            description: "Retours des joueurs",
            icon: MessageSquare,
            priority: 'low'
          }
        ]
      },
      {
        title: "Administration",
        items: [
          {
            id: "availabilities",
            title: "Disponibilités",
            description: "Gérer les créneaux",
            icon: Clock,
            priority: 'low'
          },
          {
            id: "settings",
            title: "Paramètres",
            description: "Configuration équipe",
            icon: Settings,
            priority: 'low'
          }
        ]
      }
    ];
  };

  const generatePlayerMenu = (events: number, members: number, strategies: number): MenuSection[] => {
    return [
      {
        title: "Mon Espace",
        items: [
          {
            id: "calendar",
            title: "Mon Calendrier",
            description: `${events} événements à venir`,
            icon: Calendar,
            badge: events > 0 ? String(events) : undefined,
            priority: 'high',
            notifications: events > 0 ? 1 : 0
          },
          {
            id: "fiche",
            title: "Ma Fiche",
            description: "Profil et statistiques",
            icon: Users,
            priority: 'medium'
          },
          {
            id: "objectives",
            title: "Mes Objectifs",
            description: "Objectifs personnels",
            icon: Target,
            priority: 'high'
          },
          {
            id: "performance",
            title: "Performances",
            description: "Mes statistiques",
            icon: BarChart3,
            priority: 'medium'
          }
        ]
      },
      {
        title: "Équipe",
        items: [
          {
            id: "team-strategies",
            title: "Stratégies",
            description: `${strategies} stratégies disponibles`,
            icon: MapPin,
            priority: 'medium'
          },
          {
            id: "team-coaching",
            title: "Analyses",
            description: "Voir les analyses",
            icon: PlayCircle,
            priority: 'medium'
          },
          {
            id: "feedback",
            title: "Mon Feedback",
            description: "Retours reçus",
            icon: MessageSquare,
            priority: 'low'
          }
        ]
      },
      {
        title: "Développement",
        items: [
          {
            id: "planning",
            title: "Mon Planning",
            description: "Planification personnelle",
            icon: Clock,
            priority: 'low'
          }
        ]
      }
    ];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-orange';
      case 'medium': return 'text-primary';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-8 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {menuSections.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {section.items.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={`w-full justify-start h-auto p-3 ${
                    currentView === item.id ? 'bg-primary/10 border-primary/20' : ''
                  }`}
                  onClick={() => onViewChange(item.id)}
                >
                  <div className="flex items-center w-full">
                    <div className="flex items-center gap-3 flex-1">
                      <item.icon className={`h-4 w-4 ${getPriorityColor(item.priority)}`} />
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.title}</span>
                          {item.notifications && item.notifications > 0 && (
                            <Badge variant="destructive" className="px-1 py-0 text-xs h-4 min-w-4">
                              {item.notifications}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={getPriorityBadgeVariant(item.priority)}
                        className="ml-2 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};