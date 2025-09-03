import { Card, CardContent } from './ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Alexandre Martin",
    role: "Coach - Team Nexus",
    game: "Valorant",
    content: "Core.gg a révolutionné notre façon de préparer les matchs. Les outils d'analyse nous permettent d'identifier précisément les points d'amélioration de chaque joueur.",
    rating: 5
  },
  {
    name: "Sarah Chen",
    role: "Manager - Phoenix Gaming",
    game: "League of Legends", 
    content: "La gestion d'équipe n'a jamais été aussi simple. Entre le planning automatisé et les statistiques détaillées, on gagne un temps fou sur l'administratif.",
    rating: 5
  },
  {
    name: "Thomas Dubois",
    role: "Capitaine - Storm Esports",
    game: "CS2",
    content: "Les fonctionnalités de coaching intégrées nous ont aidés à monter en division. Les replays analysés et les stratégies partagées font la différence.",
    rating: 5
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment Core.gg transforme déjà la gestion d'équipes eSport 
            à travers toute la France et l'Europe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border/50 hover:border-border transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="border-t border-border pt-4">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-primary font-medium mt-1">{testimonial.game}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm">Équipes actives</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">15,000+</div>
              <div className="text-sm">Joueurs inscrits</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div className="text-sm">Satisfaction client</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};