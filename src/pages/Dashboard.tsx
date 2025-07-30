import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TeamSetupModal } from "@/components/dashboard/TeamSetupModal";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { StrategiesView } from "@/components/dashboard/StrategiesView";
import { PlayersView } from "@/components/dashboard/PlayersView";
import { CoachingView } from "@/components/dashboard/CoachingView";
import { useToast } from "@/hooks/use-toast";

type DashboardView = "calendar" | "strategies" | "players" | "coaching";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>("calendar");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
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
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", userId);

      if (error) throw error;

      setTeams(data || []);
      
      if (!data || data.length === 0) {
        setShowTeamSetup(true);
      } else {
        setSelectedTeam(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos équipes",
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

  const renderCurrentView = () => {
    if (!selectedTeam) return null;

    switch (currentView) {
      case "calendar":
        return <CalendarView teamId={selectedTeam} />;
      case "strategies":
        return <StrategiesView teamId={selectedTeam} />;
      case "players":
        return <PlayersView teamId={selectedTeam} />;
      case "coaching":
        return <CoachingView teamId={selectedTeam} />;
      default:
        return <CalendarView teamId={selectedTeam} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        teams={teams}
        selectedTeam={selectedTeam}
        onTeamSelect={setSelectedTeam}
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view as DashboardView)}
      />
      
      <div className="pl-64">
        <DashboardHeader user={user} onLogout={handleLogout} />
        
        <main className="p-6">
          {renderCurrentView()}
        </main>
      </div>

      {showTeamSetup && (
        <TeamSetupModal
          isOpen={showTeamSetup}
          onClose={() => setShowTeamSetup(false)}
          onTeamCreated={(team) => {
            setTeams([team]);
            setSelectedTeam(team.id);
            setShowTeamSetup(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;