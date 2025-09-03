import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminPanel from '@/components/admin/AdminPanel';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      // Check if user has staff role only
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.role === 'staff') {
        setIsAuthorized(true);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur d\'autorisation:', error);
      navigate('/');
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Accès refusé</h1>
          <p>Vous n'êtes pas autorisé à accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
};

export default Admin;