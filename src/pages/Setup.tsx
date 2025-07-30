import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Users } from "lucide-react";

const GAMES = [
  { value: "valorant", label: "Valorant", players: 5 },
  { value: "rocket_league", label: "Rocket League", players: 3 },
  { value: "league_of_legends", label: "League of Legends", players: 5 },
  { value: "counter_strike", label: "Counter-Strike", players: 5 },
  { value: "overwatch", label: "Overwatch", players: 6 },
  { value: "apex_legends", label: "Apex Legends", players: 3 },
  { value: "fortnite", label: "Fortnite", players: 4 },
  { value: "call_of_duty", label: "Call of Duty", players: 6 },
];

const Setup = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        // Pas connecté, rediriger vers auth
        navigate("/auth");
      } else {
        // Vérifier si l'utilisateur a déjà des équipes
        checkExistingTeams(session.user.id);
      }
      setLoading(false);
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkExistingTeams = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", userId);

      if (error) throw error;

      // Si l'utilisateur a déjà des équipes, rediriger vers le dashboard
      if (data && data.length > 0) {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Erreur lors de la vérification des équipes:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName || !selectedGame) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      console.log("🚀 Creating first team:", { teamName, selectedGame });

      // Créer l'équipe
      const { data, error } = await supabase
        .from("teams")
        .insert({
          nom: teamName,
          jeu: selectedGame as any,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Team created:", data);

      // Ajouter le créateur comme membre manager
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: data.id,
          user_id: user.id,
          role: "manager",
        });

      if (memberError) throw memberError;

      console.log("✅ User added as manager");

      toast({
        title: "Équipe créée !",
        description: `Bienvenue dans votre équipe ${teamName}`,
      });

      // Rediriger vers le dashboard
      navigate("/dashboard");

    } catch (error: any) {
      console.error("❌ Error creating team:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg mx-auto"></div>
          <p>Chargement...</p>
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
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Shadow Hub</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Bienvenue {user?.user_metadata?.pseudo || user?.email} !</h1>
            <p className="text-muted-foreground">
              Créez votre première équipe esport pour commencer
            </p>
          </div>
        </div>

        {/* Setup Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6" />
            </div>
            <CardTitle>Créer votre équipe</CardTitle>
            <CardDescription>
              Configurez votre première équipe pour accéder au dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Nom de l'équipe *</Label>
              <Input
                id="teamName"
                placeholder="Ex: Shadow Hunters"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game">Jeu principal *</Label>
              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un jeu" />
                </SelectTrigger>
                <SelectContent>
                  {GAMES.map((game) => (
                    <SelectItem key={game.value} value={game.value}>
                      {game.label} ({game.players} joueurs)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreateTeam} 
              disabled={submitting || !teamName || !selectedGame}
              className="w-full"
            >
              {submitting ? (
                "Création en cours..."
              ) : (
                <>
                  Créer mon équipe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Vous pourrez créer d'autres équipes plus tard
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Preview */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Prochaines étapes :</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Inviter vos joueurs</li>
              <li>• Planifier vos scrims</li>
              <li>• Créer vos stratégies</li>
              <li>• Analyser vos performances</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Setup;