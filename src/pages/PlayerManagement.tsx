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
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header avec design moderne */}
      <div className="relative bg-gradient-to-r from-primary/5 via-cyan/5 to-violet/5 backdrop-blur-xl border-b border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground hover:bg-background/80 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'équipe
            </Button>
            <Button 
              onClick={savePlayerProfile} 
              disabled={saving}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-elegant"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </div>
          
          {/* Card du joueur redessinée */}
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-elegant overflow-hidden">
            <div className="relative">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-cyan/10 to-violet/10"></div>
              
              <CardContent className="relative p-8">
                <div className="flex items-start space-x-6">
                  {/* Avatar amélioré */}
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white/20 shadow-elegant">
                      <AvatarImage 
                        src={profile?.photo_profil} 
                        alt={profile?.pseudo || "Joueur"} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">
                        {profile?.pseudo?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-background flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Informations du joueur */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                        {profile?.pseudo || "Joueur"}
                      </h1>
                      <div className="flex items-center space-x-4 mb-4">
                        <Badge className={`${getRoleColor(player?.role)} text-sm px-4 py-2 shadow-lg`}>
                          {getRoleIcon(player?.role)}
                          <span className="ml-2 font-medium">{player?.role || "Joueur"}</span>
                        </Badge>
                        {profile?.tracker_last_updated && (
                          <div className="flex items-center text-sm text-muted-foreground bg-background/50 rounded-full px-3 py-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            Mis à jour le {format(new Date(profile.tracker_last_updated), "dd/MM/yyyy", { locale: fr })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Points forts</p>
                            <p className="text-2xl font-bold text-green-600">{pointsForts.length}</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Points d'amélioration</p>
                            <p className="text-2xl font-bold text-orange-600">{pointsFaibles.length}</p>
                          </div>
                          <TrendingDown className="w-8 h-8 text-orange-500" />
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Objectifs</p>
                            <p className="text-2xl font-bold text-primary">{objectifs.length}</p>
                          </div>
                          <Target className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-elegant rounded-2xl p-2">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 transition-all duration-300 hover:bg-background/50"
              >
                <User className="w-4 h-4 mr-2" />
                Profil & Analyse
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-xl px-6 py-3 transition-all duration-300 hover:bg-background/50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Notes Staff
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-8 animate-fade-in">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Points forts */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50 shadow-elegant hover:shadow-card transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-green-800 dark:text-green-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">Points forts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nouveau point fort..."
                      value={newPointFort}
                      onChange={(e) => setNewPointFort(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPointFort()}
                      className="bg-white/70 border-green-300 focus:border-green-500 dark:bg-green-950/50"
                    />
                    <Button 
                      size="sm" 
                      onClick={addPointFort}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {pointsForts.map((point, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-white/70 dark:bg-green-950/30 rounded-xl border border-green-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                        <span className="text-sm font-medium text-green-800 dark:text-green-200 flex-1">{point}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePointFort(index)}
                          className="opacity-0 group-hover:opacity-100 text-green-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {pointsForts.length === 0 && (
                      <div className="text-center py-8 text-green-600 dark:text-green-400">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun point fort identifié</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Points faibles */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200/50 dark:border-orange-800/50 shadow-elegant hover:shadow-card transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-orange-800 dark:text-orange-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">Points d'amélioration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nouveau point à améliorer..."
                      value={newPointFaible}
                      onChange={(e) => setNewPointFaible(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPointFaible()}
                      className="bg-white/70 border-orange-300 focus:border-orange-500 dark:bg-orange-950/50"
                    />
                    <Button 
                      size="sm" 
                      onClick={addPointFaible}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {pointsFaibles.map((point, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-white/70 dark:bg-orange-950/30 rounded-xl border border-orange-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200 flex-1">{point}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePointFaible(index)}
                          className="opacity-0 group-hover:opacity-100 text-orange-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {pointsFaibles.length === 0 && (
                      <div className="text-center py-8 text-orange-600 dark:text-orange-400">
                        <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun point d'amélioration identifié</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs individuels */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50 shadow-elegant hover:shadow-card transition-all duration-300 lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-blue-800 dark:text-blue-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">Objectifs individuels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nouvel objectif..."
                      value={newObjectif}
                      onChange={(e) => setNewObjectif(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addObjectif()}
                      className="bg-white/70 border-blue-300 focus:border-blue-500 dark:bg-blue-950/50"
                    />
                    <Button 
                      size="sm" 
                      onClick={addObjectif}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {objectifs.map((objectif, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-white/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200 flex-1">{objectif}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeObjectif(index)}
                          className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {objectifs.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-blue-600 dark:text-blue-400">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun objectif défini</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="animate-fade-in">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <span>Notes du staff</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Notes privées sur le joueur (coaching, comportement, progression, etc.)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px] bg-background/50 border-border focus:border-primary"
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