import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, MessageCircle } from "lucide-react";

export const BetaSection = () => {
  return (
    <section className="py-12 px-6 bg-primary/5 border-y border-primary/20">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-primary mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Version Bêta
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Core Link est actuellement en phase de développement bêta. 
              Pour accéder à la plateforme et tester les fonctionnalités, 
              merci de faire une demande sur notre serveur Discord.
            </p>
            
            <Button 
              size="lg" 
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold"
              onClick={() => window.open("https://discord.gg/HyPCmVABa7", "_blank")}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Rejoindre le Discord
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              Notre équipe vous donnera accès après validation de votre demande
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};