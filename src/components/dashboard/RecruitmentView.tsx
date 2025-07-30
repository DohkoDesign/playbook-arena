import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
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

    setShowAddProspectModal(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserSearch className="w-5 h-5" />
          <h2 className="text-2xl font-bold">
            Recrutement {gameConfig && `- ${gameConfig.name}`}
          </h2>
        </div>
        <Button onClick={() => setShowAddProspectModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un prospect
        </Button>
      </div>

      <Tabs defaultValue="prospects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="tests">Joueurs Test</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-6">
          {/* Liste des prospects */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des prospects</CardTitle>
            </CardHeader>
            <CardContent>
              {prospects.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun prospect</h3>
                  <p className="text-muted-foreground">
                    Commencez par ajouter des joueurs que vous souhaitez recruter
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {prospects.map((prospect) => (
                    <Card key={prospect.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{prospect.pseudo}</h3>
                              <Badge variant={prospect.status === "invité" ? "default" : "secondary"}>
                                {prospect.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Rank: {prospect.rank} • Rôle: {prospect.mainRole}</p>
                              {prospect.stats.kd && <p>K/D: {prospect.stats.kd}</p>}
                              {prospect.contact && <p>Contact: {prospect.contact}</p>}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => inviteForTest(prospect)}
                              disabled={prospect.status === "invité"}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              {prospect.status === "invité" ? "Invité" : "Inviter"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeProspect(prospect.id)}
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

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Joueurs en période de test</CardTitle>
            </CardHeader>
            <CardContent>
              {testPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun joueur en test</h3>
                  <p className="text-muted-foreground">
                    Les joueurs invités pour des tests apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {testPlayers.map((player) => (
                    <Card key={player.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
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

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de recrutement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{prospects.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Prospects actifs</div>
                </div>
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600">{testPlayers.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Joueurs en test</div>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/30 rounded-xl">
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

      {/* Modal d'ajout de prospect */}
      <Dialog open={showAddProspectModal} onOpenChange={setShowAddProspectModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un prospect</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddProspectModal(false)}>
                Annuler
              </Button>
              <Button onClick={addProspect}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};