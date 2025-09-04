import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { useParams } from "react-router-dom";

interface PlayerInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerAdded: () => void;
}

export const PlayerInviteModal = ({ isOpen, onClose, onPlayerAdded }: PlayerInviteModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const { toast } = useToast();
  const { token } = useParams();

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Si l'utilisateur se connecte avec succès après validation email
        if (event === 'SIGNED_IN' && session?.user && waitingForVerification) {
          console.log("✅ Email validé dans PlayerInviteModal, fermeture du modal");
          
          // Fermer le modal et laisser Index.tsx gérer la suite
          setWaitingForVerification(false);
          resetForm();
          toast({
            title: "Email vérifié !",
            description: "Ajout à l'équipe en cours...",
          });
          onClose(); // Fermer le modal pour laisser Index.tsx prendre le relais
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [waitingForVerification, onClose, toast]);

  const handlePlayerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !pseudo) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Créer le compte joueur avec redirection vers la page de confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verified?token=${token}&email=${encodeURIComponent(email)}`,
          data: {
            pseudo: pseudo,
            role: 'player'
          },
        },
      });

      if (authError) throw authError;

      setWaitingForVerification(true);
      setLoading(false);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour confirmer votre compte et rejoindre l'équipe.",
      });

    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPseudo("");
    setLoading(false);
    setWaitingForVerification(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Rejoindre l'équipe</DialogTitle>
              <DialogDescription>
                Créez votre compte pour rejoindre cette équipe
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {waitingForVerification ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Vérifiez votre email</h3>
              <p className="text-sm text-muted-foreground">
                Un email de vérification a été envoyé à <strong>{email}</strong>. 
                Cliquez sur le lien dans l'email pour rejoindre l'équipe.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">En attente de vérification...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlayerSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-pseudo">Pseudo</Label>
              <Input
                id="player-pseudo"
                type="text"
                placeholder="Votre pseudo de joueur"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player-email">Email</Label>
              <Input
                id="player-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player-password">Mot de passe</Label>
              <PasswordInput
                id="player-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Rejoindre l'équipe"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};