import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SmartDashboard } from "@/components/dashboard/SmartDashboard";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { PlayersView } from "@/components/dashboard/PlayersView";
import { CoachingView } from "@/components/dashboard/CoachingView";
import { PlayerProfileView } from "@/components/player/PlayerProfileView";
import { PlayerFicheView } from "@/components/player/PlayerFicheView";
import { PlayerObjectivesView } from "@/components/player/PlayerObjectivesView";
import { PlayerPlanningView } from "@/components/player/PlayerPlanningView";
import { PlayerFeedbackView } from "@/components/player/PlayerFeedbackView";
import { PlayerTeamAvailabilities } from "@/components/player/PlayerTeamAvailabilities";
import { useToast } from "@/hooks/use-toast";

type PlayerView = "dashboard" | "calendar" | "fiche" | "objectives" | "planning" | "feedback" | "team-availabilities" | "team-coaching";

const PlayerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<PlayerView>(() => {
    const saved = localStorage.getItem('player-dashboard-current-view');
    return (saved as PlayerView) || "dashboard";
  });
  const [teamData, setTeamData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log("🔐 Initializing authentication...");

  useEffect(() => {
    // Établir l'écoute des changements d'authentification AVANT la vérification de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔄 Auth state change:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Vérifier la session existante APRÈS avoir établi l'écoute
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("✅ Existing session found:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadPlayerData(session.user);
        loadUserProfile(session.user.id);
      } else {
        navigate("/auth");
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadPlayerData = async (user: User) => {
    try {
      console.log("📊 Loading player data for:", user.id);

      // Requête optimisée : récupérer profil ET données d'équipe en une seule fois
      const [profileResult, teamMemberResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("team_members")
          .select(`
            role,
            team_id,
            teams:team_id (
              id,
              nom,
              logo,
              jeu
            )
          `)
          .eq("user_id", user.id)
          .limit(1)
          .single()
      ]);

      // Vérifier le profil
      if (profileResult.error) {
        console.error("❌ Profile error:", profileResult.error);
        if (profileResult.error.code === 'PGRST116') {
          throw new Error("Profil utilisateur non trouvé");
        }
        throw new Error("Impossible de charger votre profil");
      }

      const profile = profileResult.data;
      console.log("👤 Profile loaded:", profile);

      // Vérifier que c'est bien un joueur
      if (profile.role !== "player") {
        console.log("🔄 Not a player, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      setUserProfile(profile);

      // Vérifier les données d'équipe
      if (teamMemberResult.error) {
        console.error("❌ Team error:", teamMemberResult.error);
        if (teamMemberResult.error.code === 'PGRST116') {
          throw new Error("Vous n'êtes membre d'aucune équipe");
        }
        throw new Error("Impossible de charger vos équipes");
      }

      const teamMember = teamMemberResult.data;
      const teamInfo = teamMember.teams;

      if (!teamInfo) {
        throw new Error("Informations d'équipe manquantes");
      }

      console.log("🏆 Team data loaded:", teamInfo);

      setTeamData({
        id: teamInfo.id,
        nom: teamInfo.nom,
        jeu: teamInfo.jeu,
        role: teamMember.role
      });

      console.log("✅ Player data loaded successfully");

    } catch (error: any) {
      console.error("❌ Error loading player data:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger vos données",
        variant: "destructive",
      });
      
      // En cas d'erreur, rediriger vers l'authentification après un délai
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out from player dashboard...");
      
      // Nettoyer le localStorage
      localStorage.removeItem('player-dashboard-current-view');
      localStorage.removeItem('dashboard-selected-team');
      localStorage.removeItem('dashboard-current-view');
      localStorage.removeItem('organization_logo');
      localStorage.removeItem('organization_name');
      
      // Reset states
      setUser(null);
      setSession(null);
      setTeamData(null);
      setUserProfile(null);
      
      // Déconnexion Supabase avec scope 'local' pour éviter la reconnexion automatique
      await supabase.auth.signOut({ scope: 'local' });
      
      console.log("✅ Player logout completed");
      navigate("/");
    } catch (error) {
      console.error("❌ Player logout error:", error);
      // Force la navigation même en cas d'erreur
      navigate("/");
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("user_id", userId)
        .single();

      if (data?.pseudo) {
        setUserName(data.pseudo);
      }
    } catch (error) {
      console.log("Could not load user profile:", error);
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

  if (!teamData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive">Données d'équipe manquantes</p>
          <button onClick={() => navigate("/auth")} className="text-primary hover:underline">
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    if (!teamData) return null;

    switch (currentView) {
      case "dashboard":
        return <SmartDashboard teamId={teamData.id} gameType={teamData.jeu} isStaff={false} onViewChange={(view) => setCurrentView(view as PlayerView)} />;
      case "calendar":
        // Calendrier d'équipe (lecture seule)
        return <CalendarView teamId={teamData.id} gameType={teamData.jeu} isPlayerView={true} />;
      
      // Mon Espace personnel
      case "fiche":
        return <PlayerFicheView teamId={teamData.id} playerId={user?.id || ""} userProfile={userProfile} teamData={teamData} />;
      case "objectives":
        return <PlayerObjectivesView teamId={teamData.id} playerId={user?.id || ""} />;
      case "planning":
        return <PlayerPlanningView teamId={teamData.id} playerId={user?.id || ""} />;
      case "feedback":
        return <PlayerFeedbackView teamId={teamData.id} playerId={user?.id || ""} />;
      
      // Équipe (lecture seule)
      case "team-availabilities":
        return <PlayerTeamAvailabilities teamId={teamData.id} playerId={user?.id || ""} />;
      case "team-coaching":
        return <CoachingView teamId={teamData.id} gameType={teamData.jeu} isPlayerView={true} />;
      
      default:
        return <SmartDashboard teamId={teamData.id} gameType={teamData.jeu} isStaff={false} onViewChange={(view) => setCurrentView(view as PlayerView)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <PlayerSidebar
          teamData={teamData}
          currentView={currentView}
          onViewChange={(view) => {
            const playerView = view as PlayerView;
            setCurrentView(playerView);
            localStorage.setItem('player-dashboard-current-view', playerView);
          }}
        />
        
        <div className="flex-1 ml-72">
          <DashboardHeader 
            user={user} 
            onLogout={handleLogout} 
            currentTeam={teamData}
          />
          
          <main className="p-8">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;