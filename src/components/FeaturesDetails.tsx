import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock,
  Trophy,
  Video,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Zap
} from "lucide-react";

export const FeaturesDetails = () => {
  const features = [
    {
      icon: Users,
      title: "Gestion d'équipe complète",
      description: "Organisez vos rosters, définissez les rôles, gérez les remplaçants et invitez de nouveaux membres.",
      points: ["Création d'équipes multi-jeux", "Gestion des rôles et permissions", "Système d'invitations"]
    },
    {
      icon: Calendar,
      title: "Planning et calendrier",
      description: "Planifiez vos scrimmages, matchs officiels et sessions de coaching avec un calendrier partagé.",
      points: ["Calendrier d'équipe intégré", "Événements personnalisables", "Gestion des disponibilités"]
    },
    {
      icon: MessageSquare,
      title: "Sessions de coaching", 
      description: "Organisez et suivez vos sessions de coaching avec prise de notes et analyses détaillées.",
      points: ["Planification des sessions", "Notes et feedback", "Suivi des progrès"]
    },
    {
      icon: Video,
      title: "Analyse VOD",
      description: "Gérez vos replays et VODs avec des outils d'upload et d'organisation avancés.",
      points: ["Upload de VODs", "Organisation par événement", "Validation des analyses"]
    },
    {
      icon: BarChart3,
      title: "Dashboard analytique",
      description: "Suivez les performances de votre équipe avec des tableaux de bord personnalisés.",
      points: ["Vue d'ensemble de l'équipe", "Statistiques des joueurs", "Suivi des événements"]
    },
    {
      icon: Target,
      title: "Recrutement",
      description: "Gérez le recrutement de nouveaux talents pour renforcer votre équipe.",
      points: ["Processus de recrutement", "Évaluation des candidats", "Intégration des nouveaux membres"]
    }
  ];

  return (
    <section id="features-detail" className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Tout ce dont votre équipe a besoin
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez les fonctionnalités essentielles pour gérer efficacement 
            votre équipe eSport et optimiser vos performances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-center text-sm">
                          <Zap className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};