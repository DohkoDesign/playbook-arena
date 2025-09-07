import { useState, useEffect } from "react";
import { startOfWeek, format, addWeeks, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, Settings, ChevronLeft, ChevronRight, Sun, Sunset, Moon, Coffee } from "lucide-react";
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
}

interface PlayerInfo {
  id: string;
  pseudo: string;
  photo_profil?: string;
}

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const shortDayNames = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

const getWeekStart = (date: Date = new Date()) => {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return monday.toISOString().split('T')[0];
};

const getTimeSlotIcon = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 6 && hour < 12) return <Sun className="w-3 h-3" />;
  if (hour >= 12 && hour < 18) return <Sunset className="w-3 h-3" />;
  if (hour >= 18 && hour < 22) return <Moon className="w-3 h-3" />;
  return <Coffee className="w-3 h-3" />;
};

const getTimeSlotColor = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 6 && hour < 12) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (hour >= 12 && hour < 18) return "bg-orange-100 text-orange-800 border-orange-200";
  if (hour >= 18 && hour < 22) return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-purple-100 text-purple-800 border-purple-200";
};

export const PlayerTeamAvailabilities = ({ teamId, playerId }: PlayerTeamAvailabilitiesProps) => {
  const [availabilities, setAvailabilities] = useState<PlayerAvailability[]>([]);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [teamId, selectedWeek]);

  useEffect(() => {
    if (!showAvailabilityModal) {
      fetchData();
    }
  }, [showAvailabilityModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les membres avec leurs profils
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("user_id, role")
        .eq("team_id", teamId)
        .in("role", ["joueur", "remplacant", "capitaine", "owner"]);

      if (membersError) throw membersError;

      // Récupérer les profils séparément
      const userIds = teamMembers?.map(m => m.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, pseudo, photo_profil")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const playersData: PlayerInfo[] = teamMembers?.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        return {
          id: member.user_id,
          pseudo: profile?.pseudo || "Joueur",
          photo_profil: profile?.photo_profil
        };
      }) || [];

      setPlayers(playersData);

      // Récupérer les disponibilités
      const weekStart = getWeekStart(selectedWeek);
      const { data: availabilitiesData, error: availabilitiesError } = await supabase
        .from("player_availabilities")
        .select("*")
        .eq("team_id", teamId)
        .eq("week_start", weekStart);

      if (availabilitiesError) throw availabilitiesError;
      setAvailabilities(availabilitiesData || []);

    } catch (error: any) {
      console.error("Erreur chargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les disponibilités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlayerAvailabilities = (playerId: string) => {
    return availabilities.filter(avail => avail.user_id === playerId);
  };

  const getPlayerInfo = (playerId: string) => {
    return players.find(p => p.id === playerId);
  };

  const formatTime = (time: string) => time.slice(0, 5);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
  };

  const getWeekRange = () => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return `${format(start, 'dd MMM', { locale: fr })} - ${format(end, 'dd MMM yyyy', { locale: fr })}`;
  };

  // Organiser les données pour l'affichage en calendrier
  const weekCalendarData = () => {
    const calendar: Record<number, Record<string, PlayerAvailability[]>> = {};
    
    // Initialiser pour chaque jour de la semaine (1-7, lundi-dimanche)
    for (let day = 1; day <= 7; day++) {
      calendar[day] = {};
      players.forEach(player => {
        calendar[day][player.id] = getPlayerAvailabilities(player.id)
          .filter(avail => avail.day_of_week === (day === 7 ? 0 : day))
          .sort((a, b) => a.start_time.localeCompare(b.start_time));
      });
    }
    
    return calendar;
  };

  const calendarData = weekCalendarData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Disponibilités de l'équipe</h2>
        </div>
        <Button onClick={() => setShowAvailabilityModal(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Mes disponibilités
        </Button>
      </div>

      {/* Navigation de semaine */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Semaine précédente
            </Button>
            
            <div className="text-center">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold text-lg">{getWeekRange()}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(selectedWeek, 'yyyy') === format(new Date(), 'yyyy') && 
                 Math.abs(selectedWeek.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000 
                 ? 'Semaine courante' 
                 : selectedWeek < new Date() ? 'Semaine passée' : 'Semaine future'}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              Semaine suivante
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vue calendrier */}
      {players.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun membre d'équipe</h3>
            <p className="text-muted-foreground">
              Il n'y a pas encore de membres dans cette équipe.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Planning hebdomadaire</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {players.length} membre{players.length > 1 ? 's' : ''} • {availabilities.length} créneaux
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Grille du calendrier */}
            <div className="grid grid-cols-8 gap-2 text-sm">
              {/* En-tête avec les jours */}
              <div className="font-semibold text-center p-2 bg-muted/30 rounded">
                Équipe
              </div>
              {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => (
                <div key={dayOfWeek} className="font-semibold text-center p-2 bg-muted/30 rounded">
                  <div>{dayNames[dayOfWeek === 0 ? 0 : dayOfWeek]}</div>
                  <div className="text-xs text-muted-foreground">{shortDayNames[dayOfWeek === 0 ? 0 : dayOfWeek]}</div>
                </div>
              ))}
              
              {/* Lignes pour chaque joueur - TOUS les joueurs de l'équipe */}
              {players.map(player => {
                const playerAvailabilities = getPlayerAvailabilities(player.id);
                
                return (
                  <div key={player.id} className="contents">
                    {/* Colonne du joueur */}
                    <div className="p-3 border rounded-lg bg-card">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={player.photo_profil} alt={player.pseudo} />
                          <AvatarFallback className="text-xs">
                            {player.pseudo.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm leading-tight">{player.pseudo}</p>
                          <p className="text-xs text-muted-foreground">
                            {playerAvailabilities.length > 0 
                              ? `${playerAvailabilities.length} créneaux`
                              : "Aucune dispo"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Colonnes pour chaque jour */}
                    {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
                      const dayAvails = playerAvailabilities
                        .filter(avail => avail.day_of_week === dayOfWeek)
                        .sort((a, b) => a.start_time.localeCompare(b.start_time));
                      
                      return (
                        <div key={`${player.id}-${dayOfWeek}`} className="p-2 border rounded-lg bg-card min-h-[80px]">
                          <div className="space-y-1">
                            {dayAvails.length === 0 ? (
                              <div className="text-xs text-muted-foreground text-center py-2 italic">
                                Non renseigné
                              </div>
                            ) : (
                              dayAvails.map((avail) => (
                                <div 
                                  key={avail.id}
                                  className={`text-xs px-2 py-1 rounded border ${getTimeSlotColor(avail.start_time)}`}
                                >
                                  <div className="flex items-center space-x-1">
                                    {getTimeSlotIcon(avail.start_time)}
                                    <span className="font-medium">
                                      {formatTime(avail.start_time)}-{formatTime(avail.end_time)}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Légende des créneaux */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-yellow-600" />
              <span>Matin (6h-12h)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sunset className="w-4 h-4 text-orange-600" />
              <span>Après-midi (12h-18h)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Moon className="w-4 h-4 text-blue-600" />
              <span>Soirée (18h-22h)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Coffee className="w-4 h-4 text-purple-600" />
              <span>Nuit (22h-6h)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal pour gérer ses disponibilités */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gérer mes disponibilités</DialogTitle>
          </DialogHeader>
          <SimpleAvailabilityManager 
            teamId={teamId}
            playerId={playerId}
            onSaveSuccess={fetchData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};