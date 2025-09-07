import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Load theme from user profile on component mount
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('theme')
          .eq('user_id', user.id)
          .single();

        if (profile?.theme && profile.theme !== theme) {
          setTheme(profile.theme);
        }
      } catch (error) {
        // Silently fail - theme will use default
        console.log('Could not load user theme preference');
      }
    };

    loadUserTheme();
  }, [setTheme, theme]);

  const handleThemeChange = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setIsLoading(true);
    
    try {
      // Update theme immediately for UI responsiveness
      setTheme(newTheme);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('user_id', user.id);

        if (error) {
          console.error('Failed to save theme preference:', error);
          toast({
            title: "Erreur",
            description: "Impossible de sauvegarder votre préférence de thème",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Theme change error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le thème",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
      disabled={isLoading}
      className="h-9 w-9 rounded-full transition-all duration-300 hover:bg-white/10 text-foreground dark:text-white"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};