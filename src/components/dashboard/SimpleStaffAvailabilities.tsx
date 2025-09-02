import { useState, useEffect } from "react";
import { startOfWeek, format, addWeeks, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  XCircle,
  ChevronLeft,
  ChevronRight
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

// Utiliser la même fonction que côté joueur pour le calcul de semaine
const getWeekStart = (date: Date = new Date()) => {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return monday.toISOString().split('T')[0];
};

export const SimpleStaffAvailabilities = ({ teamId }: SimpleStaffAvailabilitiesProps) => {
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [teamId, selectedWeek]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log("🔍 Fetching staff availabilities data for team:", teamId);
      
      // Récupérer tous les joueurs de l'équipe
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("user_id, role")
        .eq("team_id", teamId)
        .in("role", ["joueur", "remplacant", "capitaine"]);

      if (membersError) {
        console.error("❌ Team members error:", membersError);
        throw membersError;
      }

      // Récupérer les profils des joueurs séparément
      const userIds = teamMembers?.map(m => m.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, pseudo, photo_profil")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("❌ Profiles error:", profilesError);
        throw profilesError;
      }

      // Récupérer la semaine sélectionnée avec la même logique que côté joueur
      const weekStart = getWeekStart(selectedWeek);
      
      console.log("📅 Week start calculated with startOfWeek:", weekStart);

      const { data: availabilitiesData, error: availabilitiesError } = await supabase
        .from("player_availabilities")
        .select("*")
        .eq("team_id", teamId)
        .eq("week_start", weekStart);

      if (availabilitiesError) {
        console.error("❌ Availabilities error:", availabilitiesError);
        throw availabilitiesError;
      }

      console.log("📊 Raw availabilities data:", availabilitiesData);
      console.log("📊 Availabilities count:", availabilitiesData?.length || 0);

      // Créer le résumé par joueur
      const playerSummaries: PlayerSummary[] = teamMembers?.map(member => {
        const playerProfile = profiles?.find(p => p.user_id === member.user_id);
        const playerAvailabilities = availabilitiesData?.filter(avail => 
          avail.user_id === member.user_id
        ) || [];

        const availableDays = [...new Set(playerAvailabilities.map(avail => avail.day_of_week))];

        return {
          id: member.user_id,
          pseudo: playerProfile?.pseudo || "Joueur",
          photo_profil: playerProfile?.photo_profil,
          totalSlots: playerAvailabilities.length,
          availableDays,
          slots: playerAvailabilities.map(avail => ({
            ...avail,
            pseudo: playerProfile?.pseudo || "Joueur",
            photo_profil: playerProfile?.photo_profil
          }))
        };
      }) || [];

      console.log("📊 Player summaries:", playerSummaries);

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
              <Calendar className="w-5 h-5 text-primary" />
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

      {/* Liste des joueurs - horizontal sans scroll */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Joueurs de l'équipe</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {players.map(player => (
            <Card key={player.id} className="flex-shrink-0 w-64">
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
                  {player.totalSlots === 0 ? (
                    <div className="text-center py-2">
                      <XCircle className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">Aucune disponibilité</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {[1, 2, 3, 4, 5, 6, 0].map(day => {
                        const daySlots = player.slots.filter(slot => slot.day_of_week === day);
                        if (daySlots.length === 0) return null;
                        
                        return (
                          <div key={day} className="text-xs">
                            <div className="font-medium text-muted-foreground mb-1">
                              {dayShort[day]}
                            </div>
                            <div className="space-y-1 ml-2">
                              {daySlots.map((slot, index) => (
                                <div key={index} className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-primary" />
                                  <span className="text-primary">
                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};