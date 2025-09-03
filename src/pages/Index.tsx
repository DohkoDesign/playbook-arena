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
        setSession(session);
        setUser(session?.user ?? null);
        
        // Vérifier automatiquement l'état de l'équipe après connexion
        if (session?.user && event === 'SIGNED_IN') {
          // Si il y a un token d'invitation, laisser handleInvitationJoin gérer
          if (!token) {
            setTimeout(() => {
              checkUserTeamsAndRedirect(session.user);
            }, 100);
          }
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Vérifier l'état de l'équipe si l'utilisateur est déjà connecté
      if (session?.user && !token) {
        checkUserTeamsAndRedirect(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Vérifier s'il y a un token d'invitation dans l'URL
  useEffect(() => {
    if (token && !user) {
      // Ouvrir la modal d'inscription joueur si il y a un token et pas d'utilisateur connecté
      setIsPlayerInviteOpen(true);
    } else if (token && user) {
      // Utilisateur connecté avec un token - traiter l'invitation automatiquement
      handleInvitationJoin(token, user);
    }
  }, [token, user]);

  const handleInvitationJoin = async (inviteToken: string, currentUser: User) => {
    try {
      console.log("🔗 Traitement invitation automatique pour:", currentUser.id);
      
      // Vérifier l'invitation
      const { data: invitation, error: inviteError } = await supabase
        .from("invitations")
        .select("team_id, role, expires_at")
        .eq("token", inviteToken)
        .is("used_at", null)
        .single();

      if (inviteError || !invitation) {
        throw new Error("Invitation invalide ou expirée");
      }

      // Vérifier si l'invitation n'est pas expirée
      if (new Date(invitation.expires_at) < new Date()) {
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
        console.log("✅ Utilisateur déjà membre, redirection vers player");
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

      if (memberError) throw memberError;

      // Marquer l'invitation comme utilisée
      await supabase
        .from("invitations")
        .update({
          used_at: new Date().toISOString(),
          used_by: currentUser.id,
        })
        .eq("token", inviteToken);

      console.log("✅ Invitation traitée avec succès");
      
      // Rediriger vers l'interface joueur
      navigate("/player");
      
    } catch (error: any) {
      console.error("Erreur lors du traitement de l'invitation:", error);
      // En cas d'erreur, rediriger selon le rôle de l'utilisateur
      checkUserTeamsAndRedirect(currentUser);
    }
  };

  const handleSignupSuccess = () => {
    setIsSignupOpen(false);
    // Ouvrir directement la popup de création d'équipe après vérification email
    setTimeout(() => {
      setIsTeamSetupOpen(true);
    }, 500); // Petit délai pour que la transition soit fluide
  };

  const checkUserTeamsAndRedirect = async (currentUser: User) => {
    console.log("🔍 Starting checkUserTeamsAndRedirect for user:", currentUser.id);
    let profile = null;
    
    try {
      // Vérifier le profil de l'utilisateur
      console.log("📋 Fetching user profile...");
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", currentUser.id)
        .single();
      
      profile = profileData;
      console.log("👤 User profile:", profile);

      // Vérifier si l'utilisateur a créé des équipes (propriétaire/staff)
      console.log("🏢 Checking created teams...");
      const { data: createdTeams } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", currentUser.id);

      // Vérifier si l'utilisateur est membre d'une équipe
      console.log("👥 Checking team memberships...");
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("role, team_id")
        .eq("user_id", currentUser.id);

      console.log("📊 Redirection info:", { 
        profile: profile?.role, 
        createdTeams: createdTeams?.length, 
        teamMembers: teamMembers?.length,
        profileData: profile,
        createdTeamsData: createdTeams,
        teamMembersData: teamMembers
      });

      // Redirection selon le rôle et le statut
      if (profile?.role === "staff" || (createdTeams && createdTeams.length > 0)) {
        // Utilisateur staff ou propriétaire d'équipe -> Dashboard de gestion
        console.log("🚀 Redirecting to dashboard (staff/owner)");
        navigate("/dashboard");
      } else if (profile?.role === "player" && teamMembers && teamMembers.length > 0) {
        // Joueur membre d'une équipe -> Interface joueur
        console.log("🎮 Redirecting to player interface");
        navigate("/player");
      } else if (teamMembers && teamMembers.length > 0) {
        // Membre d'équipe avec rôle de gestion -> Dashboard
        const hasManagementRole = teamMembers.some(tm => 
          ['owner', 'manager', 'coach'].includes(tm.role)
        );
        if (hasManagementRole) {
          navigate("/dashboard");
        } else {
          navigate("/player");
        }
      } else {
        // Nouvel utilisateur sans équipe - vérifier s'il a un code beta valide
        console.log("🆕 User without team, checking beta code eligibility...");
        
        // Vérifier si l'utilisateur a utilisé un code beta (permet de créer une équipe)
        const { data: hasBetaCode, error: betaError } = await supabase
          .from("beta_codes")
          .select("id")
          .eq("used_by", currentUser.id)
          .not("used_at", "is", null)
          .limit(1)
          .maybeSingle();

        console.log("🔍 Beta code check result:", { 
          hasBetaCode, 
          betaError,
          profileRole: profile?.role,
          isStaff: profile?.role === "staff",
          hasValidBetaCode: !!hasBetaCode,
          shouldOpenModal: (profile?.role === "staff" || !!hasBetaCode)
        });

        if (profile?.role === "staff" || hasBetaCode) {
          // Staff ou utilisateur avec code beta validé -> ouvrir la modal de création d'équipe
          console.log("✅ Opening team setup modal (staff or beta code user)");
          setIsTeamSetupOpen(true);
        } else {
          // Joueur sans équipe et sans code beta -> rester sur la page d'accueil pour rejoindre une équipe
          console.log("❌ User without team creation rights, staying on homepage");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du profil:", error);
      
      // En cas d'erreur, vérifier s'il a un code beta pour décider d'ouvrir la modal
      try {
        const { data: hasBetaCode } = await supabase
          .from("beta_codes")
          .select("id")
          .eq("used_by", currentUser.id)
          .not("used_at", "is", null)
          .limit(1)
          .maybeSingle();

        if (profile?.role === "staff" || hasBetaCode) {
          console.log("Ouverture de la modal de création d'équipe (après erreur)");
          setIsTeamSetupOpen(true);
        } else {
          console.log("Utilisateur sans droits de création d'équipe, reste sur la page d'accueil");
        }
      } catch (betaError) {
        console.error("Erreur lors de la vérification du code beta:", betaError);
        // En dernier recours, laisser sur la page d'accueil
      }
    }
  };

  const handleLoginSuccess = async () => {
    console.log("🎉 Login success - starting team check process");
    setIsLoginOpen(false);
    
    // Attendre un peu puis forcer la vérification
    setTimeout(() => {
      if (user) {
        console.log("🔄 Forcing team check after login success");
        checkUserTeamsAndRedirect(user);
      }
    }, 1000);
  };

  const handleTeamCreated = () => {
    setIsTeamSetupOpen(false);
    navigate("/dashboard");
  };

  const handlePlayerAdded = () => {
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
