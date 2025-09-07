import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Récupérer les paramètres d'URL
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : '');
        
        // Vérifier s'il y a des erreurs
        const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const error = searchParams.get('error') || hashParams.get('error');
        
        if (error || errorCode) {
          throw new Error("Le lien de vérification est invalide ou a expiré.");
        }

        // Vérifier le code d'échange
        const code = searchParams.get('code') || hashParams.get('code');
        
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            throw exchangeError;
          }

          if (data?.user) {
            setVerified(true);
            
            // Gérer la jointure d'équipe si nécessaire
            const pendingCode = localStorage.getItem("pending_team_code");
            if (pendingCode) {
              const { data: joinResult, error: joinError } = await supabase.rpc('join_team_with_code', { 
                p_code: pendingCode 
              });

              if (!joinError && joinResult?.[0]) {
                const teamName = localStorage.getItem("pending_team_name") || "votre équipe";
                const roleText = joinResult[0].assigned_role || 'joueur';
                localStorage.removeItem("pending_team_code");
                localStorage.removeItem("pending_team_name");
                
                toast({ 
                  title: "Compte créé et équipe rejointe !", 
                  description: `Bienvenue dans l'équipe ${teamName} en tant que ${roleText} !` 
                });
                return;
              }
            }

            toast({ 
              title: "Email vérifié !", 
              description: "Votre compte a été créé avec succès." 
            });
            return;
          }
        }

        // Vérifier les tokens directs (ancien système)
        const access_token = hashParams.get('access_token') || searchParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');

        if (type === 'signup' && access_token && refresh_token) {
          const { data: { user }, error: sessionError } = await supabase.auth.setSession({ 
            access_token, 
            refresh_token 
          });
          
          if (sessionError) {
            throw sessionError;
          }

          if (user) {
            setVerified(true);
            
            // Gérer la jointure d'équipe si nécessaire
            const pendingCode = localStorage.getItem("pending_team_code");
            if (pendingCode) {
              const { data: joinResult, error: joinError } = await supabase.rpc('join_team_with_code', { 
                p_code: pendingCode 
              });

              if (!joinError && joinResult?.[0]) {
                const teamName = localStorage.getItem("pending_team_name") || "votre équipe";
                const roleText = joinResult[0].assigned_role || 'joueur';
                localStorage.removeItem("pending_team_code");
                localStorage.removeItem("pending_team_name");
                
                toast({ 
                  title: "Compte créé et équipe rejointe !", 
                  description: `Bienvenue dans l'équipe ${teamName} en tant que ${roleText} !` 
                });
                return;
              }
            }

            toast({ 
              title: "Email vérifié !", 
              description: "Votre compte a été créé avec succès." 
            });
            return;
          }
        }
        
        throw new Error("Aucun paramètre de validation valide trouvé.");
        
      } catch (error: any) {
        setError(error.message || "Erreur lors de la vérification");
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    handleEmailVerification();
  }, [searchParams, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Vérification en cours...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Validation de votre email en cours...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            {verified ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                Email vérifié avec succès !
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                Erreur de vérification
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {verified ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Votre adresse email a été vérifiée avec succès. Votre compte est maintenant actif et vous pouvez vous connecter.
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full"
              >
                Se connecter
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {error || "Le lien de vérification est invalide ou a expiré."}
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full"
                variant="outline"
              >
                Retourner à la connexion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerified;