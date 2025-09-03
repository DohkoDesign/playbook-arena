import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
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
  const [age, setAge] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(30);
  const { toast } = useToast();

  // Timer pour la popup de vérification d'email (30 secondes)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (waitingForVerification && verificationTimer > 0) {
      timer = setTimeout(() => {
        setVerificationTimer(prev => prev - 1);
      }, 1000);
    } else if (waitingForVerification && verificationTimer === 0) {
      // Fermer la popup après 30 secondes
      setWaitingForVerification(false);
      setVerificationTimer(30);
      handleClose();
      toast({
        title: "Vérification en attente",
        description: "Cliquez sur le lien dans votre email pour finaliser votre inscription.",
      });
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [waitingForVerification, verificationTimer]);

  // Écouter les changements d'état d'authentification pour détecter la vérification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth state change:", event, session?.user?.email_confirmed_at);
        
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && waitingForVerification) {
          console.log("✅ Email verified! Closing verification popup and calling success callback");
          setWaitingForVerification(false);
          setVerificationTimer(30);
          setLoading(false);
          
          // Fermer la popup
          handleClose();
          
          // Appeler le callback de succès - cela va gérer la redirection
          onSignupSuccess();
          
          toast({
            title: "Email vérifié !",
            description: "Redirection vers votre dashboard...",
          });
        }
        
        // Détection d'une connexion après clic sur lien email (sans popup ouverte)
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && !waitingForVerification) {
          console.log("🔗 User signed in via email verification link - calling success callback");
          // L'utilisateur a cliqué sur le lien dans l'email directement
          onSignupSuccess();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [waitingForVerification, onSignupSuccess]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !pseudo || !age || !betaCode) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    // Validation de l'âge
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      toast({
        title: "Âge invalide",
        description: "L'âge doit être entre 13 et 100 ans",
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

    try {
      setLoading(true);

      // Vérification de l'âge
      const userAge = parseInt(age);
      if (isNaN(userAge) || userAge < 13) {
        throw new Error("Vous devez avoir au moins 13 ans pour vous inscrire");
      }

      // Vérification du code bêta AVANT l'inscription avec fonction sécurisée
      const { data: isValidBeta, error: betaError } = await supabase
        .rpc("validate_beta_code_exists", { 
          code_input: betaCode.trim().toUpperCase() 
        });

      if (betaError) {
        throw new Error("Erreur lors de la vérification du code bêta");
      }

      if (!isValidBeta) {
        throw new Error("Code bêta invalide ou expiré");
      }

      // Inscription de l'utilisateur
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            pseudo: pseudo.trim(),
            age: userAge,
          },
          emailRedirectTo: `${window.location.origin}/`
        },
      });

      if (error) throw error;

      // Consommation du code bêta côté serveur
      const userId = signUpData.user?.id;
      if (userId) {
        const { data: rpcRes, error: rpcError } = await supabase.rpc(
          "validate_and_use_beta_code",
          { beta_code: betaCode.trim().toUpperCase(), user_id: userId }
        );
        if (rpcError || rpcRes !== true) {
          await supabase.auth.signOut();
          throw new Error("Impossible de valider le code bêta. Réessayez ou contactez le support.");
        }
      }

      setWaitingForVerification(true);
      setVerificationTimer(30);
      toast({
        title: "Inscription réussie !",
        description: "Vérifiez votre email pour confirmer votre compte.",
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
        description: "Bienvenue sur Core.gg !",
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
    setAge("");
    setBetaCode("");
    setLoading(false);
    setWaitingForVerification(false);
    setVerificationTimer(30);
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
            <DialogTitle>Créer un compte créateur d'équipe</DialogTitle>
            <DialogDescription>
              Utilisez votre code bêta pour créer un compte et gérer vos équipes esport
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
                <span className="text-sm text-muted-foreground">
                  Fermeture automatique dans {verificationTimer}s...
                </span>
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
                <Label htmlFor="signup-age">Âge</Label>
                <Input
                  id="signup-age"
                  type="number"
                  min="13"
                  placeholder="Votre âge"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Vous devez avoir au moins 13 ans
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-beta">Code bêta</Label>
                <Input
                  id="signup-beta"
                  type="text"
                  placeholder="Votre code d'accès bêta"
                  value={betaCode}
                  onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Contactez l'équipe pour obtenir votre code bêta
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <PasswordInput
                  id="signup-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 caractères avec lettres et chiffres
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer mon compte créateur"
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
              Connectez-vous à votre compte Core Link
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
              <PasswordInput
                id="login-password"
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