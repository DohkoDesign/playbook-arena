import image1 from '../assets/image-1.jpg';
import image2 from '../assets/image-2.jpg';
import image4 from '../assets/image-4.jpg';
import { Button } from './ui/button';

const features = [
  {
    title: "Dashboard de gestion d'équipe",
    description: "Visualisez en temps réel les performances de votre équipe, gérez les rosters et suivez la progression de chaque joueur avec des tableaux de bord intuitifs.",
    image: image1,
    highlights: ["Gestion des rosters", "Statistiques en temps réel", "Vue d'ensemble complète"]
  },
  {
    title: "Système de coaching avancé",
    description: "Analysez les replays, planifiez vos stratégies et communiquez efficacement avec vos joueurs grâce à nos outils de coaching professionnels.",
    image: image2,
    highlights: ["Analyse de replays", "Plans stratégiques", "Feedback détaillé"]
  },
  {
    title: "Système de coaching avancé",
    description: "Organisez vos entraînements, matchs et événements avec un système de planification intelligent adapté au rythme de l'esport compétitif.",
    image: image4,
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
      </div>
    </section>
  );
};