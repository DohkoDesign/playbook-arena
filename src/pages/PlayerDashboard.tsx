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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PlayerView = "calendar" | "profile" | "reviews" | "strategies" | "feedback";

interface PlayerProfile {
  id: string;
  pseudo: string;
  role: string;
}

interface TeamData {
  id: string;
  nom: string;
  jeu: string;
  role: string;
}

const PlayerDashboard = () => {
  // États d'authentification
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // États des données
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État de l'interface
  const [currentView, setCurrentView] = useState<PlayerView>("calendar");

  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialisation de l'authentification
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🔐 Initializing authentication...");
        
        // Vérifier la session existante
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user) {
          console.log("✅ Existing session found:", currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log("❌ No session found, redirecting to auth");
          navigate("/auth");
          return;
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        if (mounted) {
          navigate("/auth");
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state change:", event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Chargement des données du joueur
  useEffect(() => {
    if (user && !authLoading) {
      loadPlayerData();
    }
  }, [user, authLoading]);

  const loadPlayerData = async () => {
    if (!user) return;

    setDataLoading(true);
    setError(null);

    try {
      console.log("📊 Loading player data for:", user.id);

      // 1. Charger le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, pseudo, role")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Profile error:", profileError);
        throw new Error("Impossible de charger votre profil");
      }

      console.log("👤 Profile loaded:", profile);

      // Vérifier que l'utilisateur est bien un player
      if (profile.role !== 'player') {
        console.log("🚫 User is not a player, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      setPlayerProfile(profile);

      // 2. Charger les données de l'équipe
      const { data: teamMembers, error: teamError } = await supabase
        .from("team_members")
        .select(`
          role,
          team_id,
          teams!inner (
            id,
            nom,
            jeu
          )
        `)
        .eq("user_id", user.id);

      if (teamError) {
        console.error("❌ Team error:", teamError);
        throw new Error("Impossible de charger vos équipes");
      }

      console.log("🏆 Raw teams data:", JSON.stringify(teamMembers, null, 2));

      if (!teamMembers || teamMembers.length === 0) {
        throw new Error("Vous n'êtes membre d'aucune équipe");
      }

      // Prendre la première équipe
      const firstTeam = teamMembers[0];
      console.log("🎯 First team structure:", JSON.stringify(firstTeam, null, 2));
      
      const teamInfo = firstTeam.teams;
      console.log("📋 Team info:", JSON.stringify(teamInfo, null, 2));

      if (!teamInfo) {
        console.error("❌ Team info is null/undefined");
        console.error("Full team member object:", firstTeam);
        throw new Error("Données d'équipe invalides - relation manquante");
      }

      setTeamData({
        id: teamInfo.id,
        nom: teamInfo.nom,
        jeu: teamInfo.jeu,
        role: firstTeam.role
      });

      console.log("✅ Player data loaded successfully");

    } catch (error: any) {
      console.error("❌ Error loading player data:", error);
      setError(error.message || "Erreur lors du chargement des données");
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger vos données",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Déconnexion",
        description: "À bientôt !",
      });
      
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
    if (!teamData || !user) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Données non disponibles</p>
        </div>
      );
    }

    const commonProps = {
      teamId: teamData.id,
      playerId: user.id
    };

    switch (currentView) {
      case "calendar":
        return <PlayerCalendarView {...commonProps} />;
      case "profile":
        return <PlayerProfileView {...commonProps} />;
      case "reviews":
        return <PlayerReviewsView {...commonProps} />;
      case "strategies":
        return <PlayerStrategiesView teamId={teamData.id} gameType={teamData.jeu} />;
      case "feedback":
        return <PlayerFeedbackView {...commonProps} />;
      default:
        return <PlayerCalendarView {...commonProps} />;
    }
  };

  // Affichage du chargement d'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  // Affichage si pas d'utilisateur (ne devrait pas arriver vu la redirection)
  if (!user || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground mb-4">Vous devez être connecté pour accéder à cette page.</p>
          <button 
            onClick={() => navigate("/auth")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Affichage du chargement des données
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription className="mb-4">
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex space-x-2 mt-4">
            <button 
              onClick={loadPlayerData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Réessayer
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si pas de données (ne devrait pas arriver vu la gestion d'erreur)
  if (!playerProfile || !teamData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Données manquantes</h2>
          <p className="text-muted-foreground mb-4">Impossible de charger vos informations.</p>
          <button 
            onClick={loadPlayerData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Affichage principal
  return (
    <div className="min-h-screen bg-background flex">
      <PlayerSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        teamName={teamData.nom}
        gameName={teamData.jeu}
        playerRole={teamData.role}
      />

      <div className="flex-1 flex flex-col">
        <PlayerHeader
          playerName={playerProfile.pseudo}
          teamName={teamData.nom}
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