import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Book, 
  Clock,
  ChevronRight,
  Play,
  Target,
  Star,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GuideContent } from "@/components/documentation/GuideContent";
import { getGuideById } from "@/data/guideContents";

export const Documentation = () => {
  const navigate = useNavigate();
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const guides = [
    {
      title: "Configuration initiale",
      description: "Configurez votre équipe eSport en 15 minutes et démarrez immédiatement",
      time: "15 min",
      id: "configuration-initiale",
      icon: Play,
      color: "from-primary/10 to-primary/5"
    },
    {
      title: "Premier match", 
      description: "Organisez votre première compétition avec toutes les bonnes pratiques",
      time: "10 min",
      id: "premier-match", 
      icon: Target,
      color: "from-secondary/10 to-secondary/5"
    },
    {
      title: "Analyse post-match",
      description: "Débriefing efficace et amélioration continue de vos performances",
      time: "20 min",
      id: "analyse-post-match",
      icon: Star,
      color: "from-accent/10 to-accent/5"
    },
    {
      title: "Créer votre équipe",
      description: "Guide complet pour configurer votre équipe eSport de A à Z",
      time: "5 min", 
      id: "creer-equipe",
      icon: Play,
      color: "from-primary/10 to-primary/5"
    },
    {
      title: "Inviter des joueurs",
      description: "Ajouter des membres à votre équipe et gérer les permissions",
      time: "3 min",
      id: "inviter-joueurs",
      icon: MessageSquare,
      color: "from-secondary/10 to-secondary/5"
    },
    {
      title: "Dashboard overview",
      description: "Naviguer efficacement dans l'interface principale",
      time: "8 min",
      id: "dashboard-overview", 
      icon: Target,
      color: "from-accent/10 to-accent/5"
    }
  ];

  const handleGuideSelect = (guideId: string) => {
    setSelectedGuide(guideId);
  };

  const handleBackToList = () => {
    setSelectedGuide(null);
  };

  // If a guide is selected, show the guide content
  if (selectedGuide) {
    const guide = getGuideById(selectedGuide);
    if (guide) {
      return <GuideContent guide={guide} onBack={handleBackToList} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header Simple */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")} 
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Book className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Documentation</h1>
                <p className="text-sm text-muted-foreground">Centre d'aide Core.gg</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Simple */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-4">
            Documentation Core.gg
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Guides essentiels pour maîtriser votre plateforme eSport
          </p>
        </div>
      </section>

      {/* Guides List Simple */}
      <div className="container mx-auto max-w-4xl px-6 pb-16">
        <div className="space-y-4">
          {guides.map((guide, index) => {
            const IconComponent = guide.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-primary/30"
                onClick={() => handleGuideSelect(guide.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {guide.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <Clock className="w-3 h-3 mr-1" />
                        {guide.time}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};