import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
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
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    const checkAuthStatusAndRedirect = async () => {
      if (user) {
        // Vérifier si l'utilisateur a un code d'équipe en attente
        const pendingCode = localStorage.getItem("pending_team_code");
        if (pendingCode) {
          // L'utilisateur vient de vérifier son email, rejoindre l'équipe automatiquement
          try {
            const { data: joinResult, error: joinError } = await supabase.rpc('join_team_with_code', {
              p_code: pendingCode
            });

            if (!joinError && joinResult?.[0]) {
              const teamName = localStorage.getItem("pending_team_name") || "votre équipe";
              const roleText = joinResult[0].assigned_role || 'joueur';
              
              // Nettoyer le localStorage
              localStorage.removeItem("pending_team_code");
              localStorage.removeItem("pending_team_name");

              toast({
                title: "Bienvenue !",
                description: `Vous avez rejoint ${teamName} en tant que ${roleText} !`,
              });

              // Redirection vers le dashboard joueur
              navigate("/player");
              return;
            }
          } catch (error) {
            console.error("Erreur jointure équipe:", error);
          }
        } else {
          navigate("/");
        }
      }
    };

    checkAuthStatusAndRedirect();
  }, [user, navigate, toast]);

  // Écouter les changements d'auth pour détecter la vérification email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // L'utilisateur vient de se connecter (probablement via email verification)
        const pendingCode = localStorage.getItem("pending_team_code");
        if (pendingCode) {
          try {
            const { data: joinResult, error: joinError } = await supabase.rpc('join_team_with_code', {
              p_code: pendingCode
            });

            if (!joinError && joinResult?.[0]) {
              const teamName = localStorage.getItem("pending_team_name") || "votre équipe";
              const roleText = joinResult[0].assigned_role || 'joueur';
              
              // Nettoyer le localStorage
              localStorage.removeItem("pending_team_code");
              localStorage.removeItem("pending_team_name");

              toast({
                title: "Inscription réussie !",
                description: `Bienvenue dans l'équipe ${teamName} en tant que ${roleText} !`,
              });

              // Redirection vers le dashboard joueur
              navigate("/player");
            }
          } catch (error) {
            console.error("Erreur jointure équipe après vérification:", error);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

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
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (userType === 'staff') {
        await handleStaffSignup();
      } else {
        await handlePlayerSignup();
      }
    } catch (error: any) {
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

    toast({
      title: "Inscription réussie !",
      description: "Vérifiez votre email pour confirmer votre compte.",
    });
  };

  const handlePlayerSignup = async () => {
    // Vérification du code d'équipe
    if (!teamInfo) {
      throw new Error("Code d'équipe invalide");
    }

    // Stocker le code d'équipe pour après vérification email
    localStorage.setItem("pending_team_code", code.trim().toUpperCase());
    if (teamInfo?.name) localStorage.setItem("pending_team_name", teamInfo.name);

    // Inscription sans emailRedirectTo pour éviter les problèmes de redirection
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          pseudo: pseudo.trim(),
          birth_date: format(birthDate!, 'yyyy-MM-dd'),
        },
      },
    });

    if (error) throw error;

    toast({
      title: "Email envoyé !",
      description: "Vérifiez votre boîte mail et cliquez sur le lien pour finaliser votre inscription. Vous serez automatiquement redirigé ici.",
    });
  };

  const resetForm = () => {
    setPseudo("");
    setEmail("");
    setBirthDate(undefined);
    setPassword("");
    setCode("");
    setTeamInfo(null);
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
                          type="text"
                          placeholder="JJ/MM/AAAA"
                          value={birthDate ? format(birthDate, "dd/MM/yyyy") : ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Format automatique pendant la saisie
                            let formatted = value.replace(/\D/g, '');
                            if (formatted.length >= 2) {
                              formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
                            }
                            if (formatted.length >= 5) {
                              formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
                            }
                            e.target.value = formatted;
                            
                            // Essayer de parser la date si elle est complète
                            if (formatted.length === 10) {
                              const [day, month, year] = formatted.split('/').map(Number);
                              if (day && month && year && year >= 1900 && year <= new Date().getFullYear()) {
                                const date = new Date(year, month - 1, day);
                                if (date.getDate() === day && date.getMonth() === month - 1) {
                                  setBirthDate(date);
                                }
                              }
                            } else if (formatted === "") {
                              setBirthDate(undefined);
                            }
                          }}
                          className="pr-10"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            >
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={birthDate}
                              onSelect={setBirthDate}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
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
      </div>
    </div>
  );
};

export default Auth;