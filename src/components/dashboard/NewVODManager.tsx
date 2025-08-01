import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Video, 
  Users, 
  Calendar,
  Youtube, 
  Twitch,
  List,
  User,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewVODManagerProps {
  teamId: string;
}

interface Event {
  id: string;
  titre: string;
  type: string;
  date_debut: string;
  map_name?: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  profiles?: {
    pseudo: string;
  };
}

interface VODData {
  [key: string]: any;
  type: 'match_complet' | 'highlights' | 'vod_perso' | 'playlist';
  platform: 'youtube' | 'twitch';
  url: string;
  player_id?: string;
  title?: string;
  description?: string;
  validated: boolean;
}

export const NewVODManager = ({ teamId }: NewVODManagerProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<TeamMember | null>(null);
  const [showVODModal, setShowVODModal] = useState(false);
  const [vodType, setVodType] = useState<'vod_perso' | 'playlist' | 'match_complet'>('vod_perso');
  const [newVOD, setNewVOD] = useState<VODData>({
    type: 'vod_perso',
    platform: 'youtube',
    url: '',
    validated: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
    loadTeamMembers();
  }, [teamId]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .order("date_debut", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Erreur chargement événements:", error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          role
        `)
        .eq("team_id", teamId);

      if (error) throw error;

      // Charger les profils séparément
      const userIds = data?.map(member => member.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, pseudo")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const membersWithProfiles = data?.map(member => ({
        ...member,
        profiles: profiles?.find(p => p.user_id === member.user_id)
      })) || [];

      setTeamMembers(membersWithProfiles as any);
    } catch (error) {
      console.error("Erreur chargement membres:", error);
    }
  };

  const handleOpenVODModal = (type: 'vod_perso' | 'playlist' | 'match_complet', player?: TeamMember) => {
    setVodType(type);
    setSelectedPlayer(player || null);
    setNewVOD({
      type,
      platform: 'youtube',
      url: '',
      player_id: player?.user_id,
      validated: false
    });
    setShowVODModal(true);
  };

  const validateYouTubeURL = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/playlist\?list=)/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\//
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const validateTwitchURL = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?twitch\.tv\/videos\/\d+/,
      /^https?:\/\/(www\.)?twitch\.tv\/\w+\/clip\/\w+/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleAddVOD = async () => {
    if (!selectedEvent || !newVOD.url.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un match et une URL valide",
        variant: "destructive",
      });
      return;
    }

    // Validation de l'URL selon la plateforme
    const isValidURL = newVOD.platform === 'youtube' 
      ? validateYouTubeURL(newVOD.url)
      : validateTwitchURL(newVOD.url);

    if (!isValidURL) {
      toast({
        title: "URL invalide",
        description: `L'URL ne correspond pas à une vidéo ${newVOD.platform === 'youtube' ? 'YouTube' : 'Twitch'} valide`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Récupérer les VODs existantes
      const { data: existingSession, error: fetchError } = await supabase
        .from("coaching_sessions")
        .select("vods")
        .eq("event_id", selectedEvent.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const existingVODs = Array.isArray(existingSession?.vods) ? existingSession.vods : [];
      const updatedVODs = [...existingVODs, newVOD];

      // Mettre à jour en base
      const { error } = await supabase
        .from("coaching_sessions")
        .upsert({
          event_id: selectedEvent.id,
          vods: updatedVODs as any
        }, {
          onConflict: 'event_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      setShowVODModal(false);
      toast({
        title: "VOD ajoutée",
        description: "La VOD a été ajoutée avec succès",
      });

      // Reset du formulaire
      setNewVOD({
        type: 'vod_perso',
        platform: 'youtube',
        url: '',
        validated: false
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const players = teamMembers.filter(m => ['joueur', 'remplacant', 'capitaine'].includes(m.role));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Gestion des VODs</h2>
        <p className="text-muted-foreground">
          Sélectionnez un match puis ajoutez des VODs pour vos joueurs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des matchs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Matchs disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun match disponible</p>
                </div>
              ) : (
                events.map((event) => (
                  <Card
                    key={event.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedEvent?.id === event.id ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{event.titre}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                            {event.map_name && (
                              <Badge variant="secondary" className="text-xs">
                                {event.map_name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.date_debut).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liste des joueurs et actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {selectedEvent ? `Joueurs - ${selectedEvent.titre}` : 'Sélectionnez un match'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedEvent ? (
              <div className="text-center py-8">
                <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez un match pour voir les joueurs
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Boutons d'actions globales */}
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => handleOpenVODModal('playlist')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Ajouter une playlist
                  </Button>
                  <Button
                    onClick={() => handleOpenVODModal('match_complet')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Ajouter match complet
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Joueurs de l'équipe</h4>
                  <div className="space-y-2">
                    {players.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Aucun joueur dans l'équipe
                      </p>
                    ) : (
                      players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => handleOpenVODModal('vod_perso', player)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {player.profiles?.pseudo || 'Pseudo non disponible'}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {player.role}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal d'ajout de VOD */}
      <Dialog open={showVODModal} onOpenChange={setShowVODModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2" />
              {vodType === 'vod_perso' ? `VOD personnelle - ${selectedPlayer?.profiles?.pseudo}` :
               vodType === 'playlist' ? 'Ajouter une playlist' :
               'Ajouter un match complet'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plateforme</Label>
                <Select value={newVOD.platform} onValueChange={(value: any) => setNewVOD(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">
                      <div className="flex items-center">
                        <Youtube className="w-4 h-4 mr-2" />
                        YouTube
                      </div>
                    </SelectItem>
                    <SelectItem value="twitch">
                      <div className="flex items-center">
                        <Twitch className="w-4 h-4 mr-2" />
                        Twitch
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={newVOD.type} onValueChange={(value: any) => setNewVOD(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vodType === 'vod_perso' && <SelectItem value="vod_perso">VOD personnelle</SelectItem>}
                    {vodType === 'playlist' && <SelectItem value="playlist">Playlist</SelectItem>}
                    {vodType === 'match_complet' && <SelectItem value="match_complet">Match complet</SelectItem>}
                    <SelectItem value="highlights">Highlights</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>URL</Label>
              <Input
                value={newVOD.url}
                onChange={(e) => setNewVOD(prev => ({ ...prev, url: e.target.value }))}
                placeholder={newVOD.platform === 'youtube' ? 
                  "https://youtube.com/watch?v=... ou https://youtube.com/playlist?list=..." : 
                  "https://twitch.tv/videos/..."
                }
              />
            </div>

            <div>
              <Label>Titre (optionnel)</Label>
              <Input
                value={newVOD.title || ''}
                onChange={(e) => setNewVOD(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de la VOD"
              />
            </div>

            <div>
              <Label>Description (optionnel)</Label>
              <Textarea
                value={newVOD.description || ''}
                onChange={(e) => setNewVOD(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la VOD"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowVODModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddVOD} disabled={loading}>
                {loading ? "Ajout..." : "Ajouter la VOD"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};