import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useTheme } from "next-themes";

export const useAuth = () => {
  console.log("🔐 useAuth hook called");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load user theme preference when user logs in
      if (session?.user && event === 'SIGNED_IN') {
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('theme')
              .eq('user_id', session.user.id)
              .single();

            if (profile?.theme) {
              setTheme(profile.theme);
            }
          } catch (error) {
            console.log('Could not load user theme preference on login');
          }
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load theme for existing session
      if (session?.user) {
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('theme')
              .eq('user_id', session.user.id)
              .single();

            if (profile?.theme) {
              setTheme(profile.theme);
            }
          } catch (error) {
            console.log('Could not load user theme preference');
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [setTheme]);

  return { user, session };
};