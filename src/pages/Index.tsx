import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BetaSection } from "@/components/BetaSection";
import { FeaturesDetails } from "@/components/FeaturesDetails";
import { FeaturesShowcase } from "@/components/FeaturesShowcase";
import { GamesList } from "@/components/GamesList";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  console.log("🏠 Index component rendering");
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log("👤 User from useAuth:", user);

  // Rediriger les utilisateurs connectés vers leur dashboard approprié
  useEffect(() => {
    console.log("📊 useEffect triggered with user:", user);
    if (user) {
      console.log("👤 User found, checking teams for redirect");
      checkUserTeamsAndRedirect(user);
    } else {
      console.log("🚫 No user found, staying on Index");
    }
  }, [user, navigate]);

  const checkUserTeamsAndRedirect = async (currentUser: any) => {
    console.log("🔍 Checking user teams for redirect");
    console.log("🔍 Current user ID:", currentUser.id);
    try {
      // Vérifier le profil de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      console.log("👤 Profile data:", profileData);
      
      if (profileError) {
        console.error("❌ Profile error:", profileError);
      }

      // Vérifier si l'utilisateur a créé des équipes
      const { data: createdTeams } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", currentUser.id);

      console.log("🏗️ Created teams:", createdTeams);

      // Vérifier si l'utilisateur est membre d'une équipe
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("role, team_id")
        .eq("user_id", currentUser.id);

      console.log("👥 Team members:", teamMembers);

      // Redirection selon le rôle et le statut
      // Priorité 1: Si l'utilisateur a créé des équipes (owner)
      if (createdTeams && createdTeams.length > 0) {
        console.log("🚀 Redirecting to management dashboard (team owner)");
        console.log("🚀 Navigation called with /dashboard");
        navigate("/dashboard");
        return; // Important: arrêter l'exécution après redirection
      } 
      // Priorité 2: Si l'utilisateur est membre d'une équipe
      else if (teamMembers && teamMembers.length > 0) {
        const hasManagementRole = teamMembers.some(tm => 
          ['owner', 'manager', 'coach'].includes(tm.role)
        );
        if (hasManagementRole) {
          console.log("👑 Redirecting to management dashboard (management role)");
          console.log("👑 Navigation called with /dashboard");
          navigate("/dashboard");
          return;
        } else {
          console.log("🎮 Redirecting to player dashboard");
          console.log("🎮 Navigation called with /player");
          navigate("/player");
          return;
        }
      } 
      // Priorité 3: Si l'utilisateur est staff mais sans équipe
      else if (profileData?.role === "staff") {
        console.log("👔 Staff detected without teams, redirecting to dashboard");
        console.log("👔 Navigation called with /dashboard");
        navigate("/dashboard");
        return;
      } 
      else {
        console.log("🆕 New user without team, staying on Index");
      }
    } catch (error) {
      console.error("💥 Error checking user teams:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BetaSection />
        <FeaturesShowcase />
        <FeaturesDetails />
        <GamesList />
      </main>
      <Footer />
    </div>
  );
};

export default Index;