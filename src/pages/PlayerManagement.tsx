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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/20">
      {/* Header moderne et épuré */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-muted/80 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Retour à l'équipe
            </Button>
            <Button 
              onClick={savePlayerProfile} 
              disabled={saving}
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section avec profil joueur */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"></div>
        <div className="container mx-auto px-6 py-12">
          <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl shadow-2xl border p-8">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Colonne Avatar */}
              <div className="lg:col-span-1 flex flex-col items-center space-y-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                    <AvatarImage 
                      src={profile?.photo_profil} 
                      alt={profile?.pseudo || "Joueur"} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-4xl font-bold">
                      {profile?.pseudo?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-green-500 rounded-full border-4 border-background flex items-center justify-center shadow-lg">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile?.pseudo || "Joueur"}
                  </h1>
                  <Badge className={`${getRoleColor(player?.role)} text-base px-6 py-2 shadow-lg`}>
                    {getRoleIcon(player?.role)}
                    <span className="ml-2 font-semibold">{player?.role || "Joueur"}</span>
                  </Badge>
                </div>
              </div>

              {/* Colonne Statistiques */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl p-6 text-center border border-green-200 dark:border-green-800">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{pointsForts.length}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Points forts</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-2xl p-6 text-center border border-orange-200 dark:border-orange-800">
                    <TrendingDown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{pointsFaibles.length}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">À améliorer</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-6 text-center border border-blue-200 dark:border-blue-800">
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{objectifs.length}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Objectifs</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-2xl p-6 text-center border border-purple-200 dark:border-purple-800">
                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">85%</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Progression</p>
                  </div>
                </div>

                {/* Informations complémentaires */}
                <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Informations du joueur
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {profile?.jeux_joues && profile.jeux_joues.length > 0 && (
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">Jeux joués</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.jeux_joues.map((jeu: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {jeu}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {player?.personnages_favoris && player.personnages_favoris.length > 0 && (
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">Personnages favoris</p>
                        <div className="flex flex-wrap gap-1">
                          {player.personnages_favoris.map((perso: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {perso}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section principale avec tabs */}
      <div className="container mx-auto px-6 pb-12">
        <Tabs defaultValue="profile" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-card/80 backdrop-blur-lg border shadow-lg p-1">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg px-6 py-3"
              >
                <User className="w-4 h-4 mr-2" />
                Analyse & Profil
              </TabsTrigger>
              <TabsTrigger 
                value="planning"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg px-6 py-3"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Planning Personnel
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg px-6 py-3"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Notes Staff
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - Profil & Analyse */}
          <TabsContent value="profile" className="space-y-8 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {/* Points forts */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/30 dark:to-green-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Points forts</h3>
                      <p className="text-sm text-muted-foreground">Compétences maîtrisées</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ajouter un point fort..."
                      value={newPointFort}
                      onChange={(e) => setNewPointFort(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPointFort()}
                      className="bg-background/80 border-green-200 focus:border-green-400 dark:border-green-800"
                    />
                    <Button 
                      size="sm" 
                      onClick={addPointFort}
                      className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pointsForts.map((point, index) => (
                      <div key={index} className="group/item flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-200">
                        <span className="text-sm font-medium text-foreground flex-1 mr-2">{point}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePointFort(index)}
                          className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {pointsForts.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30 text-green-500" />
                        <p className="text-sm font-medium">Aucun point fort identifié</p>
                        <p className="text-xs">Ajoutez les forces du joueur</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Points faibles */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/30 dark:to-orange-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Points d'amélioration</h3>
                      <p className="text-sm text-muted-foreground">Compétences à développer</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ajouter un point à améliorer..."
                      value={newPointFaible}
                      onChange={(e) => setNewPointFaible(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPointFaible()}
                      className="bg-background/80 border-orange-200 focus:border-orange-400 dark:border-orange-800"
                    />
                    <Button 
                      size="sm" 
                      onClick={addPointFaible}
                      className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pointsFaibles.map((point, index) => (
                      <div key={index} className="group/item flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-orange-200 dark:border-orange-800 hover:shadow-md transition-all duration-200">
                        <span className="text-sm font-medium text-foreground flex-1 mr-2">{point}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePointFaible(index)}
                          className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {pointsFaibles.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-30 text-orange-500" />
                        <p className="text-sm font-medium">Aucun point d'amélioration identifié</p>
                        <p className="text-xs">Ajoutez les axes de progression</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs individuels */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20 md:col-span-2 xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Objectifs individuels</h3>
                      <p className="text-sm text-muted-foreground">Cibles de progression</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ajouter un objectif..."
                      value={newObjectif}
                      onChange={(e) => setNewObjectif(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addObjectif()}
                      className="bg-background/80 border-blue-200 focus:border-blue-400 dark:border-blue-800"
                    />
                    <Button 
                      size="sm" 
                      onClick={addObjectif}
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {objectifs.map((objectif, index) => (
                      <div key={index} className="group/item flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200">
                        <span className="text-sm font-medium text-foreground flex-1 mr-2">{objectif}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeObjectif(index)}
                          className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {objectifs.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
                        <p className="text-sm font-medium">Aucun objectif défini</p>
                        <p className="text-xs">Définissez les objectifs du joueur</p>
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