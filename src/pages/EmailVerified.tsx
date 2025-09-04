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
        console.log("🔗 Processing email verification...");
        console.log("📍 Current URL:", window.location.href);
        console.log("📍 Hash:", window.location.hash);
        console.log("📍 Search:", window.location.search);
        
        // Récupérer les paramètres depuis le hash (#) ET la query string
        // Supabase place souvent les tokens dans le fragment d'URL
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : '');
        
        // Vérifier d'abord s'il y a des erreurs dans l'URL (query params ET hash)
        const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
        const error = searchParams.get('error') || hashParams.get('error');
        
        console.log("❌ Error check:", { error, errorCode, errorDescription });
        
        if (error || errorCode) {
          console.log("❌ Email verification error:", { error, errorCode, errorDescription });
          
          let friendlyError = "Le lien de vérification est invalide ou a expiré.";
          if (errorCode === 'otp_expired') {
            friendlyError = "Le lien de vérification a expiré. Veuillez vous inscrire à nouveau.";
          } else if (error === 'access_denied') {
            friendlyError = "Accès refusé. Le lien de vérification est invalide.";
          }
          
          throw new Error(friendlyError);
        }

        const access_token = hashParams.get('access_token') || searchParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const code = searchParams.get('code') || hashParams.get('code');

        // 1) Nouveau flux OAuth/PKCE: échange du "code" contre une session
        if (code && (!access_token || !refresh_token)) {
          console.log("🔄 Exchanging code for session...");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }

          if (data?.user) {
            console.log("✅ User verified via code exchange", data.user.id);
            setVerified(true);

            const pendingCode = localStorage.getItem("pending_team_code");
            if (pendingCode) {
              console.log("🏃 Joining team with code:", pendingCode);
              const { data: joinResult, error: joinError } = await supabase.rpc('join_team_with_code', { p_code: pendingCode });

              if (!joinError && joinResult?.[0]) {
                const teamName = localStorage.getItem("pending_team_name") || "votre équipe";
                const roleText = joinResult[0].assigned_role || 'joueur';
                localStorage.removeItem("pending_team_code");
                localStorage.removeItem("pending_team_name");
                toast({ title: "Inscription réussie !", description: `Bienvenue dans l'équipe ${teamName} en tant que ${roleText} !` });
                setTimeout(() => navigate("/player"), 2000);
                return;
              } else {
                console.error("❌ Failed to join team:", joinError);
              }
            }

            toast({ title: "Email vérifié !", description: "Votre compte a été créé avec succès." });
            setTimeout(() => navigate("/"), 2000);
            return;
          }
        }

        // 2) Ancien flux: tokens directement dans l'URL
        if (type === 'signup' && access_token && refresh_token) {
          console.log("📧 Setting session from email verification");
          const { data: { user }, error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
          if (sessionError) {
            throw sessionError;
          }

          if (user) {
            console.log("✅ User verified successfully", user.id);
            setVerified(true);

            // Vérifier si l'utilisateur doit rejoindre une équipe
            const pendingCode = localStorage.getItem("pending_team_code");
            if (pendingCode) {
              console.log("🏃 Joining team with code:", pendingCode);
              const { data: joinResult, error: joinError } = await supabase.rpc('join_team_with_code', { p_code: pendingCode });

              if (!joinError && joinResult?.[0]) {
                const teamName = localStorage.getItem("pending_team_name") || "votre équipe";
                const roleText = joinResult[0].assigned_role || 'joueur';
                localStorage.removeItem("pending_team_code");
                localStorage.removeItem("pending_team_name");
                toast({ title: "Inscription réussie !", description: `Bienvenue dans l'équipe ${teamName} en tant que ${roleText} !` });
                setTimeout(() => navigate("/player"), 2000);
                return;
              } else {
                console.error("❌ Failed to join team:", joinError);
              }
            }

            toast({ title: "Email vérifié !", description: "Votre compte a été créé avec succès." });
            setTimeout(() => navigate("/"), 2000);
          } else {
            throw new Error("Aucun utilisateur trouvé après vérification");
          }
        } else {
          throw new Error("Paramètres de vérification manquants ou invalides");
        }
      } catch (error: any) {
        console.error("❌ Email verification failed:", error);
        setError(error.message || "Erreur lors de la vérification");
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, toast]);

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
                Email vérifié !
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
            <p className="text-muted-foreground">
              Votre email a été vérifié avec succès. Redirection en cours...
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {error || "Le lien de vérification est invalide ou a expiré."}
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full"
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