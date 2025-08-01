import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StaffAvailabilitiesViewProps {
  teamId: string;
}

interface PlayerAvailability {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  week_start: string;
  pseudo?: string;
}

const dayNames = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  0: 'Dimanche'
};

export const StaffAvailabilitiesView = ({ teamId }: StaffAvailabilitiesViewProps) => {
  const [availabilities, setAvailabilities] = useState<PlayerAvailability[]>([]);
  const [players, setPlayers] = useState<{id: string, pseudo: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les joueurs de l'équipe
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      // Récupérer les profils pour avoir les pseudos
      const playersList = [];
      for (const member of teamMembers) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('pseudo')
          .eq('user_id', member.user_id)
          .single();
        
        playersList.push({
          id: member.user_id,
          pseudo: profile?.pseudo || 'Joueur inconnu'
        });
      }
      
      setPlayers(playersList);

      // Récupérer toutes les disponibilités de l'équipe
      const { data: availabilitiesData, error: availError } = await supabase
        .from('player_availabilities')
        .select('*')
        .eq('team_id', teamId)
        .order('day_of_week')
        .order('start_time');

      if (availError) throw availError;

      // Enrichir avec les pseudos
      const enrichedAvailabilities = availabilitiesData.map(avail => ({
        ...avail,
        pseudo: playersList.find(p => p.id === avail.user_id)?.pseudo || 'Joueur inconnu'
      }));

      setAvailabilities(enrichedAvailabilities);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les disponibilités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailabilities = availabilities.filter(avail => {
    const playerMatch = selectedPlayer === 'all' || avail.user_id === selectedPlayer;
    const dayMatch = selectedDay === 'all' || avail.day_of_week.toString() === selectedDay;
    return playerMatch && dayMatch;
  });

  const getAvailabilityStats = () => {
    const totalPlayers = players.length;
    const playersWithAvailabilities = new Set(availabilities.map(a => a.user_id)).size;
    return { totalPlayers, playersWithAvailabilities };
  };

  const getPlayerAvailabilityCount = (playerId: string) => {
    return availabilities.filter(a => a.user_id === playerId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-primary rounded-lg mx-auto animate-pulse"></div>
          <p>Chargement des disponibilités...</p>
        </div>
      </div>
    );
  }

  const stats = getAvailabilityStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Disponibilités des Joueurs</h2>
          <p className="text-muted-foreground">
            Consultez les créneaux de disponibilité de votre équipe
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Joueurs total</p>
                <p className="text-2xl font-bold">{stats.totalPlayers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avec disponibilités</p>
                <p className="text-2xl font-bold">{stats.playersWithAvailabilities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Créneaux total</p>
                <p className="text-2xl font-bold">{availabilities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Joueur</label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les joueurs</SelectItem>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.pseudo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jour</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les jours</SelectItem>
                  {Object.entries(dayNames).map(([day, name]) => (
                    <SelectItem key={day} value={day}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vue d'ensemble des joueurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Vue d'ensemble par joueur</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => {
              const playerAvailabilities = availabilities.filter(a => a.user_id === player.id);
              const availabilityCount = playerAvailabilities.length;
              
              return (
                <div key={player.id} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{player.pseudo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {availabilityCount} créneau{availabilityCount > 1 ? 'x' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {availabilityCount === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Aucune disponibilité configurée
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {playerAvailabilities.slice(0, 3).map((avail, index) => (
                        <div key={index} className="text-xs bg-muted/50 p-2 rounded">
                          <span className="font-medium">{dayNames[avail.day_of_week as keyof typeof dayNames]}</span>
                          <span className="ml-2">{avail.start_time} - {avail.end_time}</span>
                        </div>
                      ))}
                      {availabilityCount > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{availabilityCount - 3} autre{availabilityCount - 3 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liste détaillée des disponibilités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Disponibilités détaillées ({filteredAvailabilities.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAvailabilities.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune disponibilité trouvée</h3>
              <p className="text-muted-foreground">
                {selectedPlayer !== 'all' || selectedDay !== 'all' 
                  ? "Aucune disponibilité ne correspond aux filtres sélectionnés."
                  : "Aucune disponibilité n'a encore été configurée par votre équipe."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(
                filteredAvailabilities.reduce((acc, avail) => {
                  const dayName = dayNames[avail.day_of_week as keyof typeof dayNames];
                  if (!acc[dayName]) acc[dayName] = [];
                  acc[dayName].push(avail);
                  return acc;
                }, {} as Record<string, PlayerAvailability[]>)
              ).map(([dayName, dayAvailabilities]) => (
                <div key={dayName} className="border rounded-lg">
                  <div className="bg-muted/20 p-3 border-b">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{dayName}</span>
                      <Badge variant="secondary">{dayAvailabilities.length}</Badge>
                    </h4>
                  </div>
                  <div className="p-3 space-y-2">
                    {dayAvailabilities.map((avail, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background border rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{avail.pseudo}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{avail.start_time} - {avail.end_time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};