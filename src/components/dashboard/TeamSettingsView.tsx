import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Upload, Palette, Trash2, Save, Plus, Edit,
  Building, Users, Trophy, Paintbrush
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getGameConfig } from "@/data/gameConfigs";

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
  const [orgSettings, setOrgSettings] = useState({
    name: "Shadow Hub",
    logo: "",
    subtitle: "Esport Manager"
  });
  const [colors, setColors] = useState({
    primary: "#3B82F6",
    secondary: "#10B981", 
    accent: "#8B5CF6"
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gameConfig = gameType ? getGameConfig(gameType) : null;

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
      loadOrgSettings();
      loadColors();
    }
  }, [teamId]);

  useEffect(() => {
    // Initialiser les noms des équipes
    const names: {[key: string]: string} = {};
    teams.forEach(team => {
      names[team.id] = team.nom;
    });
    setTeamNames(names);
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

  const loadOrgSettings = () => {
    const saved = localStorage.getItem("org_settings");
    if (saved) {
      setOrgSettings(JSON.parse(saved));
    }
  };

  const loadColors = () => {
    const saved = localStorage.getItem("site_colors");
    if (saved) {
      setColors(JSON.parse(saved));
    }
  };

  const saveOrgSettings = () => {
    localStorage.setItem("org_settings", JSON.stringify(orgSettings));
    
    // Mettre à jour le titre de la page
    document.title = orgSettings.name;
    
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres de l'organisation ont été mis à jour",
    });
  };

  const saveColors = () => {
    localStorage.setItem("site_colors", JSON.stringify(colors));
    
    // Appliquer les couleurs CSS
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    
    toast({
      title: "Couleurs appliquées",
      description: "Les couleurs du site ont été mises à jour",
    });
  };

  const updateTeamName = async (teamId: string) => {
    if (!teamNames[teamId]?.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("teams")
        .update({ nom: teamNames[teamId] })
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

  const deleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${teamName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Supprimer tous les membres de l'équipe
      await supabase.from("team_members").delete().eq("team_id", teamId);
      
      // Supprimer toutes les stratégies
      await supabase.from("strategies").delete().eq("team_id", teamId);
      
      // Supprimer tous les événements
      await supabase.from("events").delete().eq("team_id", teamId);
      
      // Supprimer l'équipe
      const { error } = await supabase.from("teams").delete().eq("id", teamId);

      if (error) throw error;

      toast({
        title: "Équipe supprimée",
        description: `L'équipe "${teamName}" a été supprimée`,
      });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Paramètres Équipe</h2>
        </div>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organization">Organisation</TabsTrigger>
          <TabsTrigger value="teams">Équipes</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Informations de l'organisation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Nom de l'organisation</Label>
                  <Input
                    id="org-name"
                    value={orgSettings.name}
                    onChange={(e) => setOrgSettings({...orgSettings, name: e.target.value})}
                    placeholder="Shadow Hub"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-subtitle">Sous-titre</Label>
                  <Input
                    id="org-subtitle"
                    value={orgSettings.subtitle}
                    onChange={(e) => setOrgSettings({...orgSettings, subtitle: e.target.value})}
                    placeholder="Esport Manager"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="org-logo">URL du logo</Label>
                <Input
                  id="org-logo"
                  value={orgSettings.logo}
                  onChange={(e) => setOrgSettings({...orgSettings, logo: e.target.value})}
                  placeholder="https://exemple.com/logo.png"
                />
              </div>
              
              {orgSettings.logo && (
                <div className="mt-4">
                  <Label>Aperçu du logo:</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <img 
                      src={orgSettings.logo} 
                      alt="Logo de l'organisation" 
                      className="h-12 w-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <Button onClick={saveOrgSettings} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres de l'organisation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6 mt-6">
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
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-medium">
                                {team.nom.charAt(0).toUpperCase()}
                              </div>
                              <div>
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
                                      onClick={() => updateTeamName(team.id)}
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
                              onClick={() => deleteTeam(team.id, team.nom)}
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

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Paintbrush className="w-5 h-5" />
                <span>Couleurs du site</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Couleur principale</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="primary-color"
                      value={colors.primary}
                      onChange={(e) => setColors({...colors, primary: e.target.value})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={colors.primary}
                      onChange={(e) => setColors({...colors, primary: e.target.value})}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Couleur secondaire</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="secondary-color"
                      value={colors.secondary}
                      onChange={(e) => setColors({...colors, secondary: e.target.value})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={colors.secondary}
                      onChange={(e) => setColors({...colors, secondary: e.target.value})}
                      placeholder="#10B981"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Couleur d'accent</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="accent-color"
                      value={colors.accent}
                      onChange={(e) => setColors({...colors, accent: e.target.value})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={colors.accent}
                      onChange={(e) => setColors({...colors, accent: e.target.value})}
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Aperçu des couleurs:</h4>
                <div className="flex space-x-4">
                  <div 
                    className="w-12 h-12 rounded"
                    style={{ backgroundColor: colors.primary }}
                    title="Couleur principale"
                  ></div>
                  <div 
                    className="w-12 h-12 rounded"
                    style={{ backgroundColor: colors.secondary }}
                    title="Couleur secondaire"
                  ></div>
                  <div 
                    className="w-12 h-12 rounded"
                    style={{ backgroundColor: colors.accent }}
                    title="Couleur d'accent"
                  ></div>
                </div>
              </div>
              
              <Button onClick={saveColors} className="w-full">
                <Palette className="w-4 h-4 mr-2" />
                Appliquer les couleurs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Paramètres avancés</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fonctionnalités avancées à venir...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};