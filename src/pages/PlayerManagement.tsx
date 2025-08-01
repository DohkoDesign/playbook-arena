import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  User, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X,
  Calendar,
  BarChart3,
  MessageSquare,
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PlayerManagement = () => {
  const { teamId, userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [player, setPlayer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // États pour l'édition
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
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "joueur":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "remplacant":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des données du joueur...</p>
      </div>
    );
  }

  if (!player || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Joueur non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-lg">
              {profile.pseudo?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.pseudo}</h1>
              <Badge className={getRoleColor(player.role)}>
                {player.role}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={savePlayerProfile} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Separator />

      {/* Contenu principal */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="planning">
            <Calendar className="w-4 h-4 mr-2" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Points forts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Points forts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nouveau point fort..."
                    value={newPointFort}
                    onChange={(e) => setNewPointFort(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPointFort()}
                  />
                  <Button size="sm" onClick={addPointFort}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {pointsForts.map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                      <span className="text-sm">{point}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePointFort(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Points faibles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span>Points à améliorer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nouveau point à améliorer..."
                    value={newPointFaible}
                    onChange={(e) => setNewPointFaible(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPointFaible()}
                  />
                  <Button size="sm" onClick={addPointFaible}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {pointsFaibles.map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                      <span className="text-sm">{point}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePointFaible(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Objectifs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Objectifs individuels</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nouvel objectif..."
                    value={newObjectif}
                    onChange={(e) => setNewObjectif(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addObjectif()}
                  />
                  <Button size="sm" onClick={addObjectif}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {objectifs.map((objectif, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                      <span className="text-sm">{objectif}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeObjectif(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes du coach</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ajoutez vos notes sur ce joueur..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les statistiques de performance seront disponibles prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle>Planning et disponibilités</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Le planning du joueur sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Historique des feedbacks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                L'historique des feedbacks sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};