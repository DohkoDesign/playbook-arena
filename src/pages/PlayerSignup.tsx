import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Users, 
  Gamepad2,
  UserPlus,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function PlayerSignup() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [gameConfig, setGameConfig] = useState<any>(null);
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    pseudo: "",
    email: "",
    password: "",
    photoUrl: "",
    role: "",
    personnages: [] as string[]
  });
  
  const [step, setStep] = useState(1); // 1: Info perso, 2: Jeu et rôle, 3: Confirmation

  useEffect(() => {
    if (token) {
      verifyInvitation();
    }
  }, [token]);

  const verifyInvitation = async () => {
    try {
      // Vérifier l'invitation
      const { data: invitationData, error: invError } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (invError) throw new Error("Invitation invalide ou expirée");

      // Récupérer l'équipe
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", invitationData.team_id)
        .single();

      if (teamError) throw new Error("Équipe introuvable");

      setInvitation(invitationData);
      setTeam(teamData);
      
      // Charger la configuration du jeu
      const config = getGameConfig(teamData.jeu);
      setGameConfig(config);
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const handlePersonnageToggle = (personnage: string) => {
    setFormData(prev => ({
      ...prev,
      personnages: prev.personnages.includes(personnage)
        ? prev.personnages.filter(p => p !== personnage)
        : [...prev.personnages, personnage]
    }));
  };

  const handleSignup = async () => {
    if (!formData.pseudo || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            pseudo: formData.pseudo,
            role: 'player'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Créer le profil joueur
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            pseudo: formData.pseudo,
            photo_profil: formData.photoUrl || null,
            role: 'player',
            jeux_joues: [team.jeu],
            personnages_favoris: formData.personnages
          });

        if (profileError) throw profileError;

        // Ajouter le joueur à l'équipe
        const { error: memberError } = await supabase
          .from("team_members")
          .insert({
            team_id: team.id,
            user_id: authData.user.id,
            role: formData.role as any,
            personnages_favoris: formData.personnages
          });

        if (memberError) throw memberError;

        // Créer le profil joueur pour le coaching
        const { error: playerProfileError } = await supabase
          .from("player_profiles")
          .insert({
            team_id: team.id,
            user_id: authData.user.id,
            points_forts: [],
            points_faibles: [],
            objectifs_individuels: []
          });

        if (playerProfileError) throw playerProfileError;

        // Marquer l'invitation comme utilisée
        const { error: invError } = await supabase
          .from("invitations")
          .update({
            used_at: new Date().toISOString(),
            used_by: authData.user.id
          })
          .eq("id", invitation.id);

        if (invError) throw invError;

        toast({
          title: "Compte créé avec succès !",
          description: "Vérifiez votre email pour confirmer votre compte, puis connectez-vous.",
        });

        navigate("/auth");
      }
    } catch (error: any) {
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!invitation || !team || !gameConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p>Vérification de l'invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* En-tête avec info équipe */}
          <Card className="mb-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {team.nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Rejoindre {team.nom}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{gameConfig.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {invitation.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <span className="text-sm font-medium">Informations</span>
              </div>
              <div className="w-8 h-0.5 bg-border"></div>
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <span className="text-sm font-medium">Jeu & Rôle</span>
              </div>
              <div className="w-8 h-0.5 bg-border"></div>
              <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {step === 1 && <User className="w-5 h-5" />}
                {step === 2 && <Gamepad2 className="w-5 h-5" />}
                {step === 3 && <UserPlus className="w-5 h-5" />}
                <span>
                  {step === 1 && "Informations personnelles"}
                  {step === 2 && "Sélection jeu et rôle"}
                  {step === 3 && "Finaliser l'inscription"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pseudo">Pseudo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pseudo"
                        className="pl-9"
                        placeholder="Votre pseudo de jeu"
                        value={formData.pseudo}
                        onChange={(e) => setFormData(prev => ({ ...prev, pseudo: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-9"
                        placeholder="Mot de passe sécurisé"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo de profil (optionnel)</Label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="photo"
                        type="url"
                        className="pl-9"
                        placeholder="https://exemple.com/photo.jpg"
                        value={formData.photoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Rôle dans l'équipe *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameConfig.roles.map((role: string) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {gameConfig.characters && gameConfig.characters.length > 0 && (
                    <div className="space-y-4">
                      <Label>Personnages joués (optionnel)</Label>
                      <p className="text-sm text-muted-foreground">
                        Sélectionnez les personnages que vous maîtrisez le mieux
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                        {gameConfig.characters.map((character: string) => (
                          <div key={character} className="flex items-center space-x-2">
                            <Checkbox
                              id={character}
                              checked={formData.personnages.includes(character)}
                              onCheckedChange={() => handlePersonnageToggle(character)}
                            />
                            <Label htmlFor={character} className="text-sm cursor-pointer">
                              {character}
                            </Label>
                          </div>
                        ))}
                      </div>
                      
                      {formData.personnages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Personnages sélectionnés:</p>
                          <div className="flex flex-wrap gap-1">
                            {formData.personnages.map((perso) => (
                              <Badge key={perso} variant="secondary" className="text-xs">
                                {perso}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Prêt à rejoindre l'équipe !</h3>
                    <p className="text-muted-foreground">
                      Vérifiez vos informations avant de finaliser votre inscription
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pseudo:</span>
                      <span className="font-medium">{formData.pseudo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rôle:</span>
                      <span className="font-medium">{formData.role}</span>
                    </div>
                    {formData.personnages.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Personnages:</span>
                        <div className="flex flex-wrap gap-1">
                          {formData.personnages.slice(0, 3).map((perso) => (
                            <Badge key={perso} variant="outline" className="text-xs">
                              {perso}
                            </Badge>
                          ))}
                          {formData.personnages.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{formData.personnages.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Confirmation par email
                        </p>
                        <p className="text-blue-700 dark:text-blue-300">
                          Un email de confirmation sera envoyé à votre adresse. Vous devrez le valider avant de pouvoir vous connecter.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={loading}
                  >
                    Précédent
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 && (!formData.pseudo || !formData.email || !formData.password)) ||
                      (step === 2 && !formData.role)
                    }
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    onClick={handleSignup}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Création du compte..." : "Finaliser l'inscription"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}