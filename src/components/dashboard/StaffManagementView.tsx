import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  FileText, 
  Trophy, 
  Calendar,
  UserPlus,
  Mail,
  Shield,
  BarChart3,
  Download,
  Upload,
  Clock,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StaffManagementViewProps {
  teamId: string;
}

export const StaffManagementView = ({ teamId }: StaffManagementViewProps) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [coachingSessions, setCoachingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchAllData();
    }
  }, [teamId]);

  const fetchAllData = async () => {
    try {
      // Récupérer les membres de l'équipe
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select(`
          *,
          profiles (
            pseudo,
            photo_profil
          )
        `)
        .eq("team_id", teamId);

      if (membersError) throw membersError;

      // Récupérer tous les événements
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .order("date_debut", { ascending: false });

      if (eventsError) throw eventsError;

      // Récupérer toutes les stratégies
      const { data: strategiesData, error: strategiesError } = await supabase
        .from("strategies")
        .select("*")
        .eq("team_id", teamId);

      if (strategiesError) throw strategiesError;

      // Récupérer les sessions de coaching
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("coaching_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      setTeamMembers(membersData || []);
      setEvents(eventsData || []);
      setStrategies(strategiesData || []);
      setCoachingSessions(sessionsData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de gestion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      totalMembers: teamMembers.length,
      totalEvents: events.length,
      eventsThisWeek: events.filter(e => new Date(e.created_at) > weekAgo).length,
      eventsThisMonth: events.filter(e => new Date(e.created_at) > monthAgo).length,
      totalStrategies: strategies.length,
      totalCoachingSessions: coachingSessions.length,
      coachingSessionsThisMonth: coachingSessions.filter(s => new Date(s.created_at) > monthAgo).length
    };
  };

  const exportTeamData = async () => {
    try {
      const data = {
        teamMembers,
        events,
        strategies,
        coachingSessions,
        exportDate: new Date().toISOString(),
        stats: getActivityStats()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `team-data-${teamId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Les données de l'équipe ont été exportées",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  };

  const stats = getActivityStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement du panneau de gestion...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Gestion Staff</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Inviter
          </Button>
          <Button variant="outline" onClick={exportTeamData}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowReportModal(true)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapports
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Membres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Événements</p>
                <p className="text-xs text-muted-foreground">+{stats.eventsThisWeek} cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalStrategies}</p>
                <p className="text-sm text-muted-foreground">Stratégies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCoachingSessions}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-xs text-muted-foreground">+{stats.coachingSessionsThisMonth} ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des membres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        {member.profiles?.pseudo?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{member.profiles?.pseudo || "Utilisateur"}</p>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border-l-4 border-l-blue-500 bg-muted/30 rounded">
                    <div>
                      <p className="font-medium">{event.titre}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.type} - {new Date(event.date_debut).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge variant={event.type === "match" ? "default" : "outline"}>
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Stratégies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {strategies.slice(0, 5).map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{strategy.nom}</p>
                        <p className="text-xs text-muted-foreground">{strategy.type}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions de coaching</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {coachingSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Session d'analyse</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Trophy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'équipe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowBulkActionModal(true)} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Actions en lot
              </Button>
              
              <Button variant="outline" onClick={exportTeamData} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exporter toutes les données
              </Button>
              
              <Button variant="destructive" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres avancés
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal d'invitation */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un nouveau membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="email@exemple.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joueur">Joueur</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="analyste">Analyste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message personnalisé (optionnel)</Label>
              <Textarea id="message" placeholder="Rejoins notre équipe !" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                Annuler
              </Button>
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Envoyer l'invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de rapports */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Rapports et Analytics</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{stats.eventsThisMonth}</p>
                  <p className="text-sm text-muted-foreground">Événements ce mois</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{stats.coachingSessionsThisMonth}</p>
                  <p className="text-sm text-muted-foreground">Sessions ce mois</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{stats.totalStrategies}</p>
                  <p className="text-sm text-muted-foreground">Stratégies total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Membres actifs</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReportModal(false)}>
                Fermer
              </Button>
              <Button onClick={exportTeamData}>
                <Download className="w-4 h-4 mr-2" />
                Exporter le rapport
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};