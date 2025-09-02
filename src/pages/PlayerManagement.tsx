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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header compact */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="border-border/50 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 border">
                  <AvatarImage src={profile?.photo_profil} alt={profile?.pseudo} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {profile?.pseudo?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">{profile?.pseudo}</h1>
                  <Badge variant="secondary" className="text-xs">
                    {getRoleIcon(player?.role)}
                    <span className="ml-1">{player?.role}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              onClick={savePlayerProfile} 
              disabled={saving}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-card border">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                Profil & Analyse
              </TabsTrigger>
              <TabsTrigger 
                value="planning"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Planning Personnel
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Notes Staff
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-8 animate-fade-in">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Points forts */}
              <Card className="border hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-card border rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xl font-bold text-foreground">Points forts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nouveau point fort..."
                      value={newPointFort}
                      onChange={(e) => setNewPointFort(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPointFort()}
                      className="bg-background border focus:border-primary"
                    />
                    <Button 
                      size="sm" 
                      onClick={addPointFort}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {pointsForts.map((point, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-card rounded-xl border hover:shadow-lg transition-all duration-200">
                        <span className="text-sm font-medium text-foreground flex-1">{point}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePointFort(index)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {pointsForts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50 text-green-600" />
                        <p className="text-sm">Aucun point fort identifié</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Points faibles */}
              <Card className="border hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-card border rounded-2xl flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-xl font-bold text-foreground">Points d'amélioration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nouveau point à améliorer..."
                      value={newPointFaible}
                      onChange={(e) => setNewPointFaible(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPointFaible()}
                      className="bg-background border focus:border-primary"
                    />
                    <Button 
                      size="sm" 
                      onClick={addPointFaible}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {pointsFaibles.map((point, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-card rounded-xl border hover:shadow-lg transition-all duration-200">
                        <span className="text-sm font-medium text-foreground flex-1">{point}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePointFaible(index)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {pointsFaibles.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50 text-orange-600" />
                        <p className="text-sm">Aucun point d'amélioration identifié</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs individuels */}
              <Card className="border hover:shadow-lg transition-all duration-300 lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-card border rounded-2xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold text-foreground">Objectifs individuels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nouvel objectif..."
                      value={newObjectif}
                      onChange={(e) => setNewObjectif(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addObjectif()}
                      className="bg-background border focus:border-primary"
                    />
                    <Button 
                      size="sm" 
                      onClick={addObjectif}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {objectifs.map((objectif, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-card rounded-xl border hover:shadow-lg transition-all duration-200">
                        <span className="text-sm font-medium text-foreground flex-1">{objectif}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeObjectif(index)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {objectifs.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50 text-primary" />
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