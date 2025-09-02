import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Video, 
  Plus, 
  Trash2, 
  Eye, 
  Youtube, 
  Twitch,
  Users,
  Tag,
  ExternalLink,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VODViewer } from "./VODViewer";

interface PostMatchVODManagerProps {
  eventId: string;
  teamId: string;
  onVODsUpdated?: () => void;
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
  type: 'match_complet' | 'highlights' | 'vod_perso';
  platform: 'youtube' | 'twitch';
  url: string;
  players: string[];
  tags: string[];
  title?: string;
  description?: string;
  validated: boolean;
}

export const PostMatchVODManager = ({ eventId, teamId, onVODsUpdated }: PostMatchVODManagerProps) => {
  const [vods, setVods] = useState<VODData[]>([]);
  const [selectedVOD, setSelectedVOD] = useState<any>(null);
  const [newVOD, setNewVOD] = useState<VODData>({
    type: 'match_complet',
    platform: 'youtube',
    url: '',
    players: [],
    tags: [],
    validated: false
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
    loadExistingVODs();
  }, [teamId, eventId]);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (pseudo)
        `)
        .eq("team_id", teamId);

      if (error) throw error;
      setTeamMembers((data as any) || []);
    } catch (error) {
      console.error("Erreur chargement membres:", error);
    }
  };

  const loadExistingVODs = async () => {
    try {
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("vods")
        .eq("event_id", eventId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.vods && Array.isArray(data.vods)) {
        setVods(data.vods as VODData[]);
      }
    } catch (error) {
      console.error("Erreur chargement VODs:", error);
    }
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

  const getVideoInfo = async (url: string) => {
    try {
      if (newVOD.platform === 'youtube' && url.includes('youtube.com/watch')) {
        const videoId = url.match(/v=([^&]+)/)?.[1];
        if (videoId) {
          return {
            title: `Vidéo YouTube`,
            isPlaylist: false
          };
        }
      } else if (newVOD.platform === 'youtube' && url.includes('playlist')) {
        return {
          title: `Playlist YouTube`,
          isPlaylist: true
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleAddVOD = async () => {
    if (!newVOD.url.trim()) {
      toast({
        title: "Erreur",
        description: "L'URL de la VOD est obligatoire",
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
      // Auto-sélection de tous les joueurs pour un match complet
      const finalVOD = {
        ...newVOD,
        players: newVOD.type === 'match_complet' 
          ? teamMembers.filter(m => ['joueur', 'remplacant', 'capitaine'].includes(m.role)).map(m => m.user_id)
          : newVOD.players,
        validated: false // Par défaut non validé
      };

      const updatedVODs = [...vods, finalVOD];

      // Mettre à jour en base
      const { error } = await supabase
        .from("coaching_sessions")
        .upsert({
          event_id: eventId,
          vods: updatedVODs as any
        }, {
          onConflict: 'event_id'
        });

      if (error) throw error;

      setVods(updatedVODs);
      setNewVOD({
        type: 'match_complet',
        platform: 'youtube',
        url: '',
        players: [],
        tags: [],
        validated: false
      });
      setShowForm(false);
      onVODsUpdated?.();

      toast({
        title: "VOD ajoutée",
        description: "La VOD a été ajoutée avec succès",
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

  const handleRemoveVOD = async (index: number) => {
    const updatedVODs = vods.filter((_, i) => i !== index);
    
    try {
      const { error } = await supabase
        .from("coaching_sessions")
        .upsert({
          event_id: eventId,
          vods: updatedVODs as any
        }, {
          onConflict: 'event_id'
        });

      if (error) throw error;

      setVods(updatedVODs);
      onVODsUpdated?.();

      toast({
        title: "VOD supprimée",
        description: "La VOD a été supprimée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleValidateVOD = async (index: number) => {
    const updatedVODs = [...vods];
    updatedVODs[index].validated = !updatedVODs[index].validated;

    try {
      const { error } = await supabase
        .from("coaching_sessions")
        .upsert({
          event_id: eventId,
          vods: updatedVODs as any
        }, {
          onConflict: 'event_id'
        });

      if (error) throw error;

      setVods(updatedVODs);
      onVODsUpdated?.();

      toast({
        title: updatedVODs[index].validated ? "VOD validée" : "Validation annulée",
        description: updatedVODs[index].validated 
          ? "La VOD est maintenant disponible dans Analyse VOD"
          : "La VOD n'est plus visible dans Analyse VOD",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setNewVOD(prev => ({
      ...prev,
      players: prev.players.includes(playerId)
        ? prev.players.filter(id => id !== playerId)
        : [...prev.players, playerId]
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !newVOD.tags.includes(tag)) {
      setNewVOD(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setNewVOD(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">VODs du Match</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez les VODs YouTube ou Twitch pour ce match
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une VOD
        </Button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Nouvelle VOD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de VOD</Label>
                <Select value={newVOD.type} onValueChange={(value: any) => setNewVOD(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match_complet">Match complet</SelectItem>
                    <SelectItem value="highlights">Highlights</SelectItem>
                    <SelectItem value="vod_perso">VOD personnelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>

            <div>
              <Label>URL de la vidéo/playlist</Label>
              <Input
                value={newVOD.url}
                onChange={(e) => setNewVOD(prev => ({ ...prev, url: e.target.value }))}
                placeholder={newVOD.platform === 'youtube' ? 
                  "https://youtube.com/watch?v=... ou https://youtube.com/playlist?list=..." : 
                  "https://twitch.tv/videos/..."
                }
              />
            </div>

            {/* Sélection des joueurs */}
            {newVOD.type !== 'match_complet' && (
              <div>
                <Label>Joueurs associés</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {teamMembers.filter(m => ['joueur', 'remplacant', 'capitaine'].includes(m.role)).map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={member.id}
                        checked={newVOD.players.includes(member.user_id)}
                        onCheckedChange={() => handlePlayerToggle(member.user_id)}
                      />
                      <Label htmlFor={member.id} className="text-sm cursor-pointer">
                        {member.profiles?.pseudo || 'Pseudo non disponible'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <Label>Tags (optionnel)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {newVOD.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagRemove(tag)}>
                    {tag}
                    <Trash2 className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {['Scrim', 'Tournoi', 'Ranked', 'Coaching', '1v1', 'Review', 'POV'].map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTagAdd(tag)}
                    disabled={newVOD.tags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddVOD} disabled={loading}>
                {loading ? "Ajout..." : "Ajouter la VOD"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des VODs */}
      {vods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2" />
              VODs ajoutées ({vods.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vods.map((vod, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {vod.platform === 'youtube' ? (
                          <Youtube className="w-4 h-4 text-red-500" />
                        ) : (
                          <Twitch className="w-4 h-4 text-primary" />
                        )}
                        <Badge variant="outline">{vod.type.replace('_', ' ')}</Badge>
                        {vod.validated && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validée
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium break-all">{vod.url}</p>
                        {vod.players.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span className="text-xs text-muted-foreground">
                              {vod.players.length === teamMembers.filter(m => ['joueur', 'remplacant', 'capitaine'].includes(m.role)).length
                                ? "Toute l'équipe"
                                : `${vod.players.length} joueur(s)`
                              }
                            </span>
                          </div>
                        )}
                        {vod.tags.length > 0 && (
                          <div className="flex items-center space-x-1 flex-wrap">
                            <Tag className="w-3 h-3" />
                            {vod.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVOD(vod)}
                      >
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant={vod.validated ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleValidateVOD(index)}
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveVOD(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {vods.length === 0 && !showForm && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune VOD ajoutée pour ce match</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cliquez sur "Ajouter une VOD" pour commencer
            </p>
          </CardContent>
        </Card>
      )}

      {/* VOD Viewer */}
      {selectedVOD && (
        <VODViewer
          vod={selectedVOD}
          isOpen={!!selectedVOD}
          onClose={() => setSelectedVOD(null)}
          showExternalLink={true}
        />
      )}
    </div>
  );
};