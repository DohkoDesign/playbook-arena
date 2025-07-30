import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Calendar,
  User,
  PlayCircle,
  BookOpen,
  MessageSquare,
  Gamepad2,
  Users
} from "lucide-react";

type PlayerView = "calendar" | "profile" | "reviews" | "strategies" | "feedback";

interface PlayerSidebarProps {
  currentView: PlayerView;
  onViewChange: (view: PlayerView) => void;
  teamName: string;
  gameName: string;
  playerRole: string;
}

export const PlayerSidebar = ({ 
  currentView, 
  onViewChange, 
  teamName, 
  gameName, 
  playerRole 
}: PlayerSidebarProps) => {
  const menuItems = [
    {
      id: "calendar" as PlayerView,
      label: "Calendrier",
      icon: Calendar,
      description: "Mes événements"
    },
    {
      id: "profile" as PlayerView,
      label: "Ma Fiche",
      icon: User,
      description: "Progression"
    },
    {
      id: "reviews" as PlayerView,
      label: "Reviews & VODs",
      icon: PlayCircle,
      description: "Analyses"
    },
    {
      id: "strategies" as PlayerView,
      label: "Stratégies",
      icon: BookOpen,
      description: "Playbook"
    },
    {
      id: "feedback" as PlayerView,
      label: "Feedback",
      icon: MessageSquare,
      description: "Communication"
    }
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* En-tête équipe */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center text-primary-foreground font-bold">
            {teamName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{teamName}</h2>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Gamepad2 className="w-3 h-3" />
              <span className="capitalize">{gameName}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
              <Users className="w-3 h-3" />
              <span>{playerRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  isActive && "bg-primary text-primary-foreground"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={cn(
                      "text-xs",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Interface Joueur</p>
          <p className="mt-1">Version 1.0</p>
        </div>
      </div>
    </div>
  );
};