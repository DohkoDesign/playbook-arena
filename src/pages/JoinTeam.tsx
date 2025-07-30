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

const GAME_CHARACTERS = {
  valorant: [
    "Jett", "Phoenix", "Sage", "Sova", "Brimstone", "Viper", "Cypher", "Reyna",
    "Killjoy", "Breach", "Omen", "Raze", "Skye", "Yoru", "Astra", "KAY/O",
    "Chamber", "Neon", "Fade", "Harbor", "Gekko", "Deadlock", "Iso", "Clove"
  ],
  league_of_legends: [
    "Ahri", "Akali", "Ashe", "Azir", "Caitlyn", "Darius", "Diana", "Draven",
    "Ezreal", "Garen", "Jinx", "Katarina", "LeBlanc", "Lee Sin", "Lux", "Yasuo",
    "Zed", "Thresh", "Vayne", "Vi"
  ],
  overwatch: [
    "Tracer", "Soldier: 76", "McCree", "Pharah", "Reaper", "Sombra", "Bastion",
    "Hanzo", "Junkrat", "Mei", "Torbjörn", "Widowmaker", "D.Va", "Orisa",
    "Reinhardt", "Roadhog", "Winston", "Wrecking Ball", "Zarya", "Ana",
    "Baptiste", "Brigitte", "Lúcio", "Mercy", "Moira", "Zenyatta"
  ]
};

const JoinTeam = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    console.log("useEffect called, token:", token);
    if (token) {
      checkInvitation();
    } else {
      console.log("No token found in URL");
      setLoading(false);
    }
  }, [token]);

  const checkInvitation = async () => {
    try {
      console.log("Token from URL:", token);
      
      // Récupérer l'invitation
      const { data: invitationData, error: invitationError } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      console.log("Invitation query result:", { invitationData, invitationError });

      if (invitationError) throw invitationError;

      if (!invitationData) {
        toast({
          title: "Lien invalide",
          description: "Ce lien d'invitation est expiré ou invalide",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Récupérer l'équipe
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", invitationData.team_id)
        .single();

      if (teamError) throw teamError;

      setInvitation(invitationData);
      setTeam(teamData);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier l'invitation",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !team) return;

    setSubmitting(true);

    try {
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/setup`,
          data: {
            pseudo: pseudo,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Ajouter le joueur à l'équipe
        const { error: memberError } = await supabase
          .from("team_members")
          .insert({
            team_id: team.id,
            user_id: authData.user.id,
            role: invitation.role,
            personnages_favoris: selectedCharacters,
          });

        if (memberError) throw memberError;

        // Marquer l'invitation comme utilisée
        await supabase
          .from("invitations")
          .update({
            used_at: new Date().toISOString(),
            used_by: authData.user.id,
          })
          .eq("id", invitation.id);

        // Créer une fiche joueur si c'est un joueur
        if (invitation.role === "joueur" || invitation.role === "remplacant") {
          await supabase
            .from("player_profiles")
            .insert({
              team_id: team.id,
              user_id: authData.user.id,
              points_forts: [],
              points_faibles: [],
              objectifs_individuels: [],
            });
        }

        toast({
          title: "Bienvenue dans l'équipe !",
          description: `Vous avez rejoint ${team.nom} en tant que ${invitation.role}`,
        });

        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCharacter = (character: string) => {
    setSelectedCharacters(prev => 
      prev.includes(character) 
        ? prev.filter(c => c !== character)
        : [...prev, character]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg mx-auto"></div>
          <p>Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation || !team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p>Invitation introuvable ou expirée</p>
          <Button onClick={() => navigate("/")}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const gameCharacters = GAME_CHARACTERS[team.jeu as keyof typeof GAME_CHARACTERS] || [];

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
          <p className="text-muted-foreground">
            Invitation à rejoindre une équipe
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rejoindre l'équipe</CardTitle>
            <CardDescription>
              Vous êtes invité(e) à rejoindre <strong>{team.nom}</strong> en tant que{" "}
              <Badge variant="secondary">{invitation.role}</Badge>
            </CardDescription>
            <div className="text-sm text-muted-foreground">
              Jeu: <span className="capitalize">{team.jeu.replace('_', ' ')}</span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pseudo">Pseudo</Label>
                <Input
                  id="pseudo"
                  type="text"
                  placeholder="Votre pseudo de jeu"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {gameCharacters.length > 0 && (
                <div className="space-y-2">
                  <Label>Personnages favoris (optionnel)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {gameCharacters.map((character) => (
                      <Button
                        key={character}
                        type="button"
                        variant={selectedCharacters.includes(character) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCharacter(character)}
                      >
                        {character}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Création..." : "Rejoindre l'équipe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinTeam;