import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BetaSection } from "@/components/BetaSection";
import { FeaturesDetails } from "@/components/FeaturesDetails";
import { FeaturesShowcase } from "@/components/FeaturesShowcase";
import { GamesList } from "@/components/GamesList";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";
import { AuthModals } from "@/components/auth/AuthModals";
import { TeamSetupModal } from "@/components/auth/TeamSetupModal";
import { PlayerInviteModal } from "@/components/auth/PlayerInviteModal";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTeamSetupOpen, setIsTeamSetupOpen] = useState(false);
  const [isPlayerInviteOpen, setIsPlayerInviteOpen] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  // Gestion de l'authentification uniquement
  useEffect(() => {
    console.log("🔄 Setting up auth listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth state change:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Traitement après connexion réussie
        if (session?.user && event === 'SIGNED_IN') {
          handleUserAuthenticated(session.user);
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("📊 Initial session check:", !!session?.user);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si utilisateur déjà connecté, traiter immédiatement
      if (session?.user) {
        handleUserAuthenticated(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Gestion des invitations pour utilisateurs non connectés
  useEffect(() => {
    if (token && !user) {
      console.log("🔗 Invitation token without user, opening player signup modal");
      setIsPlayerInviteOpen(true);
    }
  }, [token, user]);

  const handleUserAuthenticated = async (currentUser: User) => {
    console.log("👤 User authenticated, processing...");
    
    // Si token d'invitation, traiter l'invitation
    if (token) {
      console.log("🔗 Processing invitation for authenticated user");
      await handleInvitationJoin(token, currentUser);
      return;
    }
    
    // Sinon, vérifier les équipes de l'utilisateur
    await checkUserTeamsAndRedirect(currentUser);
  };

  const handlePlayerAdded = () => {
    console.log("🎉 Player added via invitation");
    setIsPlayerInviteOpen(false);
    navigate("/player");
  };

  const handleInvitationJoin = async (inviteToken: string, currentUser: User) => {
    try {
      console.log("🔗 Processing invitation for user:", currentUser.id);
      
      // Utiliser la nouvelle fonction sécurisée d'acceptation d'invitation
      const { data: teamId, error } = await supabase.rpc('accept_invitation', {
        p_token: inviteToken
      });

      if (error) {
        console.error("❌ Error accepting invitation:", error);
        throw error;
      }

      console.log("✅ Invitation processed successfully, redirecting to player dashboard");
      navigate("/player");
      
    } catch (error: any) {
      console.error("💥 Error processing invitation:", error);
      navigate("/player");
    }
  };

  const handleSignupSuccess = () => {
    console.log("🎉 Signup success");
    setIsSignupOpen(false);
  };

  const checkUserTeamsAndRedirect = async (currentUser: User) => {
    console.log("🔍 Checking user teams for:", currentUser.id);
    
    try {
      // Vérifier le profil de l'utilisateur
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", currentUser.id)
        .single();

      // Vérifier si l'utilisateur a créé des équipes
      const { data: createdTeams } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", currentUser.id);

      // Vérifier si l'utilisateur est membre d'une équipe
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("role, team_id")
        .eq("user_id", currentUser.id);

      console.log("📊 User status:", { 
        profile: profileData?.role, 
        createdTeams: createdTeams?.length, 
        teamMembers: teamMembers?.length 
      });

      // Redirection selon le rôle et le statut
      if (profileData?.role === "staff" || (createdTeams && createdTeams.length > 0)) {
        console.log("🚀 Redirecting to management dashboard");
        navigate("/dashboard");
      } else if (teamMembers && teamMembers.length > 0) {
        const hasManagementRole = teamMembers.some(tm => 
          ['owner', 'manager', 'coach'].includes(tm.role)
        );
        if (hasManagementRole) {
          console.log("👑 Redirecting to management dashboard");
          navigate("/dashboard");
        } else {
          console.log("🎮 Redirecting to player dashboard");
          navigate("/player");
        }
      } else {
        console.log("🆕 New user without team, opening team setup modal");
        setIsTeamSetupOpen(true);
      }
    } catch (error) {
      console.error("💥 Error checking user teams:", error);
      setIsTeamSetupOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    console.log("🎉 Login success");
    setIsLoginOpen(false);
  };

  const handleTeamCreated = () => {
    console.log("🎉 Team created, redirecting to dashboard");
    setIsTeamSetupOpen(false);
    navigate("/dashboard");
  };

  const closeAllModals = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(false);
    setIsTeamSetupOpen(false);
    setIsPlayerInviteOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onOpenSignup={() => setIsSignupOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
      <main>
        <HeroSection 
          onOpenSignup={() => setIsSignupOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
        />
        <BetaSection />
        <FeaturesShowcase />
        <FeaturesDetails />
        <GamesList />
      </main>
      <Footer />

      {/* Modals d'authentification */}
      <AuthModals
        isSignupOpen={isSignupOpen}
        isLoginOpen={isLoginOpen}
        onClose={closeAllModals}
        onSignupSuccess={handleSignupSuccess}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal de configuration d'équipe */}
      {user && (
        <TeamSetupModal
          isOpen={isTeamSetupOpen}
          user={user}
          onClose={() => setIsTeamSetupOpen(false)}
          onTeamCreated={handleTeamCreated}
        />
      )}

      {/* Modal d'inscription joueur via invitation */}
      <PlayerInviteModal
        isOpen={isPlayerInviteOpen}
        onClose={() => setIsPlayerInviteOpen(false)}
        onPlayerAdded={handlePlayerAdded}
      />
    </div>
  );
};

export default Index;
