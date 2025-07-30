import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserSearch, Users, Mail, Star, Filter, Plus, Calendar,
  Trophy, Target, Clock, MapPin, GamepadIcon, Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

interface RecruitmentViewProps {
  teamId: string;
  gameType?: string;
}

export const RecruitmentView = ({ teamId, gameType }: RecruitmentViewProps) => {
  const [recruitmentPosts, setRecruitmentPosts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    positions: [] as string[],
    requirements: "",
    contact: ""
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const gameConfig = gameType ? getGameConfig(gameType) : null;

  useEffect(() => {
    if (teamId) {
      fetchRecruitmentData();
    }
  }, [teamId]);

  const fetchRecruitmentData = async () => {
    try {
      // Simulation de données de recrutement
      setRecruitmentPosts([]);
      setApplications([]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de recrutement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRecruitmentPost = async () => {
    if (!newPost.title || !newPost.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulation de création d'annonce
      toast({
        title: "Annonce créée",
        description: "Votre annonce de recrutement a été publiée",
      });

      setNewPost({
        title: "",
        description: "",
        positions: [],
        requirements: "",
        contact: ""
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const mockPlayers = [
    {
      id: 1,
      pseudo: "ShadowPlayer",
      rank: "Immortal 2",
      mainRole: "Duelist",
      experience: "2 ans",
      availability: "Soir/Week-end",
      stats: { kd: 1.4, winrate: 67 }
    },
    {
      id: 2,
      pseudo: "ProGamer2024",
      rank: "Diamond 3",
      mainRole: "Controller",
      experience: "1.5 ans",
      availability: "Flexible",
      stats: { kd: 1.2, winrate: 71 }
    },
    {
      id: 3,
      pseudo: "EliteStriker",
      rank: "Ascendant 1",
      mainRole: "Initiator",
      experience: "3 ans",
      availability: "Après-midi",
      stats: { kd: 1.6, winrate: 64 }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement du système de recrutement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserSearch className="w-5 h-5" />
          <h2 className="text-2xl font-bold">
            Recrutement {gameConfig && `- ${gameConfig.name}`}
          </h2>
        </div>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Recherche</TabsTrigger>
          <TabsTrigger value="posts">Annonces</TabsTrigger>
          <TabsTrigger value="applications">Candidatures</TabsTrigger>
          <TabsTrigger value="scouts">Scouting</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6 mt-6">
          {/* Filtres de recherche */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filtres de recherche</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rôle recherché</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {gameConfig?.roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Niveau minimum</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="immortal">Immortal</SelectItem>
                      <SelectItem value="radiant">Radiant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Disponibilité</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Disponibilité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Matin</SelectItem>
                      <SelectItem value="afternoon">Après-midi</SelectItem>
                      <SelectItem value="evening">Soir</SelectItem>
                      <SelectItem value="weekend">Week-end</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button className="w-full">
                <UserSearch className="w-4 h-4 mr-2" />
                Rechercher des joueurs
              </Button>
            </CardContent>
          </Card>

          {/* Résultats de recherche */}
          <Card>
            <CardHeader>
              <CardTitle>Joueurs disponibles ({mockPlayers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPlayers.map((player) => (
                  <Card key={player.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-medium">
                              {player.pseudo.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold">{player.pseudo}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{player.rank}</Badge>
                                <Badge>{player.mainRole}</Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{player.experience}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{player.availability}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              <span>K/D: {player.stats.kd}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Trophy className="w-4 h-4 text-muted-foreground" />
                              <span>{player.stats.winrate}% WR</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Voir profil
                          </Button>
                          <Button size="sm">
                            <Mail className="w-4 h-4 mr-2" />
                            Contacter
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6 mt-6">
          {/* Créer une annonce */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Créer une annonce de recrutement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'annonce *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Recherche Duelist Immortal+"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="positions">Postes recherchés</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner les rôles" />
                  </SelectTrigger>
                  <SelectContent>
                    {gameConfig?.roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre équipe, vos objectifs, l'ambiance..."
                  value={newPost.description}
                  onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Exigences</Label>
                <Textarea
                  id="requirements"
                  placeholder="Niveau requis, disponibilités, matériel..."
                  value={newPost.requirements}
                  onChange={(e) => setNewPost({...newPost, requirements: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  placeholder="Discord, email..."
                  value={newPost.contact}
                  onChange={(e) => setNewPost({...newPost, contact: e.target.value})}
                />
              </div>
              
              <Button onClick={createRecruitmentPost} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Publier l'annonce
              </Button>
            </CardContent>
          </Card>

          {/* Annonces existantes */}
          <Card>
            <CardHeader>
              <CardTitle>Vos annonces actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune annonce active</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Créez votre première annonce pour commencer à recruter
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidatures reçues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune candidature</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Les candidatures apparaîtront ici quand vous publierez des annonces
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scouts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Scouting et recommandations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Fonctionnalité de scouting</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Analysez les performances des joueurs et obtenez des recommandations
                </p>
                <Button className="mt-4" variant="outline">
                  <GamepadIcon className="w-4 h-4 mr-2" />
                  Analyser les matchs récents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};