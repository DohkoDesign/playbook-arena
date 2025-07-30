import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader2 } from "lucide-react";

const JoinTeam = () => {
  console.log("🚀 JoinTeam component is loading...");
  
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log("🔍 Token from params:", token);

  // États
  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);

  // Vérification de l'invitation au chargement
  useEffect(() => {
    if (!token) {
      toast({
        title: "Erreur",
        description: "Lien d'invitation invalide",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    verifyInvitation(token);
  }, [token]);

  const verifyInvitation = async (invitationToken: string) => {
    try {
      console.log("🔍 Vérification invitation pour token:", invitationToken);
      
      const { data: invitationData, error } = await supabase
        .from("invitations")
        .select(`
          *,
          teams (
            id,
            nom,
            jeu
          )
        `)
        .eq("token", invitationToken)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      console.log("📋 Résultat:", { invitationData, error });

      if (error) throw error;

      if (!invitationData) {
        toast({
          title: "Invitation invalide",
          description: "Cette invitation est expirée ou n'existe pas",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setInvitation(invitationData);
      setTeam(invitationData.teams);
      setIsLoading(false);

    } catch (error: any) {
      console.error("❌ Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier l'invitation",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  // Test simple - on affiche juste une page basique
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Vérification de l'invitation...</p>
          <p>Token: {token}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">JoinTeam fonctionne !</h1>
        <p>Token: {token}</p>
        <p>URL: {window.location.href}</p>
      </div>
    </div>
  );
};

export default JoinTeam;