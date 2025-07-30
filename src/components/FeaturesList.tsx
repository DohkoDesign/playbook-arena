import { Calendar, Users, Target, TrendingUp, Link, Video, FileText, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "Calendriers intelligents",
    description: "Planification d'équipe et personnelle avec scrims, matchs et coaching",
    details: ["Calendrier hebdomadaire", "Sessions individuelles", "Notifications automatiques"]
  },
  {
    icon: Users,
    title: "Gestion d'équipe complète",
    description: "Rosters automatiques selon le jeu avec rôles et remplaçants",
    details: ["Configuration auto", "Gestion des rôles", "Système d'invitations"]
  },
  {
    icon: Target,
    title: "Stratégies & Playbook",
    description: "Création et annotation de stratégies sur toutes les maps",
    details: ["Annotation de maps", "Export PDF", "Stratégies attaque/défense"]
  },
  {
    icon: TrendingUp,
    title: "Suivi des performances",
    description: "Fiches joueurs avec objectifs et points d'amélioration",
    details: ["Points forts/faibles", "Objectifs individuels", "Suivi progression"]
  },
  {
    icon: Link,
    title: "Invitations sécurisées",
    description: "Liens d'invitation uniques valables 24h pour recruter",
    details: ["Liens temporaires", "Sélection équipe/rôle", "Onboarding automatique"]
  },
  {
    icon: Video,
    title: "Review & Coaching",
    description: "Upload de VODs et analyse des performances post-match",
    details: ["Upload VODs", "Résultats de match", "Compositions détaillées"]
  },
  {
    icon: FileText,
    title: "Rapports détaillés",
    description: "Exports et rapports de performance pour vos équipes",
    details: ["Statistiques équipe", "Rapports individuels", "Export données"]
  },
  {
    icon: Shield,
    title: "Sécurité & Confidentialité",
    description: "Données protégées avec accès contrôlé par équipe",
    details: ["Chiffrement données", "Accès par rôle", "Sauvegarde automatique"]
  }
];

export const FeaturesList = () => {
  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une suite complète d'outils professionnels pour gérer et optimiser 
            vos équipes eSport au plus haut niveau.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <div 
              key={feature.title}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-1">
                {feature.details.map((detail) => (
                  <li key={detail} className="text-xs text-muted-foreground flex items-center">
                    <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};