import { useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleContinue = () => {
    if (token) {
      window.location.href = `/join-team/${token}`;
    } else {
      window.location.href = "/";
    }
  };

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

          {/* Message d'invitation */}
          {token && (
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
            >
              {token ? "Rejoindre l'équipe" : "Retourner à l'accueil"}
              <ArrowRight className="w-4 h-4 ml-2" />
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