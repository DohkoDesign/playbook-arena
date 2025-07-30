import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const ROLES = [
  { value: "joueur", label: "Joueur" },
  { value: "remplacant", label: "Remplaçant" },
  { value: "coach", label: "Coach" },
  { value: "manager", label: "Manager" },
  { value: "capitaine", label: "Capitaine" },
];

export const InvitationModal = ({ isOpen, onClose, teamId, teamName }: InvitationModalProps) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [invitationLink, setInvitationLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeInvitations, setActiveInvitations] = useState<any[]>([]);
  const { toast } = useToast();

  const generateInvitation = async () => {
    if (!selectedRole) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rôle",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Générer un token unique
      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from("invitations")
        .insert({
          team_id: teamId,
          role: selectedRole as any,
          token,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/join/${token}`;
      setInvitationLink(link);
      
      toast({
        title: "Invitation créée",
        description: "Le lien d'invitation a été généré avec succès",
      });

      fetchActiveInvitations();
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

  const fetchActiveInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("team_id", teamId)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActiveInvitations(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des invitations:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le lien d'invitation a été copié dans le presse-papiers",
    });
  };

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours > 0) {
      return `Expire dans ${diffHours}h`;
    } else {
      return "Expiré";
    }
  };

  // Charger les invitations actives à l'ouverture
  useEffect(() => {
    if (isOpen) {
      fetchActiveInvitations();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inviter un joueur - {teamName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Création nouvelle invitation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Créer une nouvelle invitation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rôle du joueur</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={generateInvitation} disabled={loading} className="w-full">
                {loading ? "Génération..." : "Générer le lien d'invitation"}
              </Button>

              {invitationLink && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Lien généré:</span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Valable 24h
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input value={invitationLink} readOnly className="text-xs" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(invitationLink)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invitations actives */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Invitations actives</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeInvitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune invitation active
                </p>
              ) : (
                <div className="space-y-3">
                  {activeInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{invitation.role}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatExpirationDate(invitation.expires_at)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Créé le {new Date(invitation.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/join/${invitation.token}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};