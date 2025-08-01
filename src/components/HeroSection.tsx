import { Button } from "./ui/button";
import { Users, Calendar, BarChart3, Target, Sparkles } from "lucide-react";

export const HeroSection = () => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center cyber-grid overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl gaming-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl gaming-float" style={{animationDelay: "1.5s"}}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-accent opacity-10 rounded-full blur-2xl gaming-float" style={{animationDelay: "3s"}}></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          
          {/* Main heading */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Plateforme eSport nouvelle génération</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-bold leading-tight">
              <span className="bg-gradient-gaming bg-clip-text text-transparent neon-pulse">
                SHADOW HUB
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              La plateforme ultime pour gérer vos équipes eSport comme un professionnel. 
              <span className="text-accent font-semibold"> Analytics avancées</span>, 
              <span className="text-primary font-semibold"> coaching intelligent</span> et 
              <span className="text-secondary font-semibold"> stratégies gagnantes</span>.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg" 
              className="btn-gaming px-8 py-4 text-lg group relative overflow-hidden"
              onClick={() => window.location.href = '/auth'}
            >
              <span className="relative z-10">Commencer gratuitement</span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="glass-effect border-primary/30 hover:border-primary/50 px-8 py-4 text-lg hover:bg-primary/10"
              onClick={scrollToFeatures}
            >
              Découvrir les fonctionnalités
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
            {[
              { icon: Users, title: "Gestion d'équipe", desc: "Rosters optimisés" },
              { icon: Calendar, title: "Planning intelligent", desc: "Entraînements & matchs" },
              { icon: BarChart3, title: "Analytics poussées", desc: "Performances détaillées" },
              { icon: Target, title: "Stratégies gagnantes", desc: "Coaching professionnel" }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="gaming-card p-6 text-center hover:scale-105 transition-all duration-300"
                style={{animationDelay: `${index * 200}ms`}}
              >
                <div className="mx-auto w-12 h-12 bg-gradient-gaming rounded-xl flex items-center justify-center mb-4 gaming-glow">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-orbitron font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-12 pt-12 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-orbitron font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Équipes actives</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="space-y-1">
              <div className="text-3xl font-orbitron font-bold text-accent">15k+</div>
              <div className="text-sm text-muted-foreground">Joueurs</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="space-y-1">
              <div className="text-3xl font-orbitron font-bold text-secondary">8</div>
              <div className="text-sm text-muted-foreground">Jeux supportés</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};