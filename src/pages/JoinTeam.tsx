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
  const [formData, setFormData] = useState({
    pseudo: "",
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation || !team) return;
    
    const { pseudo, email, password } = formData;
    
    if (!pseudo || !email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🔐 Création du compte utilisateur...");
      
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { pseudo }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Utilisateur non créé");

      // Ajouter à l'équipe
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: authData.user.id,
          role: invitation.role
        });

      if (memberError) throw memberError;

      // Marquer l'invitation comme utilisée
      await supabase
        .from("invitations")
        .update({
          used_at: new Date().toISOString(),
          used_by: authData.user.id
        })
        .eq("id", invitation.id);

      toast({
        title: "Bienvenue !",
        description: `Vous avez rejoint ${team.nom} en tant que ${invitation.role}`,
      });

      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (error: any) {
      console.error("❌ Erreur lors de l'inscription:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // État de chargement
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

  // Erreur si pas d'invitation/équipe
  if (!invitation || !team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Invitation invalide ou expirée</p>
          <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Shadow Hub</span>
          </div>
          <p className="text-muted-foreground">Rejoindre une équipe</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Créer votre compte {invitation.role}
            </CardTitle>
            <CardDescription className="text-center">
              Invitation pour <strong>{team.nom}</strong> en tant que{" "}
              <Badge variant="secondary" className="capitalize">
                {invitation.role}
              </Badge>
            </CardDescription>
            <div className="text-center text-sm text-muted-foreground">
              Jeu: <span className="capitalize">{team.jeu.replace('_', ' ')}</span>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pseudo">Pseudo *</Label>
                <Input
                  id="pseudo"
                  type="text"
                  placeholder="Votre pseudo de jeu"
                  value={formData.pseudo}
                  onChange={(e) => updateFormData('pseudo', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  `Rejoindre ${team.nom}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinTeam;