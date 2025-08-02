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
          setTimeout(() => {
            checkUserTeamsAndRedirect(session.user);
          }, 100);
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Vérifier l'état de l'équipe si l'utilisateur est déjà connecté
      if (session?.user) {
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
    }
  }, [token, user]);

  const handleSignupSuccess = () => {
    setIsSignupOpen(false);
    // Attendre que l'utilisateur soit connecté, puis ouvrir la configuration d'équipe
    if (user) {
      setIsTeamSetupOpen(true);
    }
  };

  const checkUserTeamsAndRedirect = async (currentUser: User) => {
    try {
      // Vérifier le rôle de l'utilisateur après connexion
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", currentUser.id)
        .single();

      // Vérifier si l'utilisateur est membre d'une équipe
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("role, team_id")
        .eq("user_id", currentUser.id);

      // Vérifier si l'utilisateur a créé des équipes
      const { data: createdTeams } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", currentUser.id);

      console.log("📊 Teams query result:", { data: createdTeams, error: null });

      // Redirection selon le statut de l'utilisateur
      if (createdTeams && createdTeams.length > 0) {
        navigate("/dashboard");
      } else if (profile?.role === "player" && teamMembers && teamMembers.length > 0) {
        navigate("/player");
      } else if (teamMembers && teamMembers.length > 0) {
        navigate("/dashboard");
      } else {
        // Nouvel utilisateur sans équipe - ouvrir la modal de création d'équipe
        setIsTeamSetupOpen(true);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du profil:", error);
      // En cas d'erreur, ouvrir quand même la modal de création d'équipe
      setIsTeamSetupOpen(true);
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
