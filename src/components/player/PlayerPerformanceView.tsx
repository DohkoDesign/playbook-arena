import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Trophy, Target, Calendar, Zap, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlayerPerformanceViewProps {
  teamId: string;
  playerId: string;
}

interface PerformanceMetric {
  label: string;
  value: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'performance' | 'team' | 'personal';
}

export const PlayerPerformanceView = ({ teamId, playerId }: PlayerPerformanceViewProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPerformanceData();
  }, [teamId, playerId]);

  const fetchPerformanceData = async () => {
    try {
      // Simuler des métriques de performance
      const mockMetrics: PerformanceMetric[] = [
        {
          label: "Précision aim",
          value: 67,
          max: 100,
          trend: 'up',
          color: "bg-blue-500"
        },
        {
          label: "Réaction moyenne",
          value: 180,
          max: 300,
          trend: 'down',
          color: "bg-green-500"
        },
        {
          label: "Game Sense",
          value: 85,
          max: 100,
          trend: 'up',
          color: "bg-purple-500"
        },
        {
          label: "Travail d'équipe",
          value: 92,
          max: 100,
          trend: 'stable',
          color: "bg-orange-500"
        },
        {
          label: "Adaptabilité",
          value: 78,
          max: 100,
          trend: 'up',
          color: "bg-pink-500"
        },
        {
          label: "Consistance",
          value: 71,
          max: 100,
          trend: 'up',
          color: "bg-indigo-500"
        }
      ];

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Première victoire en tournoi',
          description: 'Victoire lors du tournoi weekly #12',
          date: '2024-01-15',
          type: 'team'
        },
        {
          id: '2',
          title: 'MVP du match',
          description: 'Meilleur joueur du match contre Team Alpha',
          date: '2024-01-10',
          type: 'performance'
        },
        {
          id: '3',
          title: 'Objectif atteint',
          description: 'Amélioration de 15% de la précision aim',
          date: '2024-01-05',
          type: 'personal'
        },
        {
          id: '4',
          title: 'Série de victoires',
          description: '10 victoires consécutives en ranked',
          date: '2023-12-28',
          type: 'performance'
        }
      ];

      setMetrics(mockMetrics);
      setAchievements(mockAchievements);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de performance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'team':
        return <Award className="w-5 h-5 text-blue-500" />;
      case 'personal':
        return <Target className="w-5 h-5 text-green-500" />;
      default:
        return <Zap className="w-5 h-5 text-purple-500" />;
    }
  };

  const getAchievementTypeLabel = (type: string) => {
    switch (type) {
      case 'performance': return 'Performance';
      case 'team': return 'Équipe';
      case 'personal': return 'Personnel';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Performances</h1>
        </div>
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes Performances</h1>
          <p className="text-muted-foreground">Suivez votre évolution et vos accomplissements</p>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{metric.label}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl font-bold">
                  {metric.label === "Réaction moyenne" ? `${metric.value}ms` : `${metric.value}%`}
                </span>
                {metric.label !== "Réaction moyenne" && (
                  <span className="text-sm text-muted-foreground">/ {metric.max}%</span>
                )}
              </div>
              <Progress 
                value={metric.label === "Réaction moyenne" ? 100 - (metric.value / metric.max * 100) : (metric.value / metric.max * 100)} 
                className="w-full"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé des performances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistiques globales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Progression générale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">+12%</p>
              <p className="text-sm text-muted-foreground">Amélioration ce mois</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Points forts</span>
                <div className="flex space-x-1">
                  <Badge variant="outline" className="bg-green-50">Travail d'équipe</Badge>
                  <Badge variant="outline" className="bg-green-50">Game Sense</Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">À améliorer</span>
                <div className="flex space-x-1">
                  <Badge variant="outline" className="bg-orange-50">Consistance</Badge>
                  <Badge variant="outline" className="bg-orange-50">Aim</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objectifs en cours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Objectifs en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Précision aim</span>
                  <span>67/70%</span>
                </div>
                <Progress value={95.7} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Temps de réaction</span>
                  <span>180/160ms</span>
                </div>
                <Progress value={88.8} className="w-full" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consistance</span>
                  <span>71/80%</span>
                </div>
                <Progress value={88.75} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accomplissements récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Accomplissements récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex-shrink-0">
                  {getAchievementIcon(achievement.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getAchievementTypeLabel(achievement.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(achievement.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conseils d'amélioration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Conseils d'amélioration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Focus sur l'aim training
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Consacrez 30 minutes par jour à l'aim training pour améliorer votre précision de 67% à 70%.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Travail de consistance
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Analysez vos VODs pour identifier les patterns dans vos performances inconsistantes.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Communication avancée
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Votre travail d'équipe est excellent. Continuez à développer vos call stratégiques.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                Adaptation rapide
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Travaillez l'adaptation à différents styles de jeu en scrimmant contre des équipes variées.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};