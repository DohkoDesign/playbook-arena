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
  const [teamLogos, setTeamLogos] = useState<{[key: string]: string}>({});
  const [colors, setColors] = useState({
    primary: "220 38% 57%", // Bleu par défaut en HSL
    secondary: "142 76% 36%", // Vert par défaut en HSL  
    accent: "262 83% 58%" // Violet par défaut en HSL
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
    // Initialiser les noms et logos des équipes
    const names: {[key: string]: string} = {};
    const logos: {[key: string]: string} = {};
    teams.forEach(team => {
      names[team.id] = team.nom;
      logos[team.id] = team.logo || "";
    });
    setTeamNames(names);
    setTeamLogos(logos);
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

  const updateTeam = async (teamId: string, field: 'nom' | 'logo') => {
    const value = field === 'nom' ? teamNames[teamId] : teamLogos[teamId];
    if (!value?.trim() && field === 'nom') return;

    try {
      setLoading(true);
      const updateData = field === 'nom' ? { nom: value } : { logo: value };
      
      const { error } = await supabase
        .from("teams")
        .update(updateData)
        .eq("id", teamId);

      if (error) throw error;

      toast({
        title: "Équipe mise à jour",
        description: `${field === 'nom' ? 'Le nom' : 'Le logo'} de l'équipe a été modifié`,
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teams">Équipes</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

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
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              {/* Logo de l'équipe */}
                              <div className="flex flex-col items-center space-y-2">
                                {teamLogos[team.id] ? (
                                  <img 
                                    src={teamLogos[team.id]} 
                                    alt="Logo de l'équipe" 
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-medium">
                                    {team.nom.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                
                                {/* Upload logo */}
                                <div className="space-y-1">
                                  <Input
                                    type="url"
                                    placeholder="URL du logo"
                                    value={teamLogos[team.id] || ""}
                                    onChange={(e) => setTeamLogos({
                                      ...teamLogos,
                                      [team.id]: e.target.value
                                    })}
                                    className="w-32 text-xs"
                                  />
                                  <Button 
                                    size="sm" 
                                    onClick={() => updateTeam(team.id, 'logo')}
                                    disabled={loading}
                                    className="w-full text-xs"
                                  >
                                    <Upload className="w-3 h-3 mr-1" />
                                    Mettre à jour
                                  </Button>
                                </div>
                              </div>
                              
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
                      value={hslToHex(colors.primary)}
                      onChange={(e) => setColors({...colors, primary: hexToHsl(e.target.value)})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={colors.primary}
                      onChange={(e) => setColors({...colors, primary: e.target.value})}
                      placeholder="220 38% 57%"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Couleur secondaire</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="secondary-color"
                      value={hslToHex(colors.secondary)}
                      onChange={(e) => setColors({...colors, secondary: hexToHsl(e.target.value)})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={colors.secondary}
                      onChange={(e) => setColors({...colors, secondary: e.target.value})}
                      placeholder="142 76% 36%"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Couleur d'accent</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="accent-color"
                      value={hslToHex(colors.accent)}
                      onChange={(e) => setColors({...colors, accent: hexToHsl(e.target.value)})}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={colors.accent}
                      onChange={(e) => setColors({...colors, accent: e.target.value})}
                      placeholder="262 83% 58%"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Aperçu des couleurs:</h4>
                <div className="flex space-x-4">
                  <div 
                    className="w-12 h-12 rounded border-2 border-border"
                    style={{ backgroundColor: `hsl(${colors.primary})` }}
                    title="Couleur principale"
                  ></div>
                  <div 
                    className="w-12 h-12 rounded border-2 border-border"
                    style={{ backgroundColor: `hsl(${colors.secondary})` }}
                    title="Couleur secondaire"
                  ></div>
                  <div 
                    className="w-12 h-12 rounded border-2 border-border"
                    style={{ backgroundColor: `hsl(${colors.accent})` }}
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