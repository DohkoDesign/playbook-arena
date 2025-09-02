import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, Target, TrendingUp } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

export const HeroSection = () => {
  return (
    <section 
      className="pt-0 pb-20 px-6 relative overflow-hidden min-h-screen"
      style={{
        background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
      }}
    >
      <div className="absolute inset-0">
        <div 
          className="absolute top-10 left-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"
          style={{
            animation: 'moveFloat1 12s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute bottom-20 right-20 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"
          style={{
            animation: 'moveFloat2 15s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-500/25 rounded-full blur-2xl"
          style={{
            animation: 'moveFloat3 10s ease-in-out infinite'
          }}
        ></div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes moveFloat1 {
            0%, 100% { transform: translate(0px, 0px); }
            25% { transform: translate(30px, -20px); }
            50% { transform: translate(-15px, -40px); }
            75% { transform: translate(20px, -10px); }
          }
          @keyframes moveFloat2 {
            0%, 100% { transform: translate(0px, 0px); }
            33% { transform: translate(-25px, 15px); }
            66% { transform: translate(10px, -25px); }
          }
          @keyframes moveFloat3 {
            0%, 100% { transform: translate(0px, 0px); }
            50% { transform: translate(40px, 30px); }
          }
        `
      }} />
      <div className="container mx-auto text-center max-w-4xl flex flex-col justify-center min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Gérez vos équipes eSport
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              comme un professionnel
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            La plateforme tout-en-un pour organiser, planifier et optimiser les performances 
            de vos équipes sur les 25 jeux compétitifs les plus populaires.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group" onClick={() => window.location.href = '/auth'}>
            Commencer gratuitement
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="border-2" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Découvrir les fonctionnalités
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Gestion d'équipe</h3>
            <p className="text-sm text-muted-foreground">
              Organisez vos rosters avec rôles et remplaçants
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Planning intégré</h3>
            <p className="text-sm text-muted-foreground">
              Planifiez scrims, matchs et sessions de coaching
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Stratégies & Playbook</h3>
            <p className="text-sm text-muted-foreground">
              Créez et annotez vos stratégies sur toutes les maps
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Suivi performance</h3>
            <p className="text-sm text-muted-foreground">
              Analysez et améliorez les performances individuelles
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};