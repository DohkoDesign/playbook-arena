import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, Target, TrendingUp } from "lucide-react";

interface HeroSectionProps {}

export const HeroSection = ({}: HeroSectionProps) => {
  console.log("🦸 HeroSection rendering");
  const navigate = useNavigate();
  
  return (
    <section className="pt-20 pb-20 px-6 relative overflow-hidden min-h-screen" style={{
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.6)), url(/lovable-uploads/4cdcee5e-b388-44ce-8e7e-4856988404be.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/60"></div>
      
      {/* Animated floating elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl" style={{
        animation: 'moveFloat1 12s ease-in-out infinite'
      }}></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" style={{
        animation: 'moveFloat2 15s ease-in-out infinite'
      }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-500/25 rounded-full blur-2xl" style={{
        animation: 'moveFloat3 10s ease-in-out infinite'
      }}></div>
      </div>

      <style>{`
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
        `}</style>

      <div className="container mx-auto text-center max-w-4xl flex flex-col justify-center min-h-screen pt-16 relative z-10">
        {/* Main hero content */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Gérez vos équipes eSport
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              comme un professionnel
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">La plateforme tout-en-un pour organiser, planifier et optimiser les performances de vos équipes sur les 9 jeux compétitifs les plus populaires.</p>
        </header>

        {/* Call-to-action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            className="bg-blue-600 text-white hover:bg-blue-700 group"
            onClick={() => navigate("/auth")}
          >
            Commencer gratuitement
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" className="bg-slate-800 text-white border-2 border-white/30 hover:bg-slate-700 hover:text-white" onClick={() => document.getElementById('features-detail')?.scrollIntoView({
          behavior: 'smooth'
        })}>
            Découvrir les fonctionnalités
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <article className="text-center">
            <div className="w-12 h-12 bg-slate-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Gestion d'équipe</h3>
            <p className="text-sm text-slate-300">
              Organisez vos rosters avec rôles et remplaçants
            </p>
          </article>

          <article className="text-center">
            <div className="w-12 h-12 bg-slate-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Planning intégré</h3>
            <p className="text-sm text-slate-300">
              Planifiez scrims, matchs et sessions de coaching
            </p>
          </article>

          <article className="text-center">
            <div className="w-12 h-12 bg-slate-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Stratégies & Playbook</h3>
            <p className="text-sm text-slate-300">
              Créez et annotez vos stratégies sur toutes les maps
            </p>
          </article>

          <article className="text-center">
            <div className="w-12 h-12 bg-slate-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Suivi performance</h3>
            <p className="text-sm text-slate-300">
              Analysez et améliorez les performances individuelles
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};