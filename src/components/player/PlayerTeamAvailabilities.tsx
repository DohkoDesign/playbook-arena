import { useState, useEffect } from "react";
import { startOfWeek, format, addWeeks, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Users, User, Settings, ChevronLeft, ChevronRight } from "lucide-react";
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

// Utiliser la même fonction que dans SimpleAvailabilityManager
const getWeekStart = (date: Date = new Date()) => {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return monday.toISOString().split('T')[0];
};

export const PlayerTeamAvailabilities = ({ teamId, playerId }: PlayerTeamAvailabilitiesProps) => {
  const [availabilities, setAvailabilities] = useState<PlayerAvailability[]>([]);
  const [players, setPlayers] = useState<{id: string, pseudo: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [teamId, selectedWeek]);

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

      // Récupérer les disponibilités de la semaine sélectionnée avec la même logique
      const weekStart = getWeekStart(selectedWeek);

      console.log("📅 Week start (synchronized):", weekStart);

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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
  };

  const getWeekRange = () => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return `${format(start, 'dd MMM', { locale: fr })} - ${format(end, 'dd MMM yyyy', { locale: fr })}`;
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

      {/* Sélecteur de semaine */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-muted/30 rounded-lg">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigateWeek('prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="text-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Semaine du {getWeekRange()}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedWeek < new Date() ? 'Semaine passée' : 
             format(selectedWeek, 'yyyy') === format(new Date(), 'yyyy') && 
             format(selectedWeek, 'w') === format(new Date(), 'w') ? 'Semaine courante' : 'Semaine future'}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigateWeek('next')}
        >
          <ChevronRight className="w-4 h-4" />
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

      {/* Vue compacte des disponibilités */}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Vue d'ensemble des disponibilités</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Grille compacte des joueurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(groupedByPlayer).map(([playerId, playerData]) => (
                <div key={playerId} className="border rounded-lg p-4 space-y-3">
                  {/* En-tête joueur */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-sm">{playerData.pseudo}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {playerData.availabilities.length}
                    </Badge>
                  </div>
                  
                  {/* Disponibilités par jour */}
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
                      const dayAvailabilities = playerData.availabilities.filter(
                        avail => avail.day_of_week === dayOfWeek
                      );
                      
                      if (dayAvailabilities.length === 0) return null;
                      
                      return (
                        <div key={dayOfWeek} className="flex items-center justify-between text-xs">
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 ${getDayColor(dayOfWeek)}`}
                          >
                            {dayNames[dayOfWeek as keyof typeof dayNames].slice(0, 3)}
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {dayAvailabilities
                              .sort((a, b) => a.start_time.localeCompare(b.start_time))
                              .map((availability) => (
                                <span 
                                  key={availability.id}
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                >
                                  {formatTime(availability.start_time)}-{formatTime(availability.end_time)}
                                </span>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Vue détaillée par créneaux horaires */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Disponibilités par créneaux</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Matin */}
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="font-medium">Matin (9h-12h)</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(groupedByPlayer).map(([playerId, playerData]) => {
                      const morningSlots = playerData.availabilities.filter(avail => 
                        avail.start_time >= '09:00:00' && avail.start_time < '12:00:00'
                      );
                      if (morningSlots.length === 0) return null;
                      
                      return (
                        <div key={playerId} className="flex items-center justify-between text-sm">
                          <span>{playerData.pseudo}</span>
                          <div className="flex gap-1">
                            {morningSlots.map(slot => (
                              <Badge key={slot.id} variant="outline" className="text-xs">
                                {dayNames[slot.day_of_week as keyof typeof dayNames].slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Après-midi */}
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="font-medium">Après-midi (14h-18h)</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(groupedByPlayer).map(([playerId, playerData]) => {
                      const afternoonSlots = playerData.availabilities.filter(avail => 
                        avail.start_time >= '14:00:00' && avail.start_time < '18:00:00'
                      );
                      if (afternoonSlots.length === 0) return null;
                      
                      return (
                        <div key={playerId} className="flex items-center justify-between text-sm">
                          <span>{playerData.pseudo}</span>
                          <div className="flex gap-1">
                            {afternoonSlots.map(slot => (
                              <Badge key={slot.id} variant="outline" className="text-xs">
                                {dayNames[slot.day_of_week as keyof typeof dayNames].slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Soir */}
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="font-medium">Soir (19h-23h)</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(groupedByPlayer).map(([playerId, playerData]) => {
                      const eveningSlots = playerData.availabilities.filter(avail => 
                        avail.start_time >= '19:00:00' && avail.start_time < '23:00:00'
                      );
                      if (eveningSlots.length === 0) return null;
                      
                      return (
                        <div key={playerId} className="flex items-center justify-between text-sm">
                          <span>{playerData.pseudo}</span>
                          <div className="flex gap-1">
                            {eveningSlots.map(slot => (
                              <Badge key={slot.id} variant="outline" className="text-xs">
                                {dayNames[slot.day_of_week as keyof typeof dayNames].slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              toast({
                title: "Succès",
                description: "Vos disponibilités ont été mises à jour",
              });
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