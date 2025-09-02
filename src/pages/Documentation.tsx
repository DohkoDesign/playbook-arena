import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, Users, Calendar, Video, Target, BarChart3, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Documentation = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Premiers pas",
      icon: Book,
      articles: [
        { title: "Créer votre première équipe", description: "Guide pour configurer votre équipe eSport" },
        { title: "Inviter des membres", description: "Comment ajouter des joueurs à votre équipe" },
        { title: "Configuration des rôles", description: "Définir les permissions et responsabilités" }
      ]
    },
    {
      title: "Gestion d'équipe",
      icon: Users,
      articles: [
        { title: "Organisation des rosters", description: "Structurer votre équipe par jeu" },
        { title: "Gestion des remplaçants", description: "Configurer les joueurs de réserve" },
        { title: "Système de notifications", description: "Paramétrer les alertes et rappels" }
      ]
    },
    {
      title: "Planification",
      icon: Calendar,
      articles: [
        { title: "Créer des événements", description: "Planifier matchs et entraînements" },
        { title: "Calendrier partagé", description: "Synchroniser les disponibilités" },
        { title: "Gestion des disponibilités", description: "Suivre la présence des joueurs" }
      ]
    },
    {
      title: "Coaching",
      icon: MessageSquare,
      articles: [
        { title: "Sessions de coaching", description: "Organiser et suivre les formations" },
        { title: "Feedback et notes", description: "Documenter les progrès des joueurs" },
        { title: "Objectifs et évaluations", description: "Définir et mesurer les performances" }
      ]
    },
    {
      title: "Analyse VOD",
      icon: Video,
      articles: [
        { title: "Upload de VODs", description: "Importer vos replays et analyses" },
        { title: "Organisation des vidéos", description: "Classer par événement et joueur" },
        { title: "Partage d'analyses", description: "Collaborer sur l'analyse de gameplay" }
      ]
    },
    {
      title: "Analytics",
      icon: BarChart3,
      articles: [
        { title: "Dashboard de l'équipe", description: "Vue d'ensemble des performances" },
        { title: "Statistiques individuelles", description: "Suivi des joueurs" },
        { title: "Rapports de progression", description: "Analyser l'évolution de l'équipe" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Book className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Documentation</h1>
              </div>
            </div>
            <Badge variant="secondary">Guide d'utilisation</Badge>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-12 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Centre d'aide Shadow Hub</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Tout ce que vous devez savoir pour maîtriser votre plateforme de gestion d'équipes eSport
          </p>
        </div>
      </section>

      {/* Documentation sections */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="border-l-2 border-primary/20 pl-4 hover:border-primary/40 transition-colors cursor-pointer">
                        <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                        <p className="text-xs text-muted-foreground">{article.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick start guide */}
      <section className="py-12 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Guide de démarrage rapide</h3>
            <p className="text-muted-foreground">Suivez ces étapes pour configurer votre équipe en quelques minutes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Créez votre équipe</h4>
              <p className="text-sm text-muted-foreground">Configurez les informations de base et choisissez vos jeux</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Invitez vos joueurs</h4>
              <p className="text-sm text-muted-foreground">Ajoutez vos membres et définissez leurs rôles</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Planifiez vos activités</h4>
              <p className="text-sm text-muted-foreground">Créez vos premiers événements et sessions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};