import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Users, 
  User,
  Sun,
  Sunset,
  Moon,
  Filter,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SimpleStaffAvailabilitiesProps {
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
  photo_profil?: string;
}

interface PlayerSummary {
  id: string;
  pseudo: string;
  photo_profil?: string;
  totalSlots: number;
  availableDays: number[];
  slots: PlayerAvailability[];
}

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const dayShort = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

const getTimeSlotIcon = (start: string) => {
  const hour = parseInt(start.split(':')[0]);
  if (hour < 12) return Sun;
  if (hour < 18) return Sunset;
  return Moon;
};

const getTimeSlotLabel = (start: string) => {
  const hour = parseInt(start.split(':')[0]);
  if (hour < 12) return 'Matin';
  if (hour < 18) return 'Après-midi';
  return 'Soir';
};

export const SimpleStaffAvailabilities = ({ teamId }: SimpleStaffAvailabilitiesProps) => {
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log("🔍 Fetching staff availabilities data");
      
      // Récupérer tous les joueurs de l'équipe
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select(`
          user_id,
          profiles!inner(pseudo, photo_profil)
        `)
        .eq("team_id", teamId)
        .in("role", ["joueur", "remplacant", "capitaine"]);

      if (membersError) throw membersError;

      // Récupérer les disponibilités de la semaine courante
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      const weekStart = startOfWeek.toISOString().split('T')[0];

      const { data: availabilitiesData, error: availabilitiesError } = await supabase
        .from("player_availabilities")
        .select("*")
        .eq("team_id", teamId)
        .eq("week_start", weekStart);

      if (availabilitiesError) throw availabilitiesError;

      // Créer le résumé par joueur
      const playerSummaries: PlayerSummary[] = teamMembers?.map(member => {
        const playerAvailabilities = availabilitiesData?.filter(avail => 
          avail.user_id === member.user_id
        ) || [];

        const availableDays = [...new Set(playerAvailabilities.map(avail => avail.day_of_week))];

        return {
          id: member.user_id,
          pseudo: (member.profiles as any)?.pseudo || "Joueur",
          photo_profil: (member.profiles as any)?.photo_profil,
          totalSlots: playerAvailabilities.length,
          availableDays,
          slots: playerAvailabilities.map(avail => ({
            ...avail,
            pseudo: (member.profiles as any)?.pseudo || "Joueur",
            photo_profil: (member.profiles as any)?.photo_profil
          }))
        };
      }) || [];

      setPlayers(playerSummaries);

    } catch (error: any) {
      console.error("❌ Error loading staff availabilities:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les disponibilités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOverlapForDay = (day: number) => {
    const playersAvailableThisDay = players.filter(player => 
      player.availableDays.includes(day)
    );
    return playersAvailableThisDay.length;
  };

  const getPlayersForTimeSlot = (day: number, timeSlot: string) => {
    const [startHour] = timeSlot.split(':').map(Number);
    
    return players.filter(player => {
      return player.slots.some(slot => {
        if (slot.day_of_week !== day) return false;
        const slotStartHour = parseInt(slot.start_time.split(':')[0]);
        const slotEndHour = parseInt(slot.end_time.split(':')[0]);
        return startHour >= slotStartHour && startHour < slotEndHour;
      });
    });
  };

  const getDayColor = (day: number) => {
    const overlap = getOverlapForDay(day);
    if (overlap === 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (overlap < 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded"></div>
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
        <Badge variant="outline" className="text-sm">
          Semaine du {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
        </Badge>
      </div>

      {/* Vue d'ensemble rapide */}
      <div className="grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 0].map(day => (
          <Card 
            key={day} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDay === day ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedDay(selectedDay === day ? null : day)}
          >
            <CardContent className="p-3 text-center">
              <div className="text-sm font-bold">{dayShort[day]}</div>
              <Badge className={`text-xs mt-2 ${getDayColor(day)}`}>
                {getOverlapForDay(day)} joueur{getOverlapForDay(day) > 1 ? 's' : ''}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Joueurs avec disponibilités</p>
                <p className="text-xl font-bold">
                  {players.filter(p => p.totalSlots > 0).length}/{players.length}
                </p>
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
                <p className="text-xl font-bold">
                  {players.reduce((acc, p) => acc + p.totalSlots, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Meilleur jour</p>
                <p className="text-xl font-bold">
                  {dayShort[[1, 2, 3, 4, 5, 6, 0].reduce((best, day) => 
                    getOverlapForDay(day) > getOverlapForDay(best) ? day : best
                  )]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détail par jour sélectionné */}
      {selectedDay !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{dayNames[selectedDay]}</span>
              <Badge variant="outline">
                {getOverlapForDay(selectedDay)} joueur{getOverlapForDay(selectedDay) > 1 ? 's' : ''} disponible{getOverlapForDay(selectedDay) > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Créneaux horaires */}
              {['09:00', '14:00', '19:00'].map(timeSlot => {
                const availablePlayers = getPlayersForTimeSlot(selectedDay, timeSlot);
                const Icon = getTimeSlotIcon(timeSlot);
                
                return (
                  <div key={timeSlot} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{getTimeSlotLabel(timeSlot)}</span>
                        <span className="text-sm text-muted-foreground">({timeSlot})</span>
                      </div>
                      <Badge variant={availablePlayers.length > 0 ? "default" : "secondary"}>
                        {availablePlayers.length} joueur{availablePlayers.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {availablePlayers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availablePlayers.map(player => (
                          <div key={player.id} className="flex items-center space-x-2 bg-muted/30 rounded-lg p-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={player.photo_profil} />
                              <AvatarFallback className="text-xs">
                                {player.pseudo.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{player.pseudo}</span>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">Aucun joueur disponible</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des joueurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map(player => (
          <Card key={player.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={player.photo_profil} />
                  <AvatarFallback>
                    {player.pseudo.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{player.pseudo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {player.totalSlots} créneau{player.totalSlots > 1 ? 'x' : ''}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 4, 5, 6, 0].map(day => (
                    <Badge 
                      key={day}
                      variant={player.availableDays.includes(day) ? "default" : "outline"}
                      className="text-xs"
                    >
                      {dayShort[day]}
                    </Badge>
                  ))}
                </div>
                
                {player.totalSlots === 0 && (
                  <div className="text-center py-2">
                    <XCircle className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Aucune disponibilité</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};