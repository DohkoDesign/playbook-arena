import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { StrategiesView } from "@/components/dashboard/StrategiesView";
import { PlayersView } from "@/components/dashboard/PlayersView";
import { CoachingView } from "@/components/dashboard/CoachingView";
import { PlayerProfileView } from "@/components/player/PlayerProfileView";
import { PlayerFicheView } from "@/components/player/PlayerFicheView";
import { PlayerObjectivesView } from "@/components/player/PlayerObjectivesView";
import { PlayerPlanningView } from "@/components/player/PlayerPlanningView";
import { PlayerPerformanceView } from "@/components/player/PlayerPerformanceView";
import { useToast } from "@/hooks/use-toast";

type PlayerView = "calendar" | "fiche" | "objectives" | "planning" | "performance" | "team-strategies" | "team-coaching";

const PlayerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<PlayerView>("calendar");
  const [teamData, setTeamData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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

      // 1. Charger le profil utilisateur complet
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Profile error:", profileError);
        throw new Error("Impossible de charger votre profil");
      }

      console.log("👤 Profile loaded:", profile);

      // Vérifier que c'est bien un joueur
      if (profile.role !== "player") {
        console.log("🔄 Not a player, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      setUserProfile(profile);

      // 2. Charger les données de l'équipe (requête simplifiée)
      console.log("🔍 Recherche des équipes...");
      const { data: teamMembers, error: teamError } = await supabase
        .from("team_members")
        .select("role, team_id")
        .eq("user_id", user.id);

      if (teamError) {
        console.error("❌ Team error:", teamError);
        throw new Error("Impossible de charger vos équipes");
      }

      console.log("🏆 Team members data:", JSON.stringify(teamMembers, null, 2));

      if (!teamMembers || teamMembers.length === 0) {
        throw new Error("Vous n'êtes membre d'aucune équipe");
      }

      // 3. Charger les infos de la première équipe
      const firstTeamMember = teamMembers[0];
      console.log("🎯 First team member:", JSON.stringify(firstTeamMember, null, 2));
      
      const { data: teamInfo, error: teamInfoError } = await supabase
        .from("teams")
        .select("id, nom, jeu")
        .eq("id", firstTeamMember.team_id)
        .single();

      if (teamInfoError || !teamInfo) {
        console.error("❌ Team info error:", teamInfoError);
        throw new Error("Impossible de charger les informations de l'équipe");
      }

      console.log("📋 Team info:", JSON.stringify(teamInfo, null, 2));

      setTeamData({
        id: teamInfo.id,
        nom: teamInfo.nom,
        jeu: teamInfo.jeu,
        role: firstTeamMember.role
      });

      console.log("✅ Player data loaded successfully");

    } catch (error: any) {
      console.error("❌ Error loading player data:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger vos données",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
      case "calendar":
        // Calendrier d'équipe (lecture seule)
        return <CalendarView teamId={teamData.id} gameType={teamData.jeu} isPlayerView={true} />;
      
      // Mon Espace personnel
      case "fiche":
        return <PlayerFicheView teamId={teamData.id} playerId={user?.id || ""} userProfile={userProfile} teamData={teamData} />;
      case "objectives":
        return <PlayerObjectivesView teamId={teamData.id} playerId={user?.id || ""} />;
      case "planning":
        console.log("🚀 Rendering planning view with data:", { teamId: teamData.id, playerId: user?.id });
        try {
          return <PlayerPlanningView teamId={teamData.id} playerId={user?.id || ""} />;
        } catch (error) {
          console.error("❌ Error rendering PlayerPlanningView:", error);
          return (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Planning Personnel</h2>
              <p className="text-red-500">Erreur de chargement du composant planning</p>
              <pre className="bg-gray-100 p-4 mt-4 text-sm">{error?.toString()}</pre>
            </div>
          );
        }
      case "performance":
        return <PlayerPerformanceView teamId={teamData.id} playerId={user?.id || ""} userProfile={userProfile} teamData={teamData} />;
      
      // Équipe (lecture seule)
      case "team-strategies":
        return <StrategiesView teamId={teamData.id} gameType={teamData.jeu} isPlayerView={true} />;
      case "team-coaching":
        return <CoachingView teamId={teamData.id} gameType={teamData.jeu} isPlayerView={true} />;
      
      default:
        return <CalendarView teamId={teamData.id} gameType={teamData.jeu} isPlayerView={true} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <PlayerSidebar
          teamData={teamData}
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view as PlayerView)}
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