import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerCalendarView } from "@/components/player/PlayerCalendarView";
import { PlayerProfileView } from "@/components/player/PlayerProfileView";
import { PlayerReviewsView } from "@/components/player/PlayerReviewsView";
import { PlayerStrategiesView } from "@/components/player/PlayerStrategiesView";
import { PlayerFeedbackView } from "@/components/player/PlayerFeedbackView";

type PlayerView = "calendar" | "profile" | "reviews" | "strategies" | "feedback";

const PlayerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<PlayerView>("calendar");
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkPlayerStatus(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkPlayerStatus(session.user.id);
        } else {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkPlayerStatus = async (userId: string) => {
    try {
      // Vérifier le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;

      // Si l'utilisateur est staff, rediriger vers le dashboard principal
      if (profile.role === 'staff') {
        navigate("/dashboard");
        return;
      }

      // Récupérer les données de l'équipe du joueur
      const { data: teamMember, error: teamError } = await supabase
        .from("team_members")
        .select(`
          *,
          teams:team_id (
            id,
            nom,
            jeu,
            logo
          )
        `)
        .eq("user_id", userId)
        .single();

      if (teamError) {
        throw new Error("Vous n'êtes membre d'aucune équipe");
      }

      setPlayerProfile(profile);
      setTeamData(teamMember);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const renderCurrentView = () => {
    if (!teamData) return null;

    const teamId = teamData.teams.id;
    const gameType = teamData.teams.jeu;

    switch (currentView) {
      case "calendar":
        return <PlayerCalendarView teamId={teamId} playerId={user?.id || ""} />;
      case "profile":
        return <PlayerProfileView playerId={user?.id || ""} teamId={teamId} />;
      case "reviews":
        return <PlayerReviewsView teamId={teamId} playerId={user?.id || ""} />;
      case "strategies":
        return <PlayerStrategiesView teamId={teamId} gameType={gameType} />;
      case "feedback":
        return <PlayerFeedbackView teamId={teamId} playerId={user?.id || ""} />;
      default:
        return <PlayerCalendarView teamId={teamId} playerId={user?.id || ""} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Accès non autorisé</h2>
          <p className="text-muted-foreground mb-4">
            Vous devez être membre d'une équipe pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <PlayerSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        teamName={teamData.teams.nom}
        gameName={teamData.teams.jeu}
        playerRole={teamData.role}
      />

      <div className="flex-1 flex flex-col">
        <PlayerHeader
          playerName={playerProfile?.pseudo || "Joueur"}
          teamName={teamData?.teams?.nom || "Équipe"}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default PlayerDashboard;