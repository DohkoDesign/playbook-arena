import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Users, User, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SimpleAvailabilityManager } from "./SimpleAvailabilityManager";

interface PlayerTeamAvailabilitiesProps {
  teamId: string;
  playerId: string;
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

export const PlayerTeamAvailabilities = ({ teamId, playerId }: PlayerTeamAvailabilitiesProps) => {
  const [availabilities, setAvailabilities] = useState<PlayerAvailability[]>([]);
  const [players, setPlayers] = useState<{id: string, pseudo: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log("🔍 Fetching team availabilities for player view");
      
      // Récupérer tous les joueurs de l'équipe
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("user_id, role")
        .eq("team_id", teamId)
        .in("role", ["joueur", "remplacant", "capitaine", "owner"]);

      if (membersError) {
        console.error("❌ Error fetching team members:", membersError);
        throw membersError;
      }

      // Récupérer les profils des joueurs séparément
      const userIds = teamMembers?.map(m => m.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, pseudo")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("❌ Error fetching profiles:", profilesError);
        throw profilesError;
      }

      const playersData = teamMembers?.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        return {
          id: member.user_id,
          pseudo: profile?.pseudo || "Joueur inconnu"
        };
      }) || [];

      setPlayers(playersData);
      console.log("✅ Players loaded:", playersData.length);

      // Récupérer les disponibilités de la semaine courante
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      const weekStart = startOfWeek.toISOString().split('T')[0];

      console.log("📅 Week start:", weekStart);

      const { data: availabilitiesData, error: availabilitiesError } = await supabase
        .from("player_availabilities")
        .select("*")
        .eq("team_id", teamId)
        .eq("week_start", weekStart);

      if (availabilitiesError) {
        console.error("❌ Error fetching availabilities:", availabilitiesError);
        throw availabilitiesError;
      }

      // Enrichir avec les pseudos
      const enrichedAvailabilities = availabilitiesData?.map(avail => {
        const player = playersData.find(p => p.id === avail.user_id);
        return {
          ...avail,
          pseudo: player?.pseudo || "Joueur inconnu"
        };
      }) || [];

      setAvailabilities(enrichedAvailabilities);
      console.log("✅ Availabilities loaded:", enrichedAvailabilities.length);

    } catch (error: any) {
      console.error("❌ Error loading team availabilities:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les disponibilités de l'équipe",
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

  const groupedByPlayer = filteredAvailabilities.reduce((acc, avail) => {
    const key = avail.user_id;
    if (!acc[key]) {
      acc[key] = {
        pseudo: avail.pseudo || "Joueur inconnu",
        availabilities: []
      };
    }
    acc[key].availabilities.push(avail);
    return acc;
  }, {} as Record<string, { pseudo: string; availabilities: PlayerAvailability[] }>);

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getDayColor = (dayOfWeek: number) => {
    const colors = {
      1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      2: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      3: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
      4: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      5: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      6: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      0: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[dayOfWeek as keyof typeof colors] || colors[1];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Disponibilités de l'équipe</h2>
        </div>
        <Button onClick={() => setShowAvailabilityModal(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Mes disponibilités
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par joueur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les joueurs</SelectItem>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.pseudo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par jour" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les jours</SelectItem>
              {Object.entries(dayNames).map(([value, name]) => (
                <SelectItem key={value} value={value}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Joueurs avec disponibilités</p>
                <p className="text-xl font-bold">{Object.keys(groupedByPlayer).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total créneaux</p>
                <p className="text-xl font-bold">{filteredAvailabilities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Semaine courante</p>
                <p className="text-xl font-bold">
                  {new Date().toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des disponibilités par joueur */}
      <div className="space-y-6">
        {Object.keys(groupedByPlayer).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucune disponibilité trouvée</h3>
              <p className="text-muted-foreground">
                {selectedPlayer !== 'all' || selectedDay !== 'all'
                  ? "Aucune disponibilité ne correspond aux filtres sélectionnés."
                  : "Aucune disponibilité n'a été renseignée pour cette semaine."}
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedByPlayer).map(([playerId, playerData]) => (
            <Card key={playerId}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{playerData.pseudo}</span>
                  <Badge variant="outline">
                    {playerData.availabilities.length} créneau{playerData.availabilities.length > 1 ? 'x' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playerData.availabilities
                    .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                    .map((availability) => (
                      <div 
                        key={availability.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge className={getDayColor(availability.day_of_week)}>
                            {dayNames[availability.day_of_week as keyof typeof dayNames]}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.floor(
                            (new Date(`1970-01-01T${availability.end_time}`).getTime() - 
                             new Date(`1970-01-01T${availability.start_time}`).getTime()) / 60000
                          )} min
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal pour gérer ses propres disponibilités */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle>Gérer mes disponibilités</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <SimpleAvailabilityManager 
              teamId={teamId} 
              playerId={playerId} 
              onSaveSuccess={() => {
                setShowAvailabilityModal(false);
                fetchData(); // Recharger les données après modification
              }}
            />
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAvailabilityModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};