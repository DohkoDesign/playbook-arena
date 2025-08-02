import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'player' | 'manager' | 'owner';
}

type UserRole = 'player' | 'staff' | 'manager' | 'owner';

export const AuthGuard = ({ children, requireRole }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/");
        } else {
          checkAuthorization(session.user);
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/");
      } else {
        checkAuthorization(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, requireRole]);

  const checkAuthorization = async (user: User) => {
    if (!requireRole) {
      setAuthorized(true);
      return;
    }

    try {
      // Vérifier le profil utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      // Vérifier les équipes créées (pour le rôle owner)
      const { data: createdTeams } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", user.id);

      // Vérifier les memberships d'équipe
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("role, team_id")
        .eq("user_id", user.id);

      let userRole: UserRole = profile?.role as UserRole;

      // Déterminer le rôle effectif
      if (createdTeams && createdTeams.length > 0) {
        userRole = 'owner';
      } else if (teamMembers && teamMembers.length > 0) {
        const managerRole = teamMembers.find(tm => tm.role === 'manager');
        if (managerRole) {
          userRole = 'manager';
        } else {
          userRole = 'player';
        }
      }

      // Vérifier l'autorisation
      if (!userRole) {
        navigate("/");
        return;
      }

      if (requireRole === 'player' && userRole === 'player') {
        setAuthorized(true);
      } else if (requireRole === 'manager' && (userRole === 'manager' || userRole === 'owner')) {
        setAuthorized(true);
      } else if (requireRole === 'owner' && userRole === 'owner') {
        setAuthorized(true);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des autorisations:", error);
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!session || !user || !authorized) {
    return null;
  }

  return <>{children}</>;
};