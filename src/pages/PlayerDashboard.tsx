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
import { useToast } from "@/hooks/use-toast";

type PlayerView = "calendar" | "strategies" | "players" | "coaching" | "profile";

const PlayerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<PlayerView>("calendar");
  const [teamData, setTeamData] = useState<any>(null);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
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

      // Vérifier que c'est bien un joueur
      if (profile.role !== "player") {
        console.log("🔄 Not a player, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      setPlayerProfile(profile);

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
        // Calendrier (même composant que le staff)
        return <CalendarView teamId={teamData.id} gameType={teamData.jeu} />;
      case "strategies":
        // Stratégies (même composant que le staff)
        return <StrategiesView teamId={teamData.id} gameType={teamData.jeu} />;
      case "players":
        // Vue des membres d'équipe
        return <PlayersView teamId={teamData.id} />;
      case "coaching":
        // Sessions de coaching 
        return <CoachingView teamId={teamData.id} gameType={teamData.jeu} />;
      case "profile":
        // Profil du joueur
        return <PlayerProfileView teamId={teamData.id} playerId={user?.id || ""} />;
      default:
        return <CalendarView teamId={teamData.id} gameType={teamData.jeu} />;
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