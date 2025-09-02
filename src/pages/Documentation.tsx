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
  Target, 
  BarChart3, 
  MessageSquare, 
  Search,
  ChevronRight,
  Play,
  Settings,
  Shield,
  Zap,
  Globe,
  Code,
  Database,
  Gamepad2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Documentation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

  const navigationSections = [
    {
      id: "getting-started",
      title: "Premiers pas",
      icon: Play,
      articles: [
        { id: "introduction", title: "Introduction à Shadow Hub", time: "5 min" },
        { id: "team-creation", title: "Créer votre première équipe", time: "10 min" },
        { id: "player-invitation", title: "Inviter des joueurs", time: "8 min" },
        { id: "dashboard-overview", title: "Vue d'ensemble du tableau de bord", time: "12 min" }
      ]
    },
    {
      id: "team-management",
      title: "Gestion d'équipe",
      icon: Users,
      articles: [
        { id: "roster-organization", title: "Organisation des rosters", time: "15 min" },
        { id: "roles-permissions", title: "Rôles et permissions", time: "10 min" },
        { id: "substitutes-management", title: "Gestion des remplaçants", time: "8 min" },
        { id: "team-settings", title: "Paramètres d'équipe", time: "12 min" }
      ]
    },
    {
      id: "planning",
      title: "Planification",
      icon: Calendar,
      articles: [
        { id: "event-creation", title: "Créer des événements", time: "12 min" },
        { id: "shared-calendar", title: "Calendrier partagé", time: "10 min" },
        { id: "availability-management", title: "Gestion des disponibilités", time: "15 min" },
        { id: "notifications", title: "Système de notifications", time: "8 min" }
      ]
    },
    {
      id: "coaching",
      title: "Coaching",
      icon: MessageSquare,
      articles: [
        { id: "coaching-sessions", title: "Sessions de coaching", time: "20 min" },
        { id: "feedback-system", title: "Système de feedback", time: "12 min" },
        { id: "player-objectives", title: "Objectifs des joueurs", time: "15 min" },
        { id: "performance-tracking", title: "Suivi des performances", time: "18 min" }
      ]
    },
    {
      id: "vod-analysis",
      title: "Analyse VOD",
      icon: Video,
      articles: [
        { id: "vod-upload", title: "Upload de VODs", time: "10 min" },
        { id: "video-organization", title: "Organisation des vidéos", time: "12 min" },
        { id: "analysis-tools", title: "Outils d'analyse", time: "25 min" },
        { id: "sharing-analysis", title: "Partage d'analyses", time: "8 min" }
      ]
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart3,
      articles: [
        { id: "team-dashboard", title: "Dashboard équipe", time: "15 min" },
        { id: "individual-stats", title: "Statistiques individuelles", time: "12 min" },
        { id: "progress-reports", title: "Rapports de progression", time: "20 min" },
        { id: "data-export", title: "Export des données", time: "8 min" }
      ]
    },
    {
      id: "integrations",
      title: "Intégrations",
      icon: Globe,
      articles: [
        { id: "supported-games", title: "Jeux supportés", time: "5 min" },
        { id: "api-integration", title: "Intégration API", time: "30 min" },
        { id: "third-party-tools", title: "Outils tiers", time: "15 min" }
      ]
    },
    {
      id: "advanced",
      title: "Fonctionnalités avancées",
      icon: Settings,
      articles: [
        { id: "custom-workflows", title: "Workflows personnalisés", time: "25 min" },
        { id: "automation", title: "Automatisation", time: "20 min" },
        { id: "security-settings", title: "Paramètres de sécurité", time: "15 min" }
      ]
    }
  ];

  const quickStartGuides = [
    {
      title: "Guide complet débutant",
      description: "Tout ce qu'il faut savoir pour démarrer avec Shadow Hub",
      duration: "30 minutes",
      icon: Zap,
      difficulty: "Débutant"
    },
    {
      title: "Configuration avancée",
      description: "Optimisez votre utilisation avec des fonctionnalités avancées",
      duration: "45 minutes", 
      icon: Settings,
      difficulty: "Intermédiaire"
    },
    {
      title: "Gestion d'équipe professionnelle",
      description: "Stratégies et bonnes pratiques pour les équipes pro",
      duration: "60 minutes",
      icon: Shield,
      difficulty: "Avancé"
    }
  ];

  const popularArticles = [
    { title: "Comment créer ma première équipe ?", views: "2.1k vues", category: "Premiers pas" },
    { title: "Organiser un tournoi interne", views: "1.8k vues", category: "Événements" },
    { title: "Analyser les performances de mes joueurs", views: "1.5k vues", category: "Analytics" },
    { title: "Configurer les notifications d'équipe", views: "1.2k vues", category: "Configuration" },
    { title: "Importer des VODs depuis Twitch", views: "980 vues", category: "VOD" }
  ];

  const filteredSections = navigationSections.filter(section => 
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
                <div>
                  <h1 className="text-xl font-bold">Documentation Shadow Hub</h1>
                  <p className="text-xs text-muted-foreground">Centre d'aide et guides</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="hidden md:flex">
              <Database className="w-3 h-3 mr-1" />
              v2.1.0
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-80 border-r border-border bg-muted/30 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
          <div className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher dans la documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all hover:bg-background ${
                      activeSection === section.id ? 'bg-background shadow-sm border border-border' : ''
                    }`}
                  >
                    <section.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm">{section.title}</span>
                    <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                  
                  {activeSection === section.id && (
                    <div className="ml-7 space-y-1 animate-fade-in">
                      {section.articles.map((article) => (
                        <button
                          key={article.id}
                          className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-md transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span>{article.title}</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">{article.time}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-primary/5 to-background px-8 py-12">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <Gamepad2 className="w-4 h-4" />
                <span>Documentation</span>
                <ChevronRight className="w-3 h-3" />
                <span>Centre d'aide</span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">
                Bienvenue dans la documentation
                <span className="text-primary"> Shadow Hub</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
                Découvrez comment utiliser toutes les fonctionnalités de Shadow Hub pour optimiser 
                la gestion de votre équipe eSport. Des premiers pas aux fonctionnalités avancées.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Guide de démarrage</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>API Documentation</span>
                </Button>
              </div>
            </div>
          </section>

          <div className="px-8 py-8">
            {/* Quick Start Guides */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Guides de démarrage rapide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickStartGuides.map((guide, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <guide.icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant={guide.difficulty === 'Débutant' ? 'default' : guide.difficulty === 'Intermédiaire' ? 'secondary' : 'destructive'}>
                          {guide.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{guide.duration}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Popular Articles */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Articles populaires</h2>
              <Card>
                <CardContent className="p-0">
                  {popularArticles.map((article, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{article.title}</h4>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span>{article.views}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* All Sections Grid */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Toutes les sections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {navigationSections.map((section) => (
                  <Card key={section.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <section.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="block">{section.title}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {section.articles.length} articles
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {section.articles.slice(0, 3).map((article, articleIndex) => (
                          <div key={articleIndex} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                              {article.title}
                            </span>
                            <span className="text-xs text-muted-foreground">{article.time}</span>
                          </div>
                        ))}
                        {section.articles.length > 3 && (
                          <div className="text-xs text-primary font-medium mt-2 cursor-pointer hover:underline">
                            +{section.articles.length - 3} autres articles
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};