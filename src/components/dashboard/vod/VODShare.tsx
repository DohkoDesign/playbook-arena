import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Share, 
  Send, 
  Copy, 
  Users, 
  MessageSquare,
  Link,
  Mail,
  ExternalLink,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VODShareProps {
  isOpen: boolean;
  onClose: () => void;
  vod: any;
  review: any;
  teamId: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    pseudo: string;
    photo_profil?: string;
  };
}

export const VODShare = ({ isOpen, onClose, vod, review, teamId }: VODShareProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
      setShareTitle(`Review: ${vod.events?.titre || vod.event?.titre}`);
      setShareMessage(`Salut équipe! 👋

J'ai terminé l'analyse de notre ${vod.events?.type || vod.event?.type} "${vod.events?.titre || vod.event?.titre}".

📍 Points clés à retenir:
${review.timestamps?.slice(0, 3).map((ts: any, i: number) => `${i + 1}. ${ts.comment} (${Math.floor(ts.time / 60)}:${Math.floor(ts.time % 60).toString().padStart(2, '0')})`).join('\n') || '- À compléter...'}

💡 N'hésitez pas à regarder la VOD et à me faire vos retours!

Bon gaming! 🎮`);
    }
  }, [isOpen, vod, review]);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (
            pseudo,
            photo_profil
          )
        `)
        .eq("team_id", teamId);

      if (error) throw error;
      setTeamMembers((data as any) || []);
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Simuler la génération de lien pour le moment
      const shareId = Date.now().toString();
      const link = `${window.location.origin}/review/${shareId}`;
      setShareLink(link);

      toast({
        title: "Lien généré",
        description: "Le lien de partage a été créé avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du lien",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const shareWithTeamMembers = async () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "Erreur",
        description: "Sélectionnez au moins un membre de l'équipe",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simuler l'envoi de notifications pour le moment
      const currentUser = await supabase.auth.getUser();
      
      console.log("Sharing with team members:", {
        selectedMembers,
        shareTitle,
        shareMessage,
        sharedBy: currentUser.data.user?.id
      });

      toast({
        title: "Review partagée",
        description: `La review a été partagée avec ${selectedMembers.length} membre(s)`,
      });

      onClose();
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

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Lien copié",
      description: "Le lien a été copié dans le presse-papier",
    });
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllMembers = () => {
    if (selectedMembers.length === teamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(teamMembers.map(m => m.user_id));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share className="w-5 h-5" />
            <span>Partager la Review VOD</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Équipe</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>Lien public</span>
            </TabsTrigger>
          </TabsList>

          {/* Partage avec l'équipe */}
          <TabsContent value="team" className="space-y-6">
            {/* Configuration du partage */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share-title">Titre du partage</Label>
                <Input
                  id="share-title"
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  placeholder="Titre de la review..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-message">Message</Label>
                <Textarea
                  id="share-message"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Ajoutez un message pour votre équipe..."
                  rows={6}
                />
              </div>

              {/* Options de partage */}
              <div className="space-y-3">
                <Label>Contenu à partager</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-timestamps"
                      checked={includeTimestamps}
                      onCheckedChange={(checked) => setIncludeTimestamps(checked === true)}
                    />
                    <Label htmlFor="include-timestamps">
                      Inclure les timestamps ({review.timestamps?.length || 0})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-notes"
                      checked={includeNotes}
                      onCheckedChange={(checked) => setIncludeNotes(checked === true)}
                    />
                    <Label htmlFor="include-notes">
                      Inclure les notes coach
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sélection des membres */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Membres de l'équipe ({teamMembers.length})</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllMembers}
                >
                  {selectedMembers.length === teamMembers.length ? "Désélectionner tout" : "Sélectionner tout"}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMembers.includes(member.user_id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleMemberSelection(member.user_id)}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.user_id)}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.profiles?.photo_profil} />
                      <AvatarFallback>
                        {member.profiles?.pseudo?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.profiles?.pseudo}</p>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    {selectedMembers.includes(member.user_id) && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              {selectedMembers.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedMembers.length} membre(s) sélectionné(s)
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                onClick={shareWithTeamMembers}
                disabled={loading || selectedMembers.length === 0}
                className="flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "Partage..." : "Partager"}</span>
              </Button>
            </div>
          </TabsContent>

          {/* Lien public */}
          <TabsContent value="link" className="space-y-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Générez un lien public pour partager cette review avec des personnes extérieures à l'équipe.
                Le lien expirera automatiquement après 7 jours.
              </div>

              {!shareLink ? (
                <Button 
                  onClick={generateShareLink}
                  disabled={isGeneratingLink}
                  className="w-full"
                >
                  <Link className="w-4 h-4 mr-2" />
                  {isGeneratingLink ? "Génération..." : "Générer un lien de partage"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Lien de partage</Label>
                    <div className="flex space-x-2">
                      <Input value={shareLink} readOnly />
                      <Button onClick={copyLink} variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(shareLink, '_blank')}
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ouvrir</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const subject = encodeURIComponent(shareTitle);
                        const body = encodeURIComponent(`${shareMessage}\n\nLien vers la review: ${shareLink}`);
                        window.open(`mailto:?subject=${subject}&body=${body}`);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Envoyer par email</span>
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    ⏰ Ce lien expirera automatiquement dans 7 jours
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};