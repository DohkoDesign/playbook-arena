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
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { useToast } from "@/hooks/use-toast";

type DashboardView = "calendar" | "strategies" | "players" | "coaching" | "profile" | "settings";

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
    console.log("🔍 Checking user teams for:", userId);
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", userId);

      console.log("📊 Teams query result:", { data, error });

      if (error) {
        console.error("❌ Error fetching teams:", error);
        throw error;
      }

      setTeams(data || []);
      console.log("✅ Teams loaded:", data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log("🚨 No teams found, redirecting to setup");
        navigate("/setup");
      } else {
        console.log("🏆 Teams found, selecting first:", data[0].id);
        setSelectedTeam(data[0].id);
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
    switch (currentView) {
      case "calendar":
        return selectedTeam ? <CalendarView teamId={selectedTeam} /> : null;
      case "strategies":
        return selectedTeam ? <StrategiesView teamId={selectedTeam} /> : null;
      case "players":
        return selectedTeam ? <PlayersView teamId={selectedTeam} /> : null;
      case "coaching":
        return selectedTeam ? <CoachingView teamId={selectedTeam} /> : null;
      case "profile":
        return (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Profil</h2>
              <p className="text-muted-foreground">Gérez vos informations personnelles</p>
            </div>
            <ProfileSettings user={user} onProfileUpdate={() => checkUserTeams(user?.id || "")} />
          </div>
        );
      case "settings":
        return (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
            <p className="text-muted-foreground">Section paramètres à développer</p>
          </div>
        );
      default:
        return selectedTeam ? <CalendarView teamId={selectedTeam} /> : null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DashboardSidebar
          teams={teams}
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view as DashboardView)}
        />
        
        <div className="flex-1 ml-72">
          <DashboardHeader user={user} onLogout={handleLogout} />
          
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