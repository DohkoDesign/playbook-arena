import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  User, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X,
  Calendar as CalendarIcon,
  BarChart3,
  MessageSquare,
  Save,
  Clock,
  Trophy,
  Star,
  Mail,
  MapPin,
  Calendar,
  Users,
  Edit2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlayerPersonalEvents as PlayerPersonalEventsComponent } from "@/components/dashboard/PlayerPersonalEvents";

export const PlayerManagement = () => {
  const { teamId, userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [player, setPlayer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // États pour l'édition du profil
  const [pointsForts, setPointsForts] = useState<string[]>([]);
  const [pointsFaibles, setPointsFaibles] = useState<string[]>([]);
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [newPointFort, setNewPointFort] = useState("");
  const [newPointFaible, setNewPointFaible] = useState("");
  const [newObjectif, setNewObjectif] = useState("");

  useEffect(() => {
    if (teamId && userId) {
      fetchPlayerData();
    }
  }, [teamId, userId]);

  const fetchPlayerData = async () => {
    try {
      // Récupérer les infos du membre de l'équipe
      const { data: memberData, error: memberError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .single();

      if (memberError) throw memberError;

      // Récupérer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;

      // Récupérer le profil joueur
      const { data: playerProfileData, error: playerProfileError } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .maybeSingle();

      if (playerProfileError && playerProfileError.code !== 'PGRST116') {
        throw playerProfileError;
      }

      setPlayer(memberData);
      setProfile(profileData);
      setPlayerProfile(playerProfileData);
      
      if (playerProfileData) {
        setPointsForts(playerProfileData.points_forts || []);
        setPointsFaibles(playerProfileData.points_faibles || []);
        setObjectifs(playerProfileData.objectifs_individuels || []);
        setNotes(playerProfileData.notes || "");
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du joueur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePlayerProfile = async () => {
    setSaving(true);
    try {
      const profileData = {
        team_id: teamId,
        user_id: userId,
        points_forts: pointsForts,
        points_faibles: pointsFaibles,
        objectifs_individuels: objectifs,
        notes: notes,
      };

      if (playerProfile) {
        // Mise à jour
        const { error } = await supabase
          .from("player_profiles")
          .update(profileData)
          .eq("id", playerProfile.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from("player_profiles")
          .insert(profileData);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Profil joueur sauvegardé avec succès",
      });

      // Recharger les données
      await fetchPlayerData();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addPointFort = () => {
    if (newPointFort.trim()) {
      setPointsForts([...pointsForts, newPointFort.trim()]);
      setNewPointFort("");
    }
  };

  const addPointFaible = () => {
    if (newPointFaible.trim()) {
      setPointsFaibles([...pointsFaibles, newPointFaible.trim()]);
      setNewPointFaible("");
    }
  };

  const addObjectif = () => {
    if (newObjectif.trim()) {
      setObjectifs([...objectifs, newObjectif.trim()]);
      setNewObjectif("");
    }
  };

  const removePointFort = (index: number) => {
    setPointsForts(pointsForts.filter((_, i) => i !== index));
  };

  const removePointFaible = (index: number) => {
    setPointsFaibles(pointsFaibles.filter((_, i) => i !== index));
  };

  const removeObjectif = (index: number) => {
    setObjectifs(objectifs.filter((_, i) => i !== index));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "capitaine":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "joueur":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      case "remplacant":
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "capitaine":
        return <Trophy className="w-4 h-4" />;
      case "joueur":
        return <Users className="w-4 h-4" />;
      case "remplacant":
        return <Clock className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/70 rounded-lg mx-auto animate-pulse"></div>
          <p className="text-muted-foreground">Chargement des données du joueur...</p>
        </div>
      </div>
    );
  }

  if (!player || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Joueur non trouvé</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Retour à l'équipe
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header simple et épuré */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'équipe
            </Button>
            <Button 
              onClick={savePlayerProfile} 
              disabled={saving}
              className="shadow-card"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Profil du joueur */}
      <div className="container mx-auto px-6 py-8">
        <Card className="shadow-card border">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage 
                    src={profile?.photo_profil} 
                    alt={profile?.pseudo || "Joueur"} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted text-2xl font-bold">
                    {profile?.pseudo?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-background"></div>
              </div>
              
              {/* Informations */}
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {profile?.pseudo || "Joueur"}
                  </h1>
                  <div className="flex items-center flex-wrap gap-3">
                    <Badge variant="secondary" className="text-sm">
                      {getRoleIcon(player?.role)}
                      <span className="ml-2">{player?.role || "Joueur"}</span>
                    </Badge>
                    {profile?.tracker_last_updated && (
                      <div className="text-sm text-muted-foreground">
                        Mis à jour le {format(new Date(profile.tracker_last_updated), "dd/MM/yyyy", { locale: fr })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-foreground">{pointsForts.length}</div>
                    <div className="text-sm text-muted-foreground">Points forts</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-foreground">{pointsFaibles.length}</div>
                    <div className="text-sm text-muted-foreground">À améliorer</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-foreground">{objectifs.length}</div>
                    <div className="text-sm text-muted-foreground">Objectifs</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec tabs */}
      <div className="container mx-auto px-6 pb-12">
        <Tabs defaultValue="profile" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-muted border">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <User className="w-4 h-4 mr-2" />
                Profil & Analyse
              </TabsTrigger>
              <TabsTrigger 
                value="planning"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Planning Personnel
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Notes Staff
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - Profil & Analyse */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Points forts */}
              <Card className="shadow-card border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-lg font-semibold">Points forts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ajouter un point fort..."
                      value={newPointFort}
                      onChange={(e) => setNewPointFort(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPointFort()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={addPointFort} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {pointsForts.map((point, index) => (
                      <div key={index} className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <span className="text-sm flex-1">{point}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePointFort(index)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {pointsForts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun point fort identifié</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Points faibles */}
              <Card className="shadow-card border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-lg font-semibold">Points d'amélioration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ajouter un point à améliorer..."
                      value={newPointFaible}
                      onChange={(e) => setNewPointFaible(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPointFaible()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={addPointFaible} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {pointsFaibles.map((point, index) => (
                      <div key={index} className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <span className="text-sm flex-1">{point}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePointFaible(index)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {pointsFaibles.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun point d'amélioration identifié</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs individuels */}
              <Card className="shadow-card border lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-lg font-semibold">Objectifs individuels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ajouter un objectif..."
                      value={newObjectif}
                      onChange={(e) => setNewObjectif(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addObjectif()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={addObjectif} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {objectifs.map((objectif, index) => (
                      <div key={index} className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <span className="text-sm flex-1">{objectif}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeObjectif(index)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {objectifs.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun objectif défini</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="planning" className="space-y-8 animate-fade-in">
            <PlayerPersonalEventsComponent 
              teamId={teamId || ""}
              playerId={userId || ""}
              playerName={profile?.pseudo || "Joueur"}
            />
          </TabsContent>

          <TabsContent value="notes" className="animate-fade-in">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-card border rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-foreground">Notes du staff</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Notes privées sur le joueur (coaching, comportement, progression, etc.)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px] bg-background border focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Ces notes sont privées et ne sont visibles que par le staff de l'équipe.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};