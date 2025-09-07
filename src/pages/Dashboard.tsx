import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TeamSetupModal } from "@/components/dashboard/TeamSetupModal";
import { RealTimeDashboard } from "@/components/dashboard/RealTimeDashboard";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { PlayersView } from "@/components/dashboard/PlayersView";
import { CoachingView } from "@/components/dashboard/CoachingView";
import { MatchAnalysisView } from "@/components/dashboard/MatchAnalysisView";
import { VODAnalysisTools } from "@/components/dashboard/VODAnalysisTools";
import { TeamSettingsView } from "@/components/dashboard/TeamSettingsView";
import { RecruitmentView } from "@/components/dashboard/RecruitmentView";
import { StaffFeedbackView } from "@/components/dashboard/StaffFeedbackView";
import { StaffAvailabilitiesView } from "@/components/dashboard/StaffAvailabilitiesView";

type DashboardView = "dashboard" | "calendar" | "players" | "coaching" | "match-analysis" | "coaching-analysis" | "settings" | "recruitment" | "feedbacks" | "availabilities";

import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>(() => {
    const saved = localStorage.getItem('dashboard-current-view');
    return (saved as DashboardView) || "dashboard";
  });
  const [selectedTeam, setSelectedTeam] = useState<string | null>(() => {
    return localStorage.getItem('dashboard-selected-team') || null;
  });
  const [teams, setTeams] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        checkUserTeams(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        } else if (event === 'SIGNED_IN') {
          setTimeout(() => {
            checkUserTeams(session.user.id);
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserTeams = async (userId: string) => {
    console.log("🔍 Checking user teams for:", userId);
    try {
      // D'abord vérifier le profil utilisateur pour déterminer son rôle
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

      console.log("👤 User profile:", profileData);

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const isStaff = profileData?.role === 'staff';
      console.log("🏷️ Is staff:", isStaff);

      // Récupérer toutes les équipes créées par l'utilisateur OU où il est membre avec rôle de management
      const [teamsCreated, teamsMember] = await Promise.all([
        // Équipes créées par l'utilisateur
        supabase
          .from("teams")
          .select("*")
          .eq("created_by", userId),
        
        // Équipes où l'utilisateur est membre avec rôle de management
        supabase
          .from("team_members")
          .select(`
            team_id,
            role,
            teams:team_id (*)
          `)
          .eq("user_id", userId)
          .in("role", ["owner", "manager", "coach"])
      ]);

      console.log("📊 Teams queries result:", { teamsCreated, teamsMember });

      if (teamsCreated.error) throw teamsCreated.error;
      if (teamsMember.error) throw teamsMember.error;

      // Combiner les équipes (éviter les doublons)
      const allTeams = [...(teamsCreated.data || [])];
      const memberTeams = (teamsMember.data || [])
        .map(tm => tm.teams)
        .filter(team => team && !allTeams.find(t => t.id === team.id));
      
      allTeams.push(...memberTeams);

      setTeams(allTeams);
      console.log("✅ All teams loaded:", allTeams.length);
      
      if (!allTeams || allTeams.length === 0) {
        // Si c'est un staff, ouvrir directement la modal de création d'équipe
        if (isStaff) {
          console.log("👔 Staff detected without team, opening team creation modal");
          setShowTeamSetup(true);
          return;
        }

        console.log("🚨 No management teams found. Checking if user is a player to redirect to /player...");
        const { data: anyMembership, error: membershipError } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", userId)
          .limit(1);

        if (membershipError) {
          console.error("❌ Error checking membership:", membershipError);
          setShowTeamSetup(true);
        } else if (anyMembership && anyMembership.length > 0) {
          console.log("🎮 Player membership detected. Redirecting to /player");
          navigate("/player");
          return;
        } else {
          console.log("🚨 No teams found at all, opening team setup modal");
          setShowTeamSetup(true);
        }
      } else {
        const savedTeam = localStorage.getItem('dashboard-selected-team');
        const teamToSelect = savedTeam && allTeams.find(t => t.id === savedTeam) 
          ? savedTeam 
          : allTeams[0].id;
        console.log("🏆 Teams found, selecting:", teamToSelect);
        setSelectedTeam(teamToSelect);
      }
    } catch (error: any) {
      console.error("💥 Full error in checkUserTeams:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos équipes",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");
      
      // Nettoyer le localStorage
      localStorage.removeItem('dashboard-selected-team');
      localStorage.removeItem('dashboard-current-view');
      localStorage.removeItem('player-dashboard-current-view');
      localStorage.removeItem('organization_logo');
      localStorage.removeItem('organization_name');
      
      // Reset states
      setUser(null);
      setSession(null);
      setTeams([]);
      setSelectedTeam(null);
      
      // Déconnexion Supabase avec scope 'local' pour éviter la reconnexion automatique
      await supabase.auth.signOut({ scope: 'local' });
      
      console.log("✅ Logout completed");
      navigate("/");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force la navigation même en cas d'erreur
      navigate("/");
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

  const renderCurrentView = () => {
    if (!selectedTeam) return null;
    
    const team = teams.find(t => t.id === selectedTeam);
    const gameType = team?.jeu;

    switch (currentView) {
      case "dashboard":
        return <RealTimeDashboard teamId={selectedTeam} gameType={gameType} teamData={team} isStaff={true} onViewChange={(view) => setCurrentView(view as DashboardView)} currentUserId={user?.id} />;
      case "calendar":
        return <CalendarView teamId={selectedTeam} gameType={gameType} />;
      case "players":
        return <PlayersView teamId={selectedTeam} />;
      case "coaching":
        return <CoachingView teamId={selectedTeam} gameType={gameType} currentUserId={user?.id} />;
      case "match-analysis":
        return <VODAnalysisTools teamId={selectedTeam} />;
      case "coaching-analysis":
        return <MatchAnalysisView teamId={selectedTeam} gameType={gameType} />;
      case "settings":
        return <TeamSettingsView teamId={selectedTeam} gameType={gameType} teams={teams} onTeamUpdated={() => checkUserTeams(user?.id || "")} />;
      case "recruitment":
        return <RecruitmentView teamId={selectedTeam} gameType={gameType} />;
      case "feedbacks":
        return <StaffFeedbackView teamId={selectedTeam} />;
      case "availabilities":
        return <StaffAvailabilitiesView teamId={selectedTeam} />;
      default:
        return <RealTimeDashboard teamId={selectedTeam} gameType={gameType} teamData={team} isStaff={true} onViewChange={(view) => setCurrentView(view as DashboardView)} currentUserId={user?.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DashboardSidebar
          teams={teams}
          selectedTeam={selectedTeam}
          onTeamSelect={(teamId) => {
            setSelectedTeam(teamId);
            localStorage.setItem('dashboard-selected-team', teamId);
          }}
          currentView={currentView}
          onViewChange={(view) => {
            const dashboardView = view as DashboardView;
            setCurrentView(dashboardView);
            localStorage.setItem('dashboard-current-view', dashboardView);
          }}
          onNewTeam={() => setShowTeamSetup(true)}
          currentUserId={user?.id}
        />
        
        <div className="flex-1 ml-72">
          <DashboardHeader 
            user={user} 
            onLogout={handleLogout} 
            currentTeam={teams.find(team => team.id === selectedTeam)}
          />
          
          <main className="p-8">
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {showTeamSetup && (
        <TeamSetupModal
          isOpen={showTeamSetup}
          onClose={() => setShowTeamSetup(false)}
          onTeamCreated={(team) => {
            setTeams(prev => [...prev, team]);
            setSelectedTeam(team.id);
            setShowTeamSetup(false);
            toast({
              title: "Équipe créée !",
              description: `Bienvenue dans votre équipe ${team.nom}`,
            });
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;