import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Users,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AdminPanel = () => {
  const [betaCodes, setBetaCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBetaCodes();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Statistiques des utilisateurs
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      // Statistiques des équipes
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id');

      if (usersError || teamsError) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      setStats({
        totalUsers: users?.length || 0,
        totalTeams: teams?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBetaCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('beta_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBetaCodes(data || []);
    } catch (error) {
      console.error('Error fetching beta codes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les codes beta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const createBetaCode = async () => {
    if (!teamName.trim() || !customCode.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Vérifier que le code n'existe pas déjà
      const { data: existing } = await supabase
        .from('beta_codes')
        .select('id')
        .eq('code', customCode.toUpperCase())
        .limit(1);

      if (existing && existing.length > 0) {
        throw new Error("Ce code existe déjà, veuillez en choisir un autre");
      }

      const { error } = await supabase
        .from('beta_codes')
        .insert({
          code: customCode.toUpperCase(),
          team_name: teamName,
          expires_at: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString() // 6 mois
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Code beta créé pour l'équipe ${teamName}`
      });

      // Reset form
      setTeamName("");
      setCustomCode("");

      // Refresh de la liste
      fetchBetaCodes();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le code beta",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteBetaCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('beta_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Code beta supprimé"
      });

      fetchBetaCodes();
      fetchStats();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le code beta",
        variant: "destructive"
      });
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copié",
      description: "Code copié dans le presse-papiers"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-primary rounded-lg mx-auto animate-pulse"></div>
          <p>Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour à l'accueil
          </Button>
          <h1 className="text-3xl font-bold">Administration - Codes Beta</h1>
          <div></div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs totaux
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Comptes créés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Équipes créées
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                Équipes actives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Codes Beta
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{betaCodes.length}</div>
              <p className="text-xs text-muted-foreground">
                Codes générés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Codes utilisés
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {betaCodes.filter(c => c.used_at).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Comptes créés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Création de code beta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer un nouveau code beta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamName">Nom de l'équipe</Label>
                <Input
                  id="teamName"
                  placeholder="Ex: Shadow Hunters"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customCode">Code beta</Label>
                <div className="flex gap-2">
                  <Input
                    id="customCode"
                    placeholder="Ex: SHADOW24"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCustomCode(generateRandomCode())}
                  >
                    Aléatoire
                  </Button>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={createBetaCode}
              disabled={isGenerating || !teamName.trim() || !customCode.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? 'Création...' : 'Créer le code beta'}
            </Button>
          </CardContent>
        </Card>

        {/* Liste des codes beta */}
        <Card>
          <CardHeader>
            <CardTitle>Codes beta existants ({betaCodes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {betaCodes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun code beta créé pour le moment
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead>Expire le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {betaCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-medium">
                          <div className="flex items-center gap-2">
                            {code.code}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCodeToClipboard(code.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{code.team_name}</TableCell>
                        <TableCell>
                          {code.used_at ? (
                            <span className="text-green-600 text-sm">Utilisé</span>
                          ) : new Date(code.expires_at) < new Date() ? (
                            <span className="text-red-600 text-sm">Expiré</span>
                          ) : (
                            <span className="text-blue-600 text-sm">Disponible</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(code.created_at), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(code.expires_at), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBetaCode(code.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;