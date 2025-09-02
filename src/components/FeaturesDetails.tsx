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
      description: "Organisez vos rosters, définissez les rôles, gérez les remplaçants et suivez les performances de chaque joueur.",
      points: ["Création d'équipes multi-jeux", "Gestion des rôles et permissions", "Suivi des statistiques individuelles"]
    },
    {
      icon: Calendar,
      title: "Planning et organisation",
      description: "Planifiez vos scrimmages, matchs officiels et sessions de coaching avec un système de calendrier intégré.",
      points: ["Calendrier partagé", "Notification automatique", "Gestion des disponibilités"]
    },
    {
      icon: Target,
      title: "Stratégies et tactiques", 
      description: "Créez, annotez et partagez vos stratégies sur toutes les maps avec des outils visuels avancés.",
      points: ["Éditeur de stratégies", "Annotations visuelles", "Bibliothèque de tactiques"]
    },
    {
      icon: Video,
      title: "Analyse VOD avancée",
      description: "Analysez vos replays avec des outils de marquage temporel et de prise de notes collaboratives.",
      points: ["Marqueurs temporels", "Notes collaboratives", "Analyse des phases de jeu"]
    },
    {
      icon: BarChart3,
      title: "Analytics et performances",
      description: "Suivez l'évolution de vos performances avec des graphiques détaillés et des métriques personnalisées.",
      points: ["Tableaux de bord personnalisés", "Métriques avancées", "Historique des performances"]
    },
    {
      icon: MessageSquare,
      title: "Communication intégrée",
      description: "Centralisez la communication de votre équipe avec un système de notifications intelligent.",
      points: ["Notifications en temps réel", "Canaux de discussion", "Alertes personnalisées"]
    },
    {
      icon: Clock,
      title: "Gestion du temps",
      description: "Optimisez vos horaires d'entraînement et suivez le temps investi par chaque membre.",
      points: ["Suivi du temps d'entraînement", "Planification automatique", "Rapports d'activité"]
    },
    {
      icon: Trophy,
      title: "Suivi des compétitions",
      description: "Gérez vos inscriptions aux tournois et suivez vos résultats en compétition.",
      points: ["Calendrier des tournois", "Historique des résultats", "Gestion des inscriptions"]
    },
    {
      icon: Shield,
      title: "Sécurité et confidentialité",
      description: "Protégez vos données et stratégies avec des niveaux d'accès personnalisables.",
      points: ["Chiffrement des données", "Contrôle d'accès granulaire", "Backup automatique"]
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
            Découvrez toutes les fonctionnalités qui font de notre plateforme 
            l'outil de référence pour la gestion d'équipes eSport professionnelles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
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