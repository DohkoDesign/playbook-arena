import { useState, useEffect } from "react";
import { startOfWeek, format, addWeeks, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  photo_profil?: string;
}

interface PlayerInfo {
  id: string;
  pseudo: string;
  photo_profil?: string;
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

const getWeekStart = (date: Date = new Date()) => {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return monday.toISOString().split('T')[0];
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

  // Rafraîchir quand le modal se ferme
  useEffect(() => {
    if (!showAvailabilityModal) {
      fetchData();
    }
  }, [showAvailabilityModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les membres de l'équipe
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("user_id, role")
        .eq("team_id", teamId)
        .in("role", ["joueur", "remplacant", "capitaine", "owner"]);

      if (membersError) {
        throw membersError;
      }

      // Récupérer les profils des joueurs
      const userIds = teamMembers?.map(m => m.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, pseudo, photo_profil")
        .in("user_id", userIds);

      if (profilesError) {
        throw profilesError;
      }

      const playersData: PlayerInfo[] = teamMembers?.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        return {
          id: member.user_id,
          pseudo: profile?.pseudo || "Joueur",
          photo_profil: profile?.photo_profil
        };
      }) || [];

      setPlayers(playersData);

      // Récupérer les disponibilités de la semaine
      const weekStart = getWeekStart(selectedWeek);
      const { data: availabilitiesData, error: availabilitiesError } = await supabase
        .from("player_availabilities")
        .select("*")
        .eq("team_id", teamId)
        .eq("week_start", weekStart);

      if (availabilitiesError) {
        throw availabilitiesError;
      }

      // Enrichir avec les infos des joueurs
      const enrichedAvailabilities = availabilitiesData?.map(avail => {
        const player = playersData.find(p => p.id === avail.user_id);
        return {
          ...avail,
          pseudo: player?.pseudo || "Joueur",
          photo_profil: player?.photo_profil
        };
      }) || [];

      setAvailabilities(enrichedAvailabilities);

    } catch (error: any) {
      console.error("Erreur chargement disponibilités:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les disponibilités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedByPlayer = availabilities.reduce((acc, avail) => {
    const key = avail.user_id;
    if (!acc[key]) {
      acc[key] = {
        pseudo: avail.pseudo || "Joueur",
        photo_profil: avail.photo_profil,
        availabilities: []
      };
    }
    acc[key].availabilities.push(avail);
    return acc;
  }, {} as Record<string, { pseudo: string; photo_profil?: string; availabilities: PlayerAvailability[] }>);

  const formatTime = (time: string) => time.slice(0, 5);

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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Disponibilités de l'équipe</h2>
        <Button onClick={() => setShowAvailabilityModal(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Mes disponibilités
        </Button>
      </div>

      {/* Sélecteur de semaine simplifié */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            
            <div className="text-center">
              <p className="font-semibold">{getWeekRange()}</p>
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
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disponibilités par joueur */}
      {Object.keys(groupedByPlayer).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune disponibilité</h3>
            <p className="text-muted-foreground">
              Aucune disponibilité n'a été renseignée pour cette semaine.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(groupedByPlayer).map(([playerId, playerData]) => (
            <Card key={playerId}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={playerData.photo_profil} alt={playerData.pseudo} />
                    <AvatarFallback className="text-sm">
                      {playerData.pseudo.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold">{playerData.pseudo}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {playerData.availabilities.length} créneaux
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
                    const dayAvailabilities = playerData.availabilities
                      .filter(avail => avail.day_of_week === dayOfWeek)
                      .sort((a, b) => a.start_time.localeCompare(b.start_time));
                    
                    if (dayAvailabilities.length === 0) return null;
                    
                    return (
                      <div key={dayOfWeek} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="font-medium text-sm min-w-[80px]">
                          {dayNames[dayOfWeek as keyof typeof dayNames]}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {dayAvailabilities.map((availability) => (
                            <Badge 
                              key={availability.id}
                              variant="outline"
                              className="text-xs px-2 py-1"
                            >
                              {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal pour gérer ses propres disponibilités */}
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