import { useState, useEffect } from "react";
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

  // Gestion de l'authentification
  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth state change:", event, session?.user?.email_confirmed_at);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Gestion des invitations - logique principale
  useEffect(() => {
    if (token && user) {
      // Utilisateur connecté avec token d'invitation → traiter l'invitation
      console.log("🔗 User with invitation token detected, processing invitation");
      handleInvitationJoin(token, user);
    } else if (token && !user) {
      // Token d'invitation mais pas d'utilisateur → ouvrir modal d'inscription
      console.log("🔗 Invitation token detected, opening player signup modal");
      setIsPlayerInviteOpen(true);
    } else if (!token && user) {
      // Pas de token, utilisateur connecté → vérifier ses équipes
      console.log("👤 No invitation token, checking user teams");
      checkUserTeamsAndRedirect(user);
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
      // En cas d'erreur, rediriger selon le rôle par défaut
      navigate("/player");
    }
  };

  const handleSignupSuccess = () => {
    console.log("🎉 Signup success");
    setIsSignupOpen(false);
    
    // Si il ya un token d'invitation, l'invitation sera traitée automatiquement 
    // par l'useEffect principal quand user sera disponible
    if (token) {
      console.log("🔗 Invitation token present, will be processed automatically");
    }
  };

  const checkUserTeamsAndRedirect = async (currentUser: User) => {
    // Ne jamais traiter la redirection s'il y a un token d'invitation
    if (token) {
      console.log("🔗 Skipping team check due to invitation token");
      return;
    }
    
    console.log("🔍 Checking user teams for:", currentUser.id);
    
    try {
      // Vérifier le profil de l'utilisateur
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", currentUser.id)
        .single();

      // Vérifier si l'utilisateur a créé des équipes (propriétaire/staff)
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
        // Staff ou propriétaire d'équipe → Dashboard de gestion
        console.log("🚀 Redirecting to management dashboard");
        navigate("/dashboard");
      } else if (teamMembers && teamMembers.length > 0) {
        // Membre d'équipe → vérifier le rôle
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
        // Nouvel utilisateur sans équipe → modal de création d'équipe
        console.log("🆕 New user without team, opening team setup modal");
        setIsTeamSetupOpen(true);
      }
    } catch (error) {
      console.error("💥 Error checking user teams:", error);
      // En cas d'erreur, ouvrir la modal de création d'équipe
      setIsTeamSetupOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    console.log("🎉 Login success");
    setIsLoginOpen(false);
    // La logique de redirection se fera automatiquement via l'useEffect principal
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
        {/* <TestimonialsSection /> */}
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
