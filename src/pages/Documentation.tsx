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
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Documentation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    {
      title: "Premiers pas",
      icon: Play,
      description: "Découvrez comment démarrer avec Shadow Hub",
      articles: [
        { title: "Créer votre première équipe", time: "5 min", description: "Guide complet pour configurer votre équipe eSport" },
        { title: "Inviter des joueurs", time: "3 min", description: "Ajouter des membres à votre équipe" },
        { title: "Vue d'ensemble du dashboard", time: "8 min", description: "Naviguer dans l'interface principale" }
      ]
    },
    {
      title: "Gestion d'équipe",
      icon: Users,
      description: "Organisez et gérez efficacement votre équipe",
      articles: [
        { title: "Organisation des rosters", time: "10 min", description: "Structurer votre équipe par jeu et rôle" },
        { title: "Rôles et permissions", time: "6 min", description: "Définir les droits d'accès des membres" },
        { title: "Gestion des remplaçants", time: "5 min", description: "Configurer les joueurs de réserve" }
      ]
    },
    {
      title: "Planification",
      icon: Calendar,
      description: "Planifiez vos matchs et entraînements",
      articles: [
        { title: "Créer des événements", time: "8 min", description: "Planifier matchs et sessions d'entraînement" },
        { title: "Calendrier partagé", time: "5 min", description: "Synchroniser les disponibilités de l'équipe" },
        { title: "Gestion des disponibilités", time: "7 min", description: "Suivre la présence des joueurs" }
      ]
    },
    {
      title: "Coaching",
      icon: MessageSquare,
      description: "Formez et développez vos joueurs",
      articles: [
        { title: "Sessions de coaching", time: "12 min", description: "Organiser et suivre les formations" },
        { title: "Système de feedback", time: "6 min", description: "Documenter les progrès des joueurs" },
        { title: "Objectifs et évaluations", time: "10 min", description: "Définir et mesurer les performances" }
      ]
    },
    {
      title: "Analyse VOD",
      icon: Video,
      description: "Analysez vos replays et améliorez-vous",
      articles: [
        { title: "Upload de VODs", time: "5 min", description: "Importer vos replays et analyses vidéo" },
        { title: "Organisation des vidéos", time: "8 min", description: "Classer par événement et joueur" },
        { title: "Outils d'analyse", time: "15 min", description: "Utiliser les fonctionnalités d'annotation" }
      ]
    },
    {
      title: "Analytics",
      icon: BarChart3,
      description: "Suivez les performances de votre équipe",
      articles: [
        { title: "Dashboard équipe", time: "10 min", description: "Vue d'ensemble des statistiques" },
        { title: "Statistiques individuelles", time: "8 min", description: "Analyser les performances par joueur" },
        { title: "Rapports de progression", time: "12 min", description: "Suivre l'évolution dans le temps" }
      ]
    }
  ];

  const quickGuides = [
    {
      title: "Configuration initiale",
      description: "Tout configurer en 15 minutes",
      time: "15 min",
      steps: 4
    },
    {
      title: "Premier match",
      description: "Organiser votre première compétition",
      time: "10 min", 
      steps: 3
    },
    {
      title: "Analyse post-match",
      description: "Débriefing et amélioration",
      time: "20 min",
      steps: 5
    }
  ];

  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.articles.some(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Book className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Documentation</h1>
              </div>
            </div>
            <Badge variant="secondary">Guide d'utilisation</Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
            <Gamepad2 className="w-4 h-4" />
            <span>Centre d'aide Shadow Hub</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Comment utiliser
            <span className="text-primary"> Shadow Hub</span> ?
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Guides détaillés et tutoriels pour maîtriser votre plateforme de gestion d'équipes eSport
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un guide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-6 py-12">
        {/* Quick Start Guides */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Guides rapides</h2>
          <p className="text-muted-foreground mb-8">Démarrez rapidement avec ces guides essentiels</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickGuides.map((guide, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {guide.time}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{guide.steps} étapes</span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {guide.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    <Play className="w-4 h-4 mr-2" />
                    Commencer
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Documentation Sections */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Toute la documentation</h2>
          <p className="text-muted-foreground mb-8">Explorez toutes les fonctionnalités en détail</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="block text-lg">{section.title}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {section.description}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">{article.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <Badge variant="secondary" className="text-xs">{article.time}</Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Help Section */}
        <section className="mt-16 text-center">
          <div className="bg-muted/30 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe est là pour vous aider à tirer le meilleur parti de Shadow Hub
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/faq")} variant="outline">
                Consulter la FAQ
              </Button>
              <Button>
                Contacter le support
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};