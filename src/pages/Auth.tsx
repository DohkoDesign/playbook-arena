import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Calendar, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'staff' | 'player'>('staff');
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [teamInfo, setTeamInfo] = useState<{id: string, name: string, role?: string} | null>(null);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Valider le code d'équipe en temps réel pour les joueurs
  useEffect(() => {
    if (!isLogin && userType === 'player' && code.length >= 4) {
      const validateCode = async () => {
        try {
          const { data, error } = await supabase.rpc('validate_team_code', {
            p_code: code.trim().toUpperCase()
          });

          if (data && data.length > 0) {
            setTeamInfo({ 
              id: data[0].team_id, 
              name: data[0].team_name,
              role: data[0].role 
            });
          } else {
            setTeamInfo(null);
          }
        } catch (error) {
          setTeamInfo(null);
        }
      };

      const timeoutId = setTimeout(validateCode, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setTeamInfo(null);
    }
  }, [code, isLogin, userType]);

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
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Core Link !",
      });
      
      navigate("/");
    } catch (error: any) {
      const msg = (error?.message || '').toString();
      if (msg.toLowerCase().includes('email not confirmed') || error?.code === 'email_not_confirmed') {
        try {
          await supabase.auth.resend({ type: 'signup', email: email.trim() });
          toast({
            title: "Confirmation requise",
            description: "Email de confirmation renvoyé. Vérifiez votre boîte mail et vos spams.",
          });
        } catch (e: any) {
          toast({
            title: "Impossible d'envoyer l'email",
            description: e?.message || 'Veuillez réessayer dans quelques minutes.',
            variant: "destructive",
          });
        }
      } else if (msg.toLowerCase().includes('invalid credentials') || msg.toLowerCase().includes('invalid login credentials')) {
        toast({
          title: "Identifiants incorrects",
          description: "Email ou mot de passe incorrect. Vérifiez vos informations.",
          variant: "destructive",
        });
      } else if (msg.toLowerCase().includes('too many requests')) {
        toast({
          title: "Trop de tentatives",
          description: "Veuillez attendre quelques minutes avant de réessayer.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: msg || "Une erreur est survenue lors de la connexion.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Starting signup process...");
    
    if (!pseudo || !email || !birthDate || !password || !code) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    // Validation de l'âge
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      toast({
        title: "Âge invalide",
        description: "Vous devez avoir au moins 13 ans pour vous inscrire",
        variant: "destructive",
      });
      return;
    }

    // Validation du mot de passe
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

    setLoading(true);
    try {
      console.log(`📝 Signing up as ${userType}...`);
      
      if (userType === 'staff') {
        await handleStaffSignup();
      } else {
        await handlePlayerSignup();
      }
      
      console.log("✅ Signup completed successfully");
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSignup = async () => {
    // Vérification du code bêta
    const { data: isValidBeta, error: betaError } = await supabase
      .rpc("validate_beta_code_exists", { 
        code_input: code.trim().toUpperCase() 
      });

    if (betaError || !isValidBeta) {
      throw new Error("Code bêta invalide ou expiré");
    }

    // Inscription
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          pseudo: pseudo.trim(),
          birth_date: format(birthDate!, 'yyyy-MM-dd'),
          user_type: 'staff', // Préciser le type d'utilisateur
        },
        emailRedirectTo: `${window.location.origin}/email-verified`
      },
    });

    if (error) throw error;

    // Consommation du code bêta
    if (signUpData.user?.id) {
      const { data: rpcRes, error: rpcError } = await supabase.rpc(
        "validate_and_use_beta_code",
        { beta_code: code.trim().toUpperCase(), user_id: signUpData.user.id }
      );
      if (rpcError || rpcRes !== true) {
        await supabase.auth.signOut();
        throw new Error("Impossible de valider le code bêta.");
      }
    }

    // Afficher popup de confirmation
    showEmailConfirmationPopup();
  };

  const handlePlayerSignup = async () => {
    // Vérification du code d'équipe
    if (!teamInfo) {
      throw new Error("Code d'équipe invalide");
    }

    // Stocker le code d'équipe pour après vérification email
    localStorage.setItem("pending_team_code", code.trim().toUpperCase());
    if (teamInfo?.name) localStorage.setItem("pending_team_name", teamInfo.name);

    // Inscription
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          pseudo: pseudo.trim(),
          birth_date: format(birthDate!, 'yyyy-MM-dd'),
          user_type: 'player', // Préciser le type d'utilisateur
        },
        emailRedirectTo: `${window.location.origin}/email-verified`,
      },
    });

    if (error) throw error;

    // Afficher popup de confirmation
    showEmailConfirmationPopup();
  };

  const resetForm = () => {
    setPseudo("");
    setEmail("");
    setBirthDate(undefined);
    setPassword("");
    setCode("");
    setTeamInfo(null);
  };

  const showEmailConfirmationPopup = () => {
    console.log("📧 Showing email confirmation popup");
    setShowEmailPopup(true);
    // Auto-fermeture après 5 secondes
    setTimeout(() => {
      console.log("⏰ Auto-closing popup after 5 seconds");
      setShowEmailPopup(false);
      setIsLogin(true); // Basculer vers l'onglet connexion
      resetForm(); // Nettoyer le formulaire
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec retour */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <Card className="shadow-2xl border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isLogin ? "Connexion" : "Inscription"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? "Connectez-vous à votre compte Core Link"
                : "Créez votre compte Core Link"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={isLogin ? "login" : "signup"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" onClick={() => setIsLogin(true)}>
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>
                  Inscription
                </TabsTrigger>
              </TabsList>

              {/* Onglet Connexion */}
              <TabsContent value="login">
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
              </TabsContent>

              {/* Onglet Inscription */}
              <TabsContent value="signup">
                <div className="space-y-4">
                  {/* Sélection du type d'utilisateur */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={userType === 'staff' ? 'default' : 'outline'}
                      onClick={() => {
                        setUserType('staff');
                        resetForm();
                      }}
                      className="h-auto py-3"
                    >
                      <div className="text-center">
                        <div className="font-medium">Staff</div>
                        <div className="text-xs opacity-80">Créer une équipe</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={userType === 'player' ? 'default' : 'outline'}
                      onClick={() => {
                        setUserType('player');
                        resetForm();
                      }}
                      className="h-auto py-3"
                    >
                      <div className="text-center">
                        <div className="font-medium">Joueur</div>
                        <div className="text-xs opacity-80">Rejoindre une équipe</div>
                      </div>
                    </Button>
                  </div>

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
                      <Label htmlFor="signup-birth">Date de naissance</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={birthDate ? format(birthDate, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              setBirthDate(new Date(e.target.value));
                            } else {
                              setBirthDate(undefined);
                            }
                          }}
                          max={format(new Date(), "yyyy-MM-dd")}
                          min="1900-01-01"
                          className="pr-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vous devez avoir au moins 13 ans pour vous inscrire
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

                    <div className="space-y-2">
                      <Label htmlFor="signup-code">
                        {userType === 'staff' ? 'Code bêta' : 'Code d\'équipe'}
                      </Label>
                      <Input
                        id="signup-code"
                        type="text"
                        placeholder={userType === 'staff' ? 'Votre code bêta' : 'Code fourni par votre équipe'}
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        required
                      />
                      {userType === 'player' && teamInfo && (
                        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-md">
                          <p className="text-sm text-green-700 dark:text-green-300">
                            ✓ Équipe trouvée: <span className="font-medium">{teamInfo.name}</span>
                            {teamInfo.role && <span className="ml-2 text-xs">({teamInfo.role})</span>}
                          </p>
                        </div>
                      )}
                      {userType === 'player' && code.length >= 4 && !teamInfo && (
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md">
                          <p className="text-sm text-red-700 dark:text-red-300">
                            ✗ Code d'équipe invalide ou expiré
                          </p>
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || (userType === 'player' && !teamInfo)}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Inscription en cours...
                        </>
                      ) : (
                        `S'inscrire ${userType === 'staff' ? 'comme staff' : 'comme joueur'}`
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Popup de confirmation email */}
        <AlertDialog open={showEmailPopup} onOpenChange={setShowEmailPopup}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Email de vérification envoyé
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Un email de confirmation vient d'être envoyé à <strong>{email}</strong>.
                </p>
                <p className="text-sm text-muted-foreground">
                  Vérifiez votre boîte de réception et cliquez sur le lien de validation pour activer votre compte.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => {
                  setShowEmailPopup(false);
                  setIsLogin(true);
                  resetForm();
                }}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Compris
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Auth;