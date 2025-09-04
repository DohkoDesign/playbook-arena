import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [teamJoined, setTeamJoined] = useState(false);
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const teamCode = searchParams.get("team_code");

  const handleContinue = () => {
    if (teamJoined) {
      window.location.href = "/player";
    } else if (token) {
      window.location.href = `/join-team/${token}`;
    } else {
      window.location.href = "/";
    }
  };

  // Auto-join team after email verification
  useEffect(() => {
    const joinTeamAfterVerification = async () => {
      // Vérifier si on a un code d'équipe (URL params ou localStorage)
      const codeToUse = teamCode || localStorage.getItem("pending_team_code");
      if (!codeToUse) return;

      setIsJoiningTeam(true);

      try {
        // Attendre que la session soit établie
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          // Attendre l'auth state change
          return;
        }

        const { data: joinResult, error: joinError } = await supabase.rpc('join_team_with_code', {
          p_code: codeToUse
        });

        if (joinError) {
          toast({
            title: "Erreur",
            description: "Impossible de rejoindre l'équipe: " + joinError.message,
            variant: "destructive",
          });
          return;
        }

        const roleInfo = joinResult?.[0];
        const teamName = localStorage.getItem("pending_team_name") || "votre équipe";
        
        // Nettoyer le localStorage
        localStorage.removeItem("pending_team_code");
        localStorage.removeItem("pending_team_name");

        setTeamJoined(true);
        
        toast({
          title: "Bienvenue !",
          description: `Vous avez rejoint ${teamName} en tant que ${roleInfo?.assigned_role || 'joueur'} !`,
        });

        // Redirection automatique après 2 secondes
        setTimeout(() => {
          window.location.href = "/player";
        }, 2000);

      } catch (error) {
        console.error("Erreur lors de la jointure d'équipe:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la jointure de l'équipe",
          variant: "destructive",
        });
      } finally {
        setIsJoiningTeam(false);
      }
    };

    // Écouter les changements d'état d'auth pour détecter quand l'utilisateur est connecté
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        joinTeamAfterVerification();
      }
    });

    // Essayer immédiatement aussi au cas où l'utilisateur serait déjà connecté
    joinTeamAfterVerification();

    return () => subscription.unsubscribe();
  }, [teamCode, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icône de succès */}
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          {/* Titre et message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Email vérifié !
            </h1>
            <p className="text-muted-foreground">
              {email ? (
                <>Votre adresse <strong>{email}</strong> a été confirmée avec succès.</>
              ) : (
                "Votre adresse email a été confirmée avec succès."
              )}
            </p>
          </div>

          {/* Message d'invitation ou statut */}
          {isJoiningTeam && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Jonction à votre équipe en cours...
                </p>
              </div>
            </div>
          )}
          
          {teamJoined && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✅ Équipe rejointe avec succès ! Redirection automatique...
              </p>
            </div>
          )}

          {token && !isJoiningTeam && !teamJoined && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">
                🎮 Cliquez ci-dessous pour rejoindre votre équipe !
              </p>
            </div>
          )}

          {/* Bouton de continuation */}
          <div className="space-y-4">
            <Button 
              onClick={handleContinue}
              className="w-full"
              size="lg"
              disabled={isJoiningTeam}
            >
              {isJoiningTeam ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Jonction en cours...
                </>
              ) : teamJoined ? (
                <>
                  Accéder au dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : token ? (
                <>
                  Rejoindre l'équipe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Retourner à l'accueil
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Vous pouvez fermer cette page en toute sécurité.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerified;