import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit, Save, X, Gamepad2, Target, Trophy, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlayerFicheViewProps {
  teamId: string;
  playerId: string;
  userProfile?: any;
  teamData?: any;
}

interface PlayerProfile {
  id: string;
  pseudo: string;
  role: string;
  photo_profil?: string;
  personnages_favoris: string[];
  jeux_joues: string[];
  points_forts: string[];
  points_faibles: string[];
  objectifs_individuels: string[];
  notes: string;
}

interface PlayerStats {
  matchs_joues: number;
  victoires: number;
  defaites: number;
  kda_moyen: string;
  temps_jeu: string;
  rank_actuel: string;
}

export const PlayerFicheView = ({ teamId, playerId, userProfile, teamData }: PlayerFicheViewProps) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PlayerProfile>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayerData();
  }, [teamId, playerId, userProfile]);

  const fetchPlayerData = async () => {
    try {
      // Charger le profil du joueur
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", playerId)
        .single();

      if (profileError) throw profileError;

      // Charger le profil joueur détaillé
      const { data: playerProfileData, error: playerError } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("user_id", playerId)
        .eq("team_id", teamId)
        .single();

      const playerProfile: PlayerProfile = {
        id: profileData.id,
        pseudo: profileData.pseudo,
        role: profileData.role,
        photo_profil: profileData.photo_profil,
        personnages_favoris: profileData.personnages_favoris || [],
        jeux_joues: profileData.jeux_joues || [],
        points_forts: playerProfileData?.points_forts || [],
        points_faibles: playerProfileData?.points_faibles || [],
        objectifs_individuels: playerProfileData?.objectifs_individuels || [],
        notes: playerProfileData?.notes || ''
      };

      setProfile(playerProfile);

      // Utiliser les vraies statistiques du tracker si disponibles
      if (userProfile?.tracker_stats && Object.keys(userProfile.tracker_stats).length > 0) {
        const trackerStats = userProfile.tracker_stats;
        const realStats: PlayerStats = {
          matchs_joues: trackerStats.stats?.matchesPlayed || trackerStats.stats?.gamesPlayed || 0,
          victoires: trackerStats.stats?.wins || (trackerStats.stats?.winRate ? Math.round((trackerStats.stats.winRate / 100) * (trackerStats.stats.matchesPlayed || trackerStats.stats.gamesPlayed || 0)) : 0),
          defaites: (trackerStats.stats?.matchesPlayed || trackerStats.stats?.gamesPlayed || 0) - (trackerStats.stats?.wins || 0),
          kda_moyen: trackerStats.stats?.kd?.toFixed(2) || trackerStats.stats?.kda?.toFixed(2) || "0.00",
          temps_jeu: "N/A", // Pas toujours disponible dans les trackers
          rank_actuel: trackerStats.player?.rank || "Non classé"
        };
        setStats(realStats);
      } else {
        // Fallback vers des données simulées si pas de tracker configuré
        const mockStats: PlayerStats = {
          matchs_joues: 0,
          victoires: 0,
          defaites: 0,
          kda_moyen: "0.00",
          temps_jeu: "0h",
          rank_actuel: "Non classé"
        };
        setStats(mockStats);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du joueur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setEditForm({
      personnages_favoris: profile?.personnages_favoris || [],
      jeux_joues: profile?.jeux_joues || [],
      points_forts: profile?.points_forts || [],
      points_faibles: profile?.points_faibles || [],
      objectifs_individuels: profile?.objectifs_individuels || [],
      notes: profile?.notes || ''
    });
    setIsEditing(true);
  };

  const saveChanges = async () => {
    if (!profile) return;

    try {
      // Mettre à jour le profil principal
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          personnages_favoris: editForm.personnages_favoris,
          jeux_joues: editForm.jeux_joues
        })
        .eq("user_id", playerId);

      if (profileError) throw profileError;

      // Mettre à jour ou créer le profil joueur détaillé
      const { error: playerError } = await supabase
        .from("player_profiles")
        .upsert({
          user_id: playerId,
          team_id: teamId,
          points_forts: editForm.points_forts,
          points_faibles: editForm.points_faibles,
          objectifs_individuels: editForm.objectifs_individuels,
          notes: editForm.notes
        });

      if (playerError) throw playerError;

      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);

      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été sauvegardées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      });
    }
  };

  const addArrayItem = (field: keyof PlayerProfile, value: string) => {
    if (!value.trim()) return;
    
    setEditForm(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[] || []), value.trim()]
    }));
  };

  const removeArrayItem = (field: keyof PlayerProfile, index: number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[] || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ma Fiche</h1>
        </div>
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ma Fiche</h1>
        </div>
        <div className="text-center py-8">
          <p>Impossible de charger le profil</p>
        </div>
      </div>
    );
  }

  const winRate = stats ? Math.round((stats.victoires / stats.matchs_joues) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ma Fiche Joueur</h1>
          <p className="text-muted-foreground">Votre profil et vos statistiques (géré par le staff)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarImage src={profile.photo_profil} alt={profile.pseudo} />
                <AvatarFallback className="text-lg">
                  {profile.pseudo.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{profile.pseudo}</h3>
              <Badge variant="outline" className="mt-2">
                {profile.role === 'player' ? 'Joueur' : profile.role}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jeux joués</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.jeux_joues.map((jeu, index) => (
                    <Badge key={index} variant="outline">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      {jeu}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Personnages favoris</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.personnages_favoris.map((perso, index) => (
                    <Badge key={index} variant="outline">{perso}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        {stats && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.victoires}</p>
                  <p className="text-sm text-muted-foreground">Victoires</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.defaites}</p>
                  <p className="text-sm text-muted-foreground">Défaites</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Winrate</span>
                  <span className="font-medium">{winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">K/D/A moyen</span>
                  <span className="font-medium">{stats.kda_moyen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Temps de jeu</span>
                  <span className="font-medium">{stats.temps_jeu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rank actuel</span>
                  <Badge variant="outline">
                    <Trophy className="w-3 h-3 mr-1" />
                    {stats.rank_actuel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Points forts/faibles et objectifs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Développement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Points forts</label>
              {isEditing ? (
                <div className="space-y-2">
                  {(editForm.points_forts || []).map((point, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50">{point}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeArrayItem('points_forts', index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Input
                    placeholder="Ajouter un point fort"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('points_forts', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.points_forts.map((point, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50">
                      {point}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Points à améliorer</label>
              {isEditing ? (
                <div className="space-y-2">
                  {(editForm.points_faibles || []).map((point, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-orange-50">{point}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeArrayItem('points_faibles', index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Input
                    placeholder="Ajouter un point à améliorer"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('points_faibles', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.points_faibles.map((point, index) => (
                    <Badge key={index} variant="outline" className="bg-orange-50">
                      {point}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Objectifs individuels</label>
              {isEditing ? (
                <div className="space-y-2">
                  {(editForm.objectifs_individuels || []).map((objectif, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50">{objectif}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeArrayItem('objectifs_individuels', index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Input
                    placeholder="Ajouter un objectif"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('objectifs_individuels', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.objectifs_individuels.map((objectif, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {objectif}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editForm.notes || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Ajoutez vos notes personnelles, réflexions, plans d'amélioration..."
              rows={6}
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm">
              {profile.notes || "Aucune note personnelle ajoutée."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};