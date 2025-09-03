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
  const [hasCheckedTeams, setHasCheckedTeams] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
  const invitationProcessed = useRef(false);

  // Gestion de l'authentification
  useEffect(() => {
    console.log("🔄 Setting up auth listener");
    
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth state change:", event, session?.user?.email_confirmed_at);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Reset le flag de vérification des équipes quand l'utilisateur change
        if (!session?.user) {
          setHasCheckedTeams(false);
          invitationProcessed.current = false;
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("📊 Initial session check:", !!session?.user);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Gestion des invitations et redirection - logique principale
  useEffect(() => {
    console.log("🎯 Main logic triggered:", { token: !!token, user: !!user, hasCheckedTeams, invitationProcessed: invitationProcessed.current });
    
    // Ne rien faire si pas d'utilisateur connecté
    if (!user) {
      console.log("❌ No user, skipping all logic");
      return;
    }
    
    if (token && !invitationProcessed.current) {
      // Utilisateur connecté avec token d'invitation → traiter l'invitation
      console.log("🔗 Processing invitation for authenticated user");
      invitationProcessed.current = true;
      handleInvitationJoin(token, user);
    } else if (!token && !hasCheckedTeams) {
      // Pas de token, utilisateur connecté → vérifier ses équipes une seule fois
      console.log("👤 Checking user teams (first time)");
      setHasCheckedTeams(true);
      checkUserTeamsAndRedirect(user);
    }
  }, [token, user, hasCheckedTeams]);

  // Gestion spéciale pour les invitations sans utilisateur connecté
  useEffect(() => {
    if (token && !user) {
      console.log("🔗 Invitation token without user, opening player signup modal");
      setIsPlayerInviteOpen(true);
    }
  }, [token, user]);

  const handleInvitationJoin = async (inviteToken: string, currentUser: User) => {
    try {
      console.log("🔗 Processing invitation for user:", currentUser.id);
      
      // Vérifier l'invitation
      const { data: invitation, error: inviteError } = await supabase
        .from("invitations")
        .select("team_id, role, expires_at")
        .eq("token", inviteToken)
        .is("used_at", null)
        .single();

      if (inviteError || !invitation) {
        console.error("❌ Invalid invitation:", inviteError);
        throw new Error("Invitation invalide ou expirée");
      }

      // Vérifier si l'invitation n'est pas expirée
      if (new Date(invitation.expires_at) < new Date()) {
        console.error("❌ Invitation expired");
        throw new Error("Cette invitation a expiré");
      }

      // Vérifier si l'utilisateur n'est pas déjà membre de l'équipe
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", invitation.team_id)
        .eq("user_id", currentUser.id)
        .single();

      if (existingMember) {
        console.log("✅ User already team member, redirecting to player dashboard");
        navigate("/player");
        return;
      }

      // Ajouter le membre à l'équipe
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: invitation.team_id,
          user_id: currentUser.id,
          role: invitation.role,
        });

      if (memberError) {
        console.error("❌ Error adding team member:", memberError);
        throw memberError;
      }

      // Marquer l'invitation comme utilisée
      await supabase
        .from("invitations")
        .update({
          used_at: new Date().toISOString(),
          used_by: currentUser.id,
        })
        .eq("token", inviteToken);

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
    // Reset le flag pour permettre la vérification des équipes après inscription
    setHasCheckedTeams(false);
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
    // Reset le flag pour permettre la vérification des équipes après connexion
    setHasCheckedTeams(false);
  };

  const handleTeamCreated = () => {
    console.log("🎉 Team created, redirecting to dashboard");
    setIsTeamSetupOpen(false);
    navigate("/dashboard");
  };

  const handlePlayerAdded = () => {
    console.log("🎉 Player added via invitation");
    setIsPlayerInviteOpen(false);
    navigate("/player");
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
