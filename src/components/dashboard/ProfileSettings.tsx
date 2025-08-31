import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Loader2, Upload, User, Mail, Lock, BarChart3 } from "lucide-react";
import { TrackerSettings } from "../player/TrackerSettings";

interface ProfileSettingsProps {
  user: SupabaseUser | null;
  onProfileUpdate?: () => void;
}

export const ProfileSettings = ({ user, onProfileUpdate }: ProfileSettingsProps) => {
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [teamData, setTeamData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setPseudo(user.user_metadata?.pseudo || "");
      setEmail(user.email || "");
      loadProfile();
      loadUserData();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
      } else if (data) {
        setUserProfile(data);
        if (data.photo_profil) {
          setAvatarUrl(data.photo_profil);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Récupérer les données d'équipe du joueur
      const { data: teamMembers, error: teamError } = await supabase
        .from("team_members")
        .select(`
          team_id,
          teams:team_id (
            id,
            nom,
            jeu
          )
        `)
        .eq("user_id", user.id)
        .limit(1);

      if (teamError) throw teamError;

      if (teamMembers && teamMembers.length > 0) {
        setTeamData(teamMembers[0].teams);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }

    const file = event.target.files[0];
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result); // Image en base64 pour usage local

        // Mettre à jour le profil avec la nouvelle photo (base64)
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ photo_profil: result })
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        setUploading(false);
        toast({
          title: "Photo mise à jour",
          description: "Votre photo de profil a été mise à jour localement",
        });

        if (onProfileUpdate) {
          onProfileUpdate();
        }
      };
      
      reader.onerror = () => {
        setUploading(false);
        toast({
          title: "Erreur",
          description: "Erreur lors de la lecture du fichier",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      setUploading(false);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          pseudo: pseudo
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      const { error: userError } = await supabase.auth.updateUser({
        data: { pseudo: pseudo }
      });

      if (userError) throw userError;

      onProfileUpdate?.();
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: email
      });

      if (error) throw error;

      toast({
        title: "Email en cours de mise à jour",
        description: "Vérifiez votre nouvelle adresse email pour confirmer",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPlayer = userProfile?.role === 'player';
  
  // Vérifier si l'utilisateur a un rôle staff dans une équipe
  const [isStaff, setIsStaff] = useState(false);
  
  useEffect(() => {
    const checkStaffRole = async () => {
      if (!user) return;
      
      try {
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("role")
          .eq("user_id", user.id);
          
        const staffRoles = ['owner', 'coach', 'manager'];
        const hasStaffRole = teamMembers?.some(member => staffRoles.includes(member.role));
        setIsStaff(hasStaffRole || false);
      } catch (error) {
        console.error("Error checking staff role:", error);
      }
    };
    
    checkStaffRole();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Paramètres</h2>
        <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className={`grid w-full ${isPlayer && !isStaff ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          {isPlayer && !isStaff && (
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tracker
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {/* Photo de profil */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photo de profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {(user?.user_metadata?.pseudo || user?.email)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        {uploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Changer
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG jusqu'à 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pseudo">Pseudo</Label>
                <Input
                  id="pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Votre pseudo"
                />
              </div>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Adresse email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
              <Button onClick={handleUpdateEmail} disabled={loading} variant="outline">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Modifier l'email
              </Button>
            </CardContent>
          </Card>

          {/* Mot de passe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button onClick={handleUpdatePassword} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isPlayer && !isStaff && (
          <TabsContent value="tracker" className="space-y-4">
            <TrackerSettings 
              userId={user?.id || ''} 
              userProfile={userProfile} 
              teamData={teamData} 
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};