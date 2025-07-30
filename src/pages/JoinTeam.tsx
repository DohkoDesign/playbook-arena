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

// Personnages par jeu
const GAME_CHARACTERS = {
  valorant: ["Jett", "Phoenix", "Sage", "Sova", "Brimstone", "Viper", "Cypher", "Reyna"],
  league_of_legends: ["Ahri", "Akali", "Ashe", "Ezreal", "Jinx", "Yasuo", "Zed", "Thresh"],
  overwatch: ["Tracer", "Soldier: 76", "Pharah", "Reaper", "D.Va", "Reinhardt", "Mercy", "Ana"],
  apex_legends: ["Wraith", "Pathfinder", "Lifeline", "Bloodhound", "Bangalore", "Octane"],
  csgo: ["T-Side", "CT-Side", "AWP", "Rifle", "Entry Fragger", "Support"]
};

const JoinTeam = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // États
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  
  // Formulaire
  const [formData, setFormData] = useState({
    pseudo: "",
    email: "",
    password: "",
    selectedCharacters: [] as string[]
  });

  // Vérification de l'invitation au chargement
  useEffect(() => {
    console.log("🚀 JoinTeam - Token reçu:", token);
    
    if (!token) {
      console.error("❌ Aucun token dans l'URL");
      showErrorAndRedirect("Lien d'invitation invalide");
      return;
    }

    verifyInvitation(token);
  }, [token]);

  const showErrorAndRedirect = (message: string) => {
    toast({
      title: "Erreur",
      description: message,
      variant: "destructive",
    });
    setTimeout(() => navigate("/"), 2000);
  };

  const verifyInvitation = async (invitationToken: string) => {
    try {
      console.log("🔍 Vérification de l'invitation avec token:", invitationToken);
      
      // 1. Chercher l'invitation (requête publique sans authentification)
      const { data: invitationData, error: invitationError } = await supabase
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

      console.log("📋 Résultat requête invitation:", { invitationData, invitationError });

      if (invitationError) {
        console.error("❌ Erreur requête invitation:", invitationError);
        showErrorAndRedirect("Erreur lors de la vérification de l'invitation");
        return;
      }

      if (!invitationData) {
        console.error("❌ Invitation non trouvée pour token:", invitationToken);
        showErrorAndRedirect("Invitation non trouvée, expirée ou déjà utilisée");
        return;
      }

      // 2. Vérifier l'expiration (double vérification)
      const now = new Date();
      const expiresAt = new Date(invitationData.expires_at);
      
      if (now > expiresAt) {
        console.error("❌ Invitation expirée:", { now, expiresAt });
        showErrorAndRedirect("Cette invitation a expiré");
        return;
      }

      console.log("✅ Invitation valide:", invitationData);

      // Les données de l'équipe sont incluses dans la requête
      const teamData = invitationData.teams;
      if (!teamData) {
        console.error("❌ Équipe non trouvée dans l'invitation");
        showErrorAndRedirect("Équipe non trouvée");
        return;
      }

      console.log("✅ Équipe trouvée:", teamData);

      // Tout est OK
      setInvitation(invitationData);
      setTeam(teamData);
      setIsLoading(false);

    } catch (error) {
      console.error("❌ Erreur lors de la vérification:", error);
      showErrorAndRedirect("Erreur lors de la vérification de l'invitation");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation || !team) return;
    
    const { pseudo, email, password, selectedCharacters } = formData;
    
    if (!pseudo || !email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🔐 Création du compte utilisateur...");
      
      // 1. Créer le compte utilisateur
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

      console.log("✅ Compte créé:", authData.user.id);

      // 2. Ajouter à l'équipe
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: authData.user.id,
          role: invitation.role,
          personnages_favoris: selectedCharacters
        });

      if (memberError) throw memberError;

      // 3. Marquer l'invitation comme utilisée
      const { error: updateError } = await supabase
        .from("invitations")
        .update({
          used_at: new Date().toISOString(),
          used_by: authData.user.id
        })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      // 4. Créer le profil joueur si nécessaire
      if (invitation.role === "joueur" || invitation.role === "remplacant") {
        await supabase
          .from("player_profiles")
          .insert({
            team_id: team.id,
            user_id: authData.user.id,
            points_forts: [],
            points_faibles: [],
            objectifs_individuels: []
          });
      }

      console.log("✅ Inscription terminée avec succès!");

      toast({
        title: "Bienvenue !",
        description: `Vous avez rejoint ${team.nom} en tant que ${invitation.role}`,
      });

      // Redirection
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

  const toggleCharacter = (character: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCharacters: prev.selectedCharacters.includes(character)
        ? prev.selectedCharacters.filter(c => c !== character)
        : [...prev.selectedCharacters, character]
    }));
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

  const gameCharacters = GAME_CHARACTERS[team.jeu as keyof typeof GAME_CHARACTERS] || [];
  const isPlayerRole = invitation.role === "joueur" || invitation.role === "remplacant";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        {/* En-tête */}
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
              {/* Pseudo */}
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

              {/* Email */}
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

              {/* Mot de passe */}
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

              {/* Personnages (pour les joueurs) */}
              {isPlayerRole && gameCharacters.length > 0 && (
                <div className="space-y-2">
                  <Label>Personnages favoris (optionnel)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {gameCharacters.map((character) => (
                      <Button
                        key={character}
                        type="button"
                        variant={formData.selectedCharacters.includes(character) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCharacter(character)}
                      >
                        {character}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton de soumission */}
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