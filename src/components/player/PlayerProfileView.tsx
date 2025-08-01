import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Target, TrendingUp, TrendingDown, Edit, Save, X, Plus, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

interface PlayerProfileViewProps {
  playerId: string;
  teamId: string;
  teamData?: any;
}

interface PlayerProfile {
  id: string;
  points_forts: string[];
  points_faibles: string[];
  objectifs_individuels: string[];
  notes?: string;
}

export const PlayerProfileView = ({ playerId, teamId, teamData }: PlayerProfileViewProps) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newObjective, setNewObjective] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [trackerUsername, setTrackerUsername] = useState("");
  const [savingTracker, setSavingTracker] = useState(false);
  const { toast } = useToast();

  const gameConfig = teamData?.jeu ? getGameConfig(teamData.jeu) : null;

  useEffect(() => {
    if (playerId && teamId) {
      fetchPlayerProfile();
      fetchUserProfile();
    }
  }, [playerId, teamId]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", playerId)
        .single();

      if (error) throw error;
      setUserProfile(data);
      
      // Set current tracker username for this game
      if (data.tracker_usernames && teamData?.jeu) {
        setTrackerUsername(data.tracker_usernames[teamData.jeu] || "");
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPlayerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("user_id", playerId)
        .eq("team_id", teamId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setObjectives(data.objectifs_individuels || []);
      } else {
        // Créer un profil vide si n'existe pas
        const { data: newProfile, error: createError } = await supabase
          .from("player_profiles")
          .insert({
            user_id: playerId,
            team_id: teamId,
            points_forts: [],
            points_faibles: [],
            objectifs_individuels: []
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        setObjectives([]);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger votre fiche",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addObjective = async () => {
    if (!newObjective.trim() || !profile) return;

    const updatedObjectives = [...objectives, newObjective.trim()];
    
    try {
      const { error } = await supabase
        .from("player_profiles")
        .update({ objectifs_individuels: updatedObjectives })
        .eq("id", profile.id);

      if (error) throw error;

      setObjectives(updatedObjectives);
      setNewObjective("");
      
      toast({
        title: "Objectif ajouté",
        description: "Votre objectif personnel a été ajouté",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'objectif",
        variant: "destructive",
      });
    }
  };

  const removeObjective = async (index: number) => {
    if (!profile) return;

    const updatedObjectives = objectives.filter((_, i) => i !== index);
    
    try {
      const { error } = await supabase
        .from("player_profiles")
        .update({ objectifs_individuels: updatedObjectives })
        .eq("id", profile.id);

      if (error) throw error;

      setObjectives(updatedObjectives);
      
      toast({
        title: "Objectif supprimé",
        description: "L'objectif a été retiré de votre liste",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'objectif",
        variant: "destructive",
      });
    }
  };

  const saveTrackerUsername = async () => {
    if (!userProfile || !teamData?.jeu) return;

    setSavingTracker(true);
    try {
      const updatedTrackerUsernames = {
        ...userProfile.tracker_usernames,
        [teamData.jeu]: trackerUsername
      };

      const { error } = await supabase
        .from("profiles")
        .update({ tracker_usernames: updatedTrackerUsernames })
        .eq("user_id", playerId);

      if (error) throw error;

      setUserProfile({
        ...userProfile,
        tracker_usernames: updatedTrackerUsernames
      });

      toast({
        title: "Pseudo sauvegardé",
        description: "Votre pseudo de tracker a été mis à jour",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le pseudo",
        variant: "destructive",
      });
    } finally {
      setSavingTracker(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement de votre fiche...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Erreur lors du chargement de votre fiche</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Ma Fiche Joueur</h2>
        </div>
      </div>

      {/* Configuration Tracker */}
      {gameConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-primary" />
              <span>Configuration Tracker</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trackerUsername">
                Votre pseudo {gameConfig.name}
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="trackerUsername"
                  placeholder={`Ex: VotreUsername#TAG`}
                  value={trackerUsername}
                  onChange={(e) => setTrackerUsername(e.target.value)}
                />
                <Button 
                  onClick={saveTrackerUsername} 
                  disabled={savingTracker || !trackerUsername.trim()}
                >
                  {savingTracker ? "..." : <Save className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Configurez votre pseudo pour voir vos vraies statistiques de performance
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points forts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>Points Forts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.points_forts && profile.points_forts.length > 0 ? (
              <div className="space-y-2">
                {profile.points_forts.map((point, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {point}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Aucun point fort renseigné. Le staff ajoutera vos points forts après évaluation.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Points faibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-400">
              <TrendingDown className="w-4 h-4" />
              <span>Axes d'Amélioration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.points_faibles && profile.points_faibles.length > 0 ? (
              <div className="space-y-2">
                {profile.points_faibles.map((point, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {point}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Aucun axe d'amélioration renseigné. Le staff identifiera les points à travailler.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Objectifs individuels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-primary" />
            <span>Mes Objectifs Personnels</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {objectives.length > 0 && (
            <div className="space-y-2">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">{objective}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newObjective">Ajouter un objectif personnel</Label>
            <div className="flex space-x-2">
              <Input
                id="newObjective"
                placeholder="Ex: Améliorer ma précision au sniper"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addObjective()}
              />
              <Button onClick={addObjective} disabled={!newObjective.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Définissez vos propres objectifs d'amélioration
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes du staff */}
      {profile.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes du Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{profile.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};