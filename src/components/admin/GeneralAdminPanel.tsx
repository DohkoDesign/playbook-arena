import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Users,
  Shield,
  Database,
  Activity,
  Settings,
  BarChart3
} from "lucide-react";

const GeneralAdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalFeedbacks: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Statistiques des utilisateurs
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      // Statistiques des équipes
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      // Statistiques des feedbacks
      const { data: feedbacks, error: feedbacksError } = await supabase
        .from('player_feedbacks')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (usersError || teamsError || feedbacksError) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      // Calculer les utilisateurs actifs (derniers 7 jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = users?.filter(user => 
        new Date(user.created_at) >= sevenDaysAgo
      ).length || 0;

      setStats({
        totalUsers: users?.length || 0,
        totalTeams: teams?.length || 0,
        totalFeedbacks: feedbacks?.length || 0,
        activeUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStats = () => {
    fetchStats();
    toast({
      title: "Actualisé",
      description: "Les statistiques ont été mises à jour"
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
          <h1 className="text-3xl font-bold">Panneau d'Administration</h1>
          <div></div>
        </div>

        {/* Statistiques générales */}
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
                Feedbacks reçus
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFeedbacks}</div>
              <p className="text-xs text-muted-foreground">
                Messages des joueurs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs actifs
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreference" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Derniers 7 jours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions administrateur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Actions d'administration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={handleRefreshStats}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Actualiser les statistiques
              </Button>
              
              <Button 
                onClick={() => toast({
                  title: "Fonctionnalité à venir",
                  description: "Cette fonctionnalité sera disponible prochainement"
                })}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Gérer la base de données
              </Button>
              
              <Button 
                onClick={() => toast({
                  title: "Fonctionnalité à venir", 
                  description: "Cette fonctionnalité sera disponible prochainement"
                })}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Gérer les utilisateurs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations système */}
        <Card>
          <CardHeader>
            <CardTitle>Informations système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Version :</strong> 1.0.0</p>
              <p><strong>Environnement :</strong> Production</p>
              <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
              <p><strong>Statut :</strong> <span className="text-green-600">✅ Opérationnel</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeneralAdminPanel;