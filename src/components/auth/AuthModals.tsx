import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";

interface AuthModalsProps {
  isSignupOpen: boolean;
  isLoginOpen: boolean;
  onClose: () => void;
  onSignupSuccess: () => void;
  onLoginSuccess: () => void;
}

export const AuthModals = ({
  isSignupOpen,
  isLoginOpen,
  onClose,
  onSignupSuccess,
  onLoginSuccess,
}: AuthModalsProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const { toast } = useToast();

  // Écouter les changements d'état d'authentification pour détecter la vérification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && waitingForVerification) {
          setWaitingForVerification(false);
          setLoading(false);
          onSignupSuccess();
          toast({
            title: "Email vérifié !",
            description: "Votre compte a été créé avec succès.",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [waitingForVerification, onSignupSuccess, toast]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !pseudo) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    // Client-side password validation
    if (password.length < 8) {
      toast({
        title: "Mot de passe faible",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      });
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast({
        title: "Mot de passe faible",
        description: "Le mot de passe doit contenir au moins une lettre et un chiffre",
        variant: "destructive",
      });
      return;
    }

    if (!betaCode.trim()) {
      toast({
        title: "Code bêta requis",
        description: "Veuillez saisir votre code bêta pour créer un compte",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Pré-validation du code bêta (non consommante)
      const { data: beta, error: betaError } = await supabase
        .from("beta_codes")
        .select("id")
        .eq("code", betaCode.trim())
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (betaError || !beta) {
        throw new Error("Code bêta invalide ou expiré");
      }

      // Inscription
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            pseudo: pseudo,
          },
        },
      });

      if (error) throw error;

      // Consommation du code bêta côté serveur (liaison à l'utilisateur)
      const userId = signUpData.user?.id;
      if (userId) {
        const { data: rpcRes, error: rpcError } = await supabase.rpc(
          "validate_and_use_beta_code",
          { beta_code: betaCode.trim(), user_id: userId }
        );
        if (rpcError || rpcRes !== true) {
          await supabase.auth.signOut();
          throw new Error("Impossible de valider le code bêta. Réessayez ou contactez le support.");
        }
      }

      setWaitingForVerification(true);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour confirmer votre compte.",
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      onLoginSuccess();
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Shadow Hub !",
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
    <>
      {/* Modal d'inscription */}
      <Dialog open={isSignupOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un compte</DialogTitle>
            <DialogDescription>
              Rejoignez Shadow Hub pour gérer vos équipes esport
            </DialogDescription>
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
                  Cliquez sur le lien dans l'email pour continuer.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">En attente de vérification...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-pseudo">Pseudo</Label>
                <Input
                  id="signup-pseudo"
                  type="text"
                  placeholder="Votre pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-beta">Code bêta</Label>
                <Input
                  id="signup-beta"
                  type="text"
                  placeholder="SH-BETA-2024-0XX-XXXXX"
                  value={betaCode}
                  onChange={(e) => setBetaCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <Input
                  id="signup-password"
                  type="password"
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
                  "Créer mon compte"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de connexion */}
      <Dialog open={isLoginOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion</DialogTitle>
            <DialogDescription>
              Connectez-vous à votre compte Shadow Hub
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Mot de passe</Label>
              <Input
                id="login-password"
                type="password"
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
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};