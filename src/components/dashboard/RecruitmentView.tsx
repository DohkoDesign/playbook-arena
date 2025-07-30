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
        .eq("role", "test");

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
      const token = Math.random().toString(36).substr(2, 15);
      
      const { error } = await supabase
        .from("invitations")
        .insert({
          team_id: teamId,
          token,
          role: "test",
          created_by: (await supabase.auth.getUser()).data.user?.id,
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

      <Tabs defaultValue="prospects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="tests">Joueurs Test</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-6 mt-6">
          {/* Ajouter un prospect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Ajouter un prospect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pseudo">Pseudo *</Label>
                  <Input
                    id="pseudo"
                    placeholder="Pseudo du joueur"
                    value={newProspect.pseudo}
                    onChange={(e) => setNewProspect({...newProspect, pseudo: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rank">Rank *</Label>
                  <Select value={newProspect.rank} onValueChange={(value) => setNewProspect({...newProspect, rank: value})}>
                    <SelectTrigger>
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
                  <Label htmlFor="mainRole">Rôle principal *</Label>
                  <Select value={newProspect.mainRole} onValueChange={(value) => setNewProspect({...newProspect, mainRole: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rôle principal" />
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryRole">Rôle secondaire</Label>
                  <Select value={newProspect.secondaryRole} onValueChange={(value) => setNewProspect({...newProspect, secondaryRole: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rôle secondaire" />
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
                  <Label htmlFor="experience">Expérience</Label>
                  <Input
                    id="experience"
                    placeholder="Ex: 2 ans"
                    value={newProspect.experience}
                    onChange={(e) => setNewProspect({...newProspect, experience: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kd">K/D Ratio</Label>
                  <Input
                    id="kd"
                    placeholder="1.5"
                    value={newProspect.stats.kd}
                    onChange={(e) => setNewProspect({
                      ...newProspect, 
                      stats: {...newProspect.stats, kd: e.target.value}
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="winrate">Winrate (%)</Label>
                  <Input
                    id="winrate"
                    placeholder="65"
                    value={newProspect.stats.winrate}
                    onChange={(e) => setNewProspect({
                      ...newProspect, 
                      stats: {...newProspect.stats, winrate: e.target.value}
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hours">Heures de jeu</Label>
                  <Input
                    id="hours"
                    placeholder="1500"
                    value={newProspect.stats.hours}
                    onChange={(e) => setNewProspect({
                      ...newProspect, 
                      stats: {...newProspect.stats, hours: e.target.value}
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availability">Disponibilité</Label>
                  <Input
                    id="availability"
                    placeholder="Soir/Week-end"
                    value={newProspect.availability}
                    onChange={(e) => setNewProspect({...newProspect, availability: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    placeholder="Discord, email..."
                    value={newProspect.contact}
                    onChange={(e) => setNewProspect({...newProspect, contact: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Observations, points forts, axes d'amélioration..."
                  value={newProspect.notes}
                  onChange={(e) => setNewProspect({...newProspect, notes: e.target.value})}
                  rows={3}
                />
              </div>
              
              <Button onClick={addProspect} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter le prospect
              </Button>
            </CardContent>
          </Card>

          {/* Liste des prospects */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des prospects ({prospects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {prospects.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun prospect ajouté</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Commencez par ajouter des joueurs que vous souhaitez recruter
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prospects.map((prospect) => (
                    <Card key={prospect.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-medium">
                                {prospect.pseudo.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{prospect.pseudo}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{prospect.rank}</Badge>
                                  <Badge>{prospect.mainRole}</Badge>
                                  {prospect.status === "invité" && (
                                    <Badge className="bg-yellow-100 text-yellow-800">Invité</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {prospect.experience && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span>{prospect.experience}</span>
                                </div>
                              )}
                              {prospect.availability && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span>{prospect.availability}</span>
                                </div>
                              )}
                              {prospect.stats.kd && (
                                <div className="flex items-center space-x-1">
                                  <Target className="w-4 h-4 text-muted-foreground" />
                                  <span>K/D: {prospect.stats.kd}</span>
                                </div>
                              )}
                              {prospect.stats.winrate && (
                                <div className="flex items-center space-x-1">
                                  <Trophy className="w-4 h-4 text-muted-foreground" />
                                  <span>{prospect.stats.winrate}% WR</span>
                                </div>
                              )}
                            </div>
                            
                            {prospect.notes && (
                              <p className="text-sm text-muted-foreground">{prospect.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeProspect(prospect.id)}
                            >
                              Supprimer
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => inviteForTest(prospect)}
                              disabled={prospect.status === "invité"}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {prospect.status === "invité" ? "Invité" : "Inviter en test"}
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

        <TabsContent value="tests" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Joueurs en test ({testPlayers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {testPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun joueur en test</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les joueurs invités en test apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testPlayers.map((player) => (
                    <Card key={player.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-medium">
                              {player.profiles?.pseudo?.charAt(0) || 'T'}
                            </div>
                            <div>
                              <h4 className="font-semibold">{player.profiles?.pseudo || 'Joueur Test'}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-orange-100 text-orange-800">En test</Badge>
                                <span className="text-sm text-muted-foreground">
                                  Depuis le {new Date(player.created_at).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Valider
                            </Button>
                            <Button variant="outline" size="sm">
                              Refuser
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

        <TabsContent value="stats" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Prospects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold">{prospects.length}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Joueurs en test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold">{testPlayers.length}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Invitations envoyées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold">
                    {prospects.filter(p => p.status === "invité").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};