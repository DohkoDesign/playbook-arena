import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, HelpCircle, Search, Plus, Minus, Users, Calendar, Video, Settings, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FAQ = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const categories = [
    {
      title: "Gestion d'équipe",
      icon: Users,
      color: "bg-blue-500",
      faqs: [
        {
          question: "Comment créer ma première équipe ?",
          answer: "Pour créer votre équipe, cliquez sur 'Créer une équipe' depuis le dashboard. Renseignez le nom, choisissez les jeux et invitez vos premiers membres. Vous pouvez configurer les rôles et permissions selon vos besoins."
        },
        {
          question: "Combien de membres puis-je avoir dans mon équipe ?",
          answer: "Il n'y a pas de limite fixe au nombre de membres. Vous pouvez avoir des joueurs titulaires, des remplaçants et du staff. L'organisation dépend de vos besoins et des jeux pratiqués."
        },
        {
          question: "Comment gérer les rôles et permissions ?",
          answer: "Dans les paramètres d'équipe, vous pouvez définir différents rôles : Owner, Manager, Coach, Player. Chaque rôle a des permissions spécifiques pour la gestion de l'équipe, la planification et l'accès aux données."
        },
        {
          question: "Puis-je avoir plusieurs équipes pour différents jeux ?",
          answer: "Oui, vous pouvez créer plusieurs équipes ou organiser votre équipe principale par jeux. Chaque configuration de jeu peut avoir ses propres joueurs titulaires et remplaçants."
        }
      ]
    },
    {
      title: "Planning & Événements",
      icon: Calendar,
      color: "bg-green-500",
      faqs: [
        {
          question: "Comment planifier un match ou un entraînement ?",
          answer: "Utilisez le calendrier intégré pour créer des événements. Sélectionnez le type (match, scrim, entraînement), définissez la date/heure, invitez les participants et ajoutez les détails nécessaires."
        },
        {
          question: "Les membres reçoivent-ils des notifications ?",
          answer: "Oui, les membres reçoivent automatiquement des notifications pour les nouveaux événements, les modifications et les rappels. Ils peuvent aussi configurer leurs préférences de notification."
        },
        {
          question: "Comment gérer les disponibilités des joueurs ?",
          answer: "Les joueurs peuvent indiquer leurs disponibilités dans leur profil. Vous pouvez consulter ces informations lors de la planification d'événements pour optimiser la présence de l'équipe."
        },
        {
          question: "Peut-on synchroniser avec d'autres calendriers ?",
          answer: "Le calendrier interne centralise tous les événements de l'équipe. Les membres peuvent consulter leurs plannings directement sur la plateforme."
        }
      ]
    },
    {
      title: "Coaching & Formation",
      icon: Video,
      color: "bg-purple-500",
      faqs: [
        {
          question: "Comment organiser des sessions de coaching ?",
          answer: "Créez des sessions de coaching depuis l'onglet coaching. Définissez les objectifs, sélectionnez les participants, ajoutez vos notes et suivez les progrès des joueurs."
        },
        {
          question: "Puis-je uploader des VODs pour analyse ?",
          answer: "Oui, vous pouvez uploader des VODs depuis YouTube ou Twitch. Organisez-les par événement, ajoutez des marqueurs temporels et partagez vos analyses avec l'équipe."
        },
        {
          question: "Comment suivre les progrès des joueurs ?",
          answer: "Utilisez le système de feedback pour noter les performances, définir des objectifs et suivre l'évolution. Les statistiques et rapports vous donnent une vue d'ensemble des progrès."
        },
        {
          question: "Les joueurs peuvent-ils accéder aux analyses ?",
          answer: "Oui, selon les permissions définies, les joueurs peuvent consulter leurs feedbacks, objectifs et accéder aux VODs d'analyse qui les concernent."
        }
      ]
    },
    {
      title: "Paramètres & Configuration",
      icon: Settings,
      color: "bg-orange-500",
      faqs: [
        {
          question: "Comment modifier les informations de mon équipe ?",
          answer: "Accédez aux paramètres d'équipe via l'icône d'engrenage. Vous pouvez modifier le nom, la description, l'image, les jeux pratiqués et d'autres paramètres généraux."
        },
        {
          question: "Puis-je transférer la propriété de l'équipe ?",
          answer: "Oui, le propriétaire peut transférer ses droits à un autre membre ayant le rôle de manager. Cette action est irréversible et nécessite une confirmation."
        },
        {
          question: "Comment supprimer mon équipe ?",
          answer: "Dans les paramètres avancés, vous pouvez supprimer définitivement votre équipe. Attention : cette action supprime toutes les données associées et ne peut pas être annulée."
        },
        {
          question: "Mes données sont-elles sécurisées ?",
          answer: "Vos données sont stockées de manière sécurisée et ne sont accessibles qu'aux membres autorisés de votre équipe. Nous respectons la confidentialité et la protection des données."
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

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
                <HelpCircle className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">FAQ</h1>
              </div>
            </div>
            <Badge variant="secondary">Questions fréquentes</Badge>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-12 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions fréquentes</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Trouvez rapidement les réponses à vos questions sur Core Link
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher une question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez d'autres termes de recherche ou contactez notre support
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/contact")}>
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                        <category.icon className="w-4 h-4 text-white" />
                      </div>
                      <span>{category.title}</span>
                      <Badge variant="outline">{category.faqs.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.faqs.map((faq, faqIndex) => {
                        const globalIndex = categoryIndex * 100 + faqIndex;
                        const isOpen = openItems.includes(globalIndex);
                        
                        return (
                          <div key={faqIndex} className="border border-border rounded-lg">
                            <button
                              onClick={() => toggleItem(globalIndex)}
                              className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg"
                            >
                              <span className="font-medium pr-4">{faq.question}</span>
                              {isOpen ? (
                                <Minus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 border-t border-border">
                                <p className="text-muted-foreground pt-3 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 px-6 bg-muted/30">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-2xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-muted-foreground mb-6">
            Notre équipe support est là pour vous aider avec toutes vos questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/contact")}>
              Contacter le support
            </Button>
            <Button variant="outline" onClick={() => navigate("/documentation")}>
              Consulter la documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};