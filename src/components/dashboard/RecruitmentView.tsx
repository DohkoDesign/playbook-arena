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
  Trophy, Target, Clock, MapPin, GamepadIcon, Send, User,
  TrendingUp, Award, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

interface RecruitmentViewProps {
  teamId: string;
  gameType?: string;
}

export const RecruitmentView = ({ teamId, gameType }: RecruitmentViewProps) => {
  const [prospects, setProspects] = useState<any[]>([]);
  const [testPlayers, setTestPlayers] = useState<any[]>([]);
  const [newProspect, setNewProspect] = useState({
    pseudo: "",
    rank: "",
    mainRole: "",
    secondaryRole: "",
    experience: "",
    availability: "",
    contact: "",
    notes: "",
    stats: {
      kd: "",
      winrate: "",
      hours: ""
    }
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
      // Récupérer les joueurs en test
      const { data: testMembers } = await supabase
        .from("team_members")
        .select(`
          *,
          profiles (
            pseudo,
            photo_profil
          )
        `)
        .eq("team_id", teamId)
        .eq("role", "test" as const);

      setTestPlayers(testMembers || []);
      // Les prospects seront stockés localement ou dans une table dédiée
      setProspects([]);
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

  const addProspect = () => {
    if (!newProspect.pseudo || !newProspect.rank || !newProspect.mainRole) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les champs obligatoires (pseudo, rank, rôle principal)",
        variant: "destructive",
      });
      return;
    }

    const prospect = {
      id: Date.now(),
      ...newProspect,
      dateAdded: new Date().toISOString(),
      status: "nouveau"
    };

    setProspects([...prospects, prospect]);
    
    // Reset du formulaire
    setNewProspect({
      pseudo: "",
      rank: "",
      mainRole: "",
      secondaryRole: "",
      experience: "",
      availability: "",
      contact: "",
      notes: "",
      stats: { kd: "", winrate: "", hours: "" }
    });

    toast({
      title: "Prospect ajouté",
      description: `${prospect.pseudo} a été ajouté à votre liste de prospects`,
    });
  };

  const inviteForTest = async (prospect: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const token = Math.random().toString(36).substr(2, 15);
      
      const { error } = await supabase
        .from("invitations")
        .insert({
          team_id: teamId,
          token,
          role: "test" as const,
          created_by: user.id,
        });

      if (error) throw error;

      // Mettre à jour le statut du prospect
      setProspects(prospects.map(p => 
        p.id === prospect.id 
          ? { ...p, status: "invité", inviteDate: new Date().toISOString() }
          : p
      ));

      toast({
        title: "Invitation envoyée",
        description: `Invitation de test envoyée à ${prospect.pseudo}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeProspect = (prospectId: number) => {
    setProspects(prospects.filter(p => p.id !== prospectId));
    toast({
      title: "Prospect supprimé",
      description: "Le prospect a été retiré de votre liste",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse space-y-4">
          <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Chargement du système de recrutement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header moderne */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-xl">
                <UserSearch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Centre de Recrutement</h2>
                <p className="text-muted-foreground">
                  {gameConfig ? `Trouvez les meilleurs talents pour votre équipe ${gameConfig.name}` : 'Gérez vos prospects et recrutements'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
              {prospects.length} Prospects
            </Badge>
            <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
              {testPlayers.length} En test
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="prospects" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="prospects" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-4 h-4 mr-2" />
            Prospects
          </TabsTrigger>
          <TabsTrigger value="tests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Trophy className="w-4 h-4 mr-2" />
            Joueurs Test
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-6 mt-8">
          {/* Formulaire d'ajout moderne */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Ajouter un prospect</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Référencez un nouveau joueur potentiel pour votre équipe
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Informations générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pseudo" className="text-sm font-medium">Pseudo *</Label>
                    <Input
                      id="pseudo"
                      placeholder="Pseudo du joueur"
                      value={newProspect.pseudo}
                      onChange={(e) => setNewProspect({...newProspect, pseudo: e.target.value})}
                      className="border-2 focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rank" className="text-sm font-medium">Rank *</Label>
                    <Select value={newProspect.rank} onValueChange={(value) => setNewProspect({...newProspect, rank: value})}>
                      <SelectTrigger className="border-2 focus:border-primary">
                        <SelectValue placeholder="Sélectionner le rank" />
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
                    <Label htmlFor="mainRole" className="text-sm font-medium">Rôle principal *</Label>
                    <Select value={newProspect.mainRole} onValueChange={(value) => setNewProspect({...newProspect, mainRole: value})}>
                      <SelectTrigger className="border-2 focus:border-primary">
                        <SelectValue placeholder="Rôle principal" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameConfig?.roles.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Statistiques de performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kd" className="text-sm font-medium">K/D Ratio</Label>
                    <Input
                      id="kd"
                      placeholder="1.5"
                      value={newProspect.stats.kd}
                      onChange={(e) => setNewProspect({
                        ...newProspect, 
                        stats: {...newProspect.stats, kd: e.target.value}
                      })}
                      className="border-2 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="winrate" className="text-sm font-medium">Winrate (%)</Label>
                    <Input
                      id="winrate"
                      placeholder="65"
                      value={newProspect.stats.winrate}
                      onChange={(e) => setNewProspect({
                        ...newProspect, 
                        stats: {...newProspect.stats, winrate: e.target.value}
                      })}
                      className="border-2 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hours" className="text-sm font-medium">Heures de jeu</Label>
                    <Input
                      id="hours"
                      placeholder="1500"
                      value={newProspect.stats.hours}
                      onChange={(e) => setNewProspect({
                        ...newProspect, 
                        stats: {...newProspect.stats, hours: e.target.value}
                      })}
                      className="border-2 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Détails additionnels */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Détails du profil
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-sm font-medium">Disponibilité</Label>
                    <Input
                      id="availability"
                      placeholder="Soir/Week-end"
                      value={newProspect.availability}
                      onChange={(e) => setNewProspect({...newProspect, availability: e.target.value})}
                      className="border-2 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-sm font-medium">Contact</Label>
                    <Input
                      id="contact"
                      placeholder="Discord, email..."
                      value={newProspect.contact}
                      onChange={(e) => setNewProspect({...newProspect, contact: e.target.value})}
                      className="border-2 focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observations, points forts, axes d'amélioration..."
                    value={newProspect.notes}
                    onChange={(e) => setNewProspect({...newProspect, notes: e.target.value})}
                    rows={3}
                    className="border-2 focus:border-primary resize-none"
                  />
                </div>
              </div>
              
              <Button 
                onClick={addProspect} 
                className="w-full bg-gradient-to-r from-primary to-primary-glow text-white font-medium py-3 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter ce prospect à la liste
              </Button>
            </CardContent>
          </Card>

          {/* Liste des prospects */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Liste des prospects</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {prospects.length} prospect{prospects.length > 1 ? 's' : ''} en cours d'évaluation
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {prospects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun prospect ajouté</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Commencez par ajouter des joueurs que vous souhaitez recruter pour votre équipe
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {prospects.map((prospect) => (
                    <Card key={prospect.id} className="border-l-4 border-l-primary bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-4">
                            {/* Header du prospect */}
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">{prospect.pseudo.charAt(0)}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg font-semibold">{prospect.pseudo}</h4>
                                  {prospect.status === "invité" && (
                                    <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200">
                                      <Mail className="w-3 h-3 mr-1" />
                                      Invité
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                                    <Award className="w-3 h-3 mr-1" />
                                    {prospect.rank}
                                  </Badge>
                                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                    {prospect.mainRole}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {/* Stats et infos */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {prospect.experience && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Exp:</span>
                                  <span className="font-medium">{prospect.experience}</span>
                                </div>
                              )}
                              {prospect.availability && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Dispo:</span>
                                  <span className="font-medium">{prospect.availability}</span>
                                </div>
                              )}
                              {prospect.stats.kd && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Target className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">K/D:</span>
                                  <span className="font-medium">{prospect.stats.kd}</span>
                                </div>
                              )}
                              {prospect.stats.winrate && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Trophy className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">WR:</span>
                                  <span className="font-medium">{prospect.stats.winrate}%</span>
                                </div>
                              )}
                            </div>
                            
                            {prospect.notes && (
                              <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-blue-200">
                                <div className="flex items-start space-x-2">
                                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                                  <p className="text-sm text-muted-foreground leading-relaxed">{prospect.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button 
                              size="sm"
                              onClick={() => inviteForTest(prospect)}
                              disabled={prospect.status === "invité"}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {prospect.status === "invité" ? "Invité" : "Inviter"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeProspect(prospect.id)}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6 mt-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Joueurs en période de test</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {testPlayers.length} joueur{testPlayers.length > 1 ? 's' : ''} actuellement en test
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {testPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6">
                    <Trophy className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun joueur en test</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Les joueurs invités pour des tests apparaîtront ici une fois qu'ils auront rejoint l'équipe
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {testPlayers.map((player) => (
                    <Card key={player.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-medium">
                            {player.profiles?.pseudo?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <h4 className="font-semibold">{player.profiles?.pseudo || 'Joueur Test'}</h4>
                            <Badge variant="outline">En période de test</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 mt-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Statistiques de recrutement</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Aperçu de votre activité de recrutement
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{prospects.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Prospects actifs</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600">{testPlayers.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Joueurs en test</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">
                    {prospects.filter(p => p.status === "invité").length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Invitations envoyées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};