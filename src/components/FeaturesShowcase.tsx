import dashboardImg from '../assets/dashboard-preview.jpg';
import coachingImg from '../assets/coaching-preview.jpg';
import analyticsImg from '../assets/analytics-preview.jpg';
import calendarImg from '../assets/calendar-preview.jpg';
import { Button } from './ui/button';

const features = [
  {
    title: "Dashboard de gestion d'équipe",
    description: "Visualisez en temps réel les performances de votre équipe, gérez les rosters et suivez la progression de chaque joueur avec des tableaux de bord intuitifs.",
    image: dashboardImg,
    highlights: ["Gestion des rosters", "Statistiques en temps réel", "Vue d'ensemble complète"]
  },
  {
    title: "Système de coaching avancé",
    description: "Analysez les replays, planifiez vos stratégies et communiquez efficacement avec vos joueurs grâce à nos outils de coaching professionnels.",
    image: coachingImg,
    highlights: ["Analyse de replays", "Plans stratégiques", "Feedback détaillé"]
  },
  {
    title: "Analytics et performances",
    description: "Découvrez les forces et faiblesses de votre équipe avec des analyses approfondies et des métriques détaillées pour chaque joueur et match.",
    image: analyticsImg,
    highlights: ["Métriques détaillées", "Comparaisons", "Rapports personnalisés"]
  },
  {
    title: "Planification et calendrier",
    description: "Organisez vos entraînements, matchs et événements avec un système de planification intelligent adapté au rythme de l'esport compétitif.",
    image: calendarImg,
    highlights: ["Calendrier partagé", "Notifications automatiques", "Gestion des disponibilités"]
  }
];

export const FeaturesShowcase = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tout ce dont vous avez besoin pour exceller
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Shadow Hub réunit tous les outils essentiels pour transformer votre passion du gaming 
            en succès professionnel. Découvrez nos fonctionnalités pensées par et pour les équipes eSport.
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <h3 className="text-2xl md:text-3xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-3">
                  {feature.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gradient-brand rounded-full"></div>
                      <span className="text-foreground font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" className="mt-6">
                  Découvrir cette fonctionnalité
                </Button>
              </div>

              <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-brand rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="relative rounded-2xl shadow-2xl w-full h-auto border border-border/50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-20">
          <div className="bg-gradient-brand/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à transformer votre équipe ?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'équipes qui font déjà confiance à Shadow Hub 
              pour gérer leur succès dans l'esport compétitif.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Commencer gratuitement
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Demander une démo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};