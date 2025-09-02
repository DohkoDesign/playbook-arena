import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Upload, Palette, Trash2, Save, Plus, Edit,
  Building, Users, Trophy, Paintbrush, UserCog, Link
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";
import { DeleteTeamModal } from "./DeleteTeamModal";
import { TeamMembersManager } from "./TeamMembersManager";
import { ImageUploadLocal } from "@/components/ui/image-upload-local";

interface TeamSettingsViewProps {
  teamId: string;
  gameType?: string;
  teams: any[];
  onTeamUpdated: () => void;
}

export const TeamSettingsView = ({ teamId, gameType, teams, onTeamUpdated }: TeamSettingsViewProps) => {
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [teamNames, setTeamNames] = useState<{[key: string]: string}>({});
  const [organizationLogo, setOrganizationLogo] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [colors, setColors] = useState({
    primary: "220 38% 57%", // Bleu par défaut en HSL
    secondary: "142 76% 36%", // Vert par défaut en HSL  
    accent: "220 92% 70%" // Couleur d'accent mise à jour
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gameConfig = gameType ? getGameConfig(gameType) : null;

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
      loadColors();
    }
  }, [teamId]);

  useEffect(() => {
    // Initialiser les noms des équipes et le logo de l'organisation
    const names: {[key: string]: string} = {};
    teams.forEach(team => {
      names[team.id] = team.nom;
    });
    setTeamNames(names);
    
    // Charger les données de l'organisation depuis le localStorage
    const savedLogo = localStorage.getItem("organization_logo");
    if (savedLogo) {
      setOrganizationLogo(savedLogo);
    }
    
    const savedName = localStorage.getItem("organization_name");
    if (savedName) {
      setOrganizationName(savedName);
    } else {
      setOrganizationName("Esport Manager");
    }
  }, [teams]);

  const fetchTeamData = async () => {
    try {
      const { data: team } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      setCurrentTeam(team);
    } catch (error: any) {
      console.error("Error fetching team:", error);
    }
  };

  const loadColors = () => {
    const saved = localStorage.getItem("site_colors");
    if (saved) {
      setColors(JSON.parse(saved));
    } else {
      // Appliquer les couleurs par défaut
      applyColorsToCSS(colors);
    }
  };

  const applyColorsToCSS = (colorValues: typeof colors) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colorValues.primary);
    root.style.setProperty('--secondary', colorValues.secondary);
    root.style.setProperty('--accent', colorValues.accent);
    
    // Variantes pour les dégradés
    root.style.setProperty('--primary-glow', colorValues.primary);
    root.style.setProperty('--gradient-brand', `linear-gradient(135deg, hsl(${colorValues.primary}), hsl(${colorValues.accent}))`);
    root.style.setProperty('--gradient-subtle', `linear-gradient(180deg, hsl(${colorValues.primary} / 0.05), transparent)`);
  };

  const saveColors = () => {
    localStorage.setItem("site_colors", JSON.stringify(colors));
    applyColorsToCSS(colors);
    
    toast({
      title: "Couleurs appliquées",
      description: "Les couleurs du site ont été mises à jour",
    });
  };

  const updateTeam = async (teamId: string, field: 'nom') => {
    const value = teamNames[teamId];
    if (!value?.trim()) return;

    try {
      setLoading(true);
      const updateData = { nom: value };
      
      const { error } = await supabase
        .from("teams")
        .update(updateData)
        .eq("id", teamId);

      if (error) throw error;

      toast({
        title: "Équipe mise à jour",
        description: "Le nom de l'équipe a été modifié",
      });

      setEditingTeam(null);
      onTeamUpdated();
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

  const updateOrganizationLogo = (newUrl?: string) => {
    const urlToSave = newUrl ?? organizationLogo;
    localStorage.setItem("organization_logo", urlToSave || "");
    
    toast({
      title: "Logo mis à jour",
      description: urlToSave ? "Le logo de l'organisation a été modifié" : "Le logo a été supprimé",
    });
  };

  const updateOrganizationName = () => {
    localStorage.setItem("organization_name", organizationName);
    
    toast({
      title: "Nom mis à jour",
      description: "Le nom de l'organisation a été modifié",
    });
    
    // Recharger la page pour mettre à jour la sidebar
    window.location.reload();
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{id: string, name: string} | null>(null);

  const handleDeleteClick = (teamId: string, teamName: string) => {
    setTeamToDelete({id: teamId, name: teamName});
    setShowDeleteModal(true);
  };

  const deleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      setLoading(true);
      
      // Supprimer tous les membres de l'équipe
      await supabase.from("team_members").delete().eq("team_id", teamId);
      
      // Supprimer tous les événements
      await supabase.from("events").delete().eq("team_id", teamId);
      
      // Supprimer l'équipe
      const { error } = await supabase.from("teams").delete().eq("id", teamToDelete.id);

      if (error) throw error;

      toast({
        title: "Équipe supprimée",
        description: `L'équipe "${teamToDelete.name}" a été supprimée`,
      });

      setShowDeleteModal(false);
      setTeamToDelete(null);
      onTeamUpdated();
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

  // Conversion hex vers HSL pour les couleurs
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map((v, i) => 
      i === 0 ? parseInt(v) : parseInt(v.replace('%', ''))
    );
    
    const hDecimal = h / 360;
    const sDecimal = s / 100;
    const lDecimal = l / 100;

    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs((hDecimal * 6) % 2 - 1));
    const m = lDecimal - c / 2;

    let r = 0, g = 0, b = 0;
    if (hDecimal >= 0 && hDecimal < 1/6) { r = c; g = x; b = 0; }
    else if (hDecimal >= 1/6 && hDecimal < 2/6) { r = x; g = c; b = 0; }
    else if (hDecimal >= 2/6 && hDecimal < 3/6) { r = 0; g = c; b = x; }
    else if (hDecimal >= 3/6 && hDecimal < 4/6) { r = 0; g = x; b = c; }
    else if (hDecimal >= 4/6 && hDecimal < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Paramètres Équipe</h2>
        </div>
      </div>

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teams">Équipes</TabsTrigger>
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
          <TabsTrigger value="danger">Zone de danger</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6 mt-6">
          {/* Informations de l'organisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Informations de l'organisation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nom de l'organisation */}
              <div className="space-y-2">
                <Label htmlFor="orgName">Nom de l'organisation</Label>
                <div className="flex space-x-2">
                  <Input
                    id="orgName"
                    type="text"
                    placeholder="Nom de votre organisation"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                  <Button onClick={updateOrganizationName}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </div>
              
              {/* Logo de l'organisation */}
              <div className="space-y-4">
                <Label>Logo de l'organisation</Label>
                
                <div className="flex items-start space-x-4">
                  {organizationLogo ? (
                    <img 
                      src={organizationLogo} 
                      alt="Logo de l'organisation" 
                      className="w-16 h-16 rounded-lg object-cover border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl border">
                      {organizationName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3">
                    {/* URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor="orgLogo" className="flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        URL du logo
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="orgLogo"
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={organizationLogo}
                          onChange={(e) => setOrganizationLogo(e.target.value)}
                        />
                        <Button onClick={() => updateOrganizationLogo()} variant="outline">
                          <Save className="w-4 h-4 mr-2" />
                          Appliquer
                        </Button>
                      </div>
                    </div>
                    
                    {/* Séparateur */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 border-t border-border"></div>
                      <span className="text-xs text-muted-foreground">OU</span>
                      <div className="flex-1 border-t border-border"></div>
                    </div>
                    
                    {/* Upload Local */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload depuis votre ordinateur
                      </Label>
                      <ImageUploadLocal
                        onImageUploaded={(url) => {
                          setOrganizationLogo(url);
                          updateOrganizationLogo(url);
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Gestion des équipes ({teams.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune équipe créée</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Créez votre première équipe pour commencer
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <Card key={team.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                           <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-3">
                               <div className="flex-1">
                                 {editingTeam === team.id ? (
                                   <div className="flex items-center space-x-2">
                                     <Input
                                       value={teamNames[team.id] || ""}
                                       onChange={(e) => setTeamNames({
                                         ...teamNames,
                                         [team.id]: e.target.value
                                       })}
                                       className="w-48"
                                     />
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateTeam(team.id, 'nom')}
                                        disabled={loading}
                                      >
                                       <Save className="w-4 h-4" />
                                     </Button>
                                     <Button 
                                       size="sm" 
                                       variant="outline" 
                                       onClick={() => setEditingTeam(null)}
                                     >
                                       Annuler
                                     </Button>
                                   </div>
                                 ) : (
                                   <div className="flex items-center space-x-2">
                                     <h4 className="font-semibold">{team.nom}</h4>
                                     <Button
                                       size="sm"
                                       variant="ghost"
                                       onClick={() => setEditingTeam(team.id)}
                                     >
                                       <Edit className="w-4 h-4" />
                                     </Button>
                                   </div>
                                 )}
                                 
                                 <div className="flex items-center space-x-2 mt-1">
                                   <span className="text-sm text-muted-foreground capitalize">
                                     {gameConfig?.name || team.jeu}
                                   </span>
                                   {team.id === teamId && (
                                     <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                       Équipe active
                                     </span>
                                   )}
                                 </div>
                               </div>
                             </div>
                           </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              Créée le {new Date(team.created_at).toLocaleDateString("fr-FR")}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(team.id, team.nom)}
                              className="text-red-500 hover:text-red-700"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6 mt-6">
          <TeamMembersManager 
            teamId={teamId}
            onMembersUpdated={onTeamUpdated}
          />
        </TabsContent>



        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Paramètres avancés</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Sauvegarde et Exportation
                  </h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Exporter les données d'équipe
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder les configurations
                    </Button>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6 mt-6">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                <span>Zone de danger</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Actions irréversibles</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Ces actions sont définitives et ne peuvent pas être annulées. Assurez-vous de bien comprendre les conséquences.
                </p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer toutes les données d'équipe
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Réinitialiser toutes les statistiques
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteTeamModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTeamToDelete(null);
        }}
        onConfirm={deleteTeam}
        teamName={teamToDelete?.name || ""}
        loading={loading}
      />
    </div>
  );
};