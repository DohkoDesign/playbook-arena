import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Book, 
  Users, 
  Calendar, 
  Video, 
  MessageSquare, 
  BarChart3, 
  Search,
  ChevronRight,
  Play,
  Settings,
  Gamepad2,
  Clock,
  FileText,
  Zap,
  Target,
  Star,
  HelpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GuideContent } from "@/components/documentation/GuideContent";
import { getGuideById } from "@/data/guideContents";

export const Documentation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const quickGuides = [
    {
      title: "Configuration initiale",
      description: "Configurez votre équipe eSport en 15 minutes",
      time: "15 min",
      steps: 4,
      id: "configuration-initiale",
      icon: Zap,
      color: "from-blue-500/20 to-purple-500/20"
    },
    {
      title: "Premier match",
      description: "Organisez votre première compétition",
      time: "10 min", 
      steps: 3,
      id: "premier-match",
      icon: Target,
      color: "from-green-500/20 to-emerald-500/20"
    },
    {
      title: "Analyse post-match",
      description: "Débriefing et amélioration continue",
      time: "20 min",
      steps: 5,
      id: "analyse-post-match",
      icon: Star,
      color: "from-orange-500/20 to-red-500/20"
    }
  ];

  const categories = [
    {
      title: "Premiers pas",
      description: "Démarrez avec Core.gg",
      icon: Play,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      guides: [
        { title: "Créer votre première équipe", time: "5 min", description: "Guide complet pour configurer votre équipe eSport", id: "creer-equipe" },
        { title: "Inviter des joueurs", time: "3 min", description: "Ajouter des membres à votre équipe", id: "inviter-joueurs" },
        { title: "Vue d'ensemble du dashboard", time: "8 min", description: "Naviguer dans l'interface principale", id: "dashboard-overview" }
      ]
    },
    {
      title: "Gestion d'équipe",
      description: "Organisez votre équipe",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      guides: [
        { title: "Organisation des rosters", time: "10 min", description: "Structurer votre équipe par jeu et rôle", id: "organisation-rosters" },
        { title: "Rôles et permissions", time: "6 min", description: "Définir les droits d'accès des membres", id: "roles-permissions" },
        { title: "Gestion des remplaçants", time: "5 min", description: "Configurer les joueurs de réserve", id: "gestion-remplacants" }
      ]
    },
    {
      title: "Planification",
      description: "Matchs et entraînements",
      icon: Calendar,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      guides: [
        { title: "Créer des événements", time: "8 min", description: "Planifier matchs et sessions d'entraînement", id: "creer-evenements" },
        { title: "Calendrier partagé", time: "5 min", description: "Synchroniser les disponibilités de l'équipe", id: "calendrier-partage" },
        { title: "Gestion des disponibilités", time: "7 min", description: "Suivre la présence des joueurs", id: "gestion-disponibilites" }
      ]
    },
    {
      title: "Coaching",
      description: "Formez vos joueurs",
      icon: MessageSquare,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      guides: [
        { title: "Sessions de coaching", time: "12 min", description: "Organiser et suivre les formations", id: "sessions-coaching" },
        { title: "Système de feedback", time: "6 min", description: "Documenter les progrès des joueurs", id: "systeme-feedback" },
        { title: "Objectifs et évaluations", time: "10 min", description: "Définir et mesurer les performances", id: "objectifs-evaluations" }
      ]
    },
    {
      title: "Analyse VOD",
      description: "Analysez vos replays",
      icon: Video,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      guides: [
        { title: "Upload de VODs", time: "5 min", description: "Importer vos replays et analyses vidéo", id: "upload-vods" },
        { title: "Organisation des vidéos", time: "8 min", description: "Classer par événement et joueur", id: "organisation-videos" },
        { title: "Outils d'analyse", time: "15 min", description: "Utiliser les fonctionnalités d'annotation", id: "outils-analyse" }
      ]
    },
    {
      title: "Analytics",
      description: "Performances d'équipe",
      icon: BarChart3,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      guides: [
        { title: "Dashboard équipe", time: "10 min", description: "Vue d'ensemble des statistiques", id: "dashboard-equipe" },
        { title: "Statistiques individuelles", time: "8 min", description: "Analyser les performances par joueur", id: "stats-individuelles" },
        { title: "Rapports de progression", time: "12 min", description: "Suivre l'évolution dans le temps", id: "rapports-progression" }
      ]
    }
  ];

  const filteredCategories = categories.filter(category => 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.guides.some(guide => 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")} 
                className="group hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Retour
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Book className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Documentation
                  </h1>
                  <p className="text-sm text-muted-foreground">Centre d'aide Core.gg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto max-w-4xl text-center relative">
          <div className="inline-flex items-center space-x-2 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Gamepad2 className="w-4 h-4" />
            <span>Maîtrisez votre plateforme eSport</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            Documentation
            <span className="block text-primary mt-2">Core.gg</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Guides détaillés, tutoriels pas-à-pas et ressources complètes pour optimiser votre gestion d'équipe eSport
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-background/80 backdrop-blur-sm border border-border/60 rounded-2xl p-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Rechercher un guide ou tutoriel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 bg-transparent border-0 text-lg placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 pb-16">
        {/* Quick Start Guides */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Guides de démarrage rapide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Lancez-vous immédiatement avec ces guides essentiels et configurez votre équipe en quelques minutes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickGuides.map((guide, index) => {
              const IconComponent = guide.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm relative overflow-hidden"
                  onClick={() => handleGuideSelect(guide.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${guide.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <CardHeader className="relative pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary/80">
                          <Clock className="w-3 h-3 mr-1" />
                          {guide.time}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        {guide.steps} étapes
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300 leading-tight">
                      {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-muted-foreground mb-6 leading-relaxed">{guide.description}</p>
                    <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                      <Play className="w-5 h-5 mr-2" />
                      Démarrer maintenant
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Documentation Categories */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Explorez toute la documentation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Plongez dans chaque fonctionnalité avec nos guides détaillés et apprenez à optimiser votre gestion d'équipe
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-background/60 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-start space-x-4">
                      <div className={`w-14 h-14 ${category.bgColor} rounded-2xl flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform duration-300`}>
                        <IconComponent className={`w-7 h-7 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <span className="block text-xl font-bold mb-1">{category.title}</span>
                        <span className="text-sm font-normal text-muted-foreground leading-relaxed">
                          {category.description}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {category.guides.map((guide, guideIndex) => (
                        <div 
                          key={guideIndex} 
                          className="group/item flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/30"
                          onClick={() => handleGuideSelect(guide.id)}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full group-hover/item:bg-primary transition-colors duration-200"></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1 group-hover/item:text-primary transition-colors duration-200 leading-tight">
                                {guide.title}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">{guide.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <Badge variant="secondary" className="text-xs font-medium bg-muted/50 hover:bg-muted/70 transition-colors">
                              {guide.time}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all duration-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Help Section */}
        <section className="mt-24">
          <Card className="border-0 bg-gradient-to-br from-primary/5 via-background/80 to-secondary/5 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-50"></div>
            <CardContent className="relative text-center py-16 px-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Besoin d'aide supplémentaire ?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Notre équipe est là pour vous accompagner dans votre réussite eSport. Trouvez les réponses à vos questions ou contactez-nous directement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/faq")} 
                  variant="outline"
                  size="lg"
                  className="group hover:bg-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-300"
                >
                  <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Consulter la FAQ
                </Button>
                <Button 
                  size="lg"
                  className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Contacter le support
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};