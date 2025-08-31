import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesList } from "@/components/FeaturesList";
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
    // Attendre que l'utilisateur soit connecté, puis ouvrir la configuration d'équipe
    if (user) {
      setIsTeamSetupOpen(true);
    }
  };

  const checkUserTeamsAndRedirect = async (currentUser: User) => {
    let profile = null;
    
    try {
      // Vérifier le profil de l'utilisateur
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", currentUser.id)
        .single();
      
      profile = profileData;

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

      console.log("📊 Redirection info:", { 
        profile: profile?.role, 
        createdTeams: createdTeams?.length, 
        teamMembers: teamMembers?.length 
      });

      // Redirection selon le rôle et le statut
      if (profile?.role === "staff" || (createdTeams && createdTeams.length > 0)) {
        // Utilisateur staff ou propriétaire d'équipe -> Dashboard de gestion
        navigate("/dashboard");
      } else if (profile?.role === "player" && teamMembers && teamMembers.length > 0) {
        // Joueur membre d'une équipe -> Interface joueur
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
        // Nouvel utilisateur sans équipe
        if (profile?.role === "staff") {
          // Staff sans équipe -> ouvrir la modal de création d'équipe
          setIsTeamSetupOpen(true);
        } else {
          // Joueur sans équipe -> rester sur la page d'accueil pour rejoindre une équipe
          console.log("Joueur sans équipe, reste sur la page d'accueil pour rejoindre une équipe");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du profil:", error);
      // En cas d'erreur, ouvrir la modal de création d'équipe pour les staff seulement
      if (profile?.role === "staff") {
        setIsTeamSetupOpen(true);
      } else {
        // Pour les joueurs, on les laisse sur la page d'accueil
        console.log("Utilisateur joueur non configuré, reste sur la page d'accueil pour rejoindre une équipe");
      }
    }
  };

  const handleLoginSuccess = async () => {
    setIsLoginOpen(false);
    // La redirection sera gérée par checkUserTeamsAndRedirect dans onAuthStateChange
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
        <HeroSection />
        <FeaturesShowcase />
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
