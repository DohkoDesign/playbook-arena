import { useState, useEffect } from "react";
import { startOfWeek, format, addWeeks, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Search,
  TrendingUp,
  Target,
  Zap,
  Grid3X3,
  BarChart3,
  Filter,
  Star,
  AlertCircle
} from "lucide-react";
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

const DAYS_CONFIG = {
  1: { name: 'Lundi', short: 'Lun', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
  2: { name: 'Mardi', short: 'Mar', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  3: { name: 'Mercredi', short: 'Mer', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  4: { name: 'Jeudi', short: 'Jeu', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700' },
  5: { name: 'Vendredi', short: 'Ven', color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700' },
  6: { name: 'Samedi', short: 'Sam', color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  0: { name: 'Dimanche', short: 'Dim', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700' }
};

const TIME_SLOTS = {
  morning: { label: 'Matin', range: '8h-12h', start: '08:00', end: '12:00', icon: '🌅', color: 'from-yellow-400 to-orange-400' },
  afternoon: { label: 'Après-midi', range: '14h-18h', start: '14:00', end: '18:00', icon: '☀️', color: 'from-orange-400 to-red-400' },
  evening: { label: 'Soirée', range: '19h-23h', start: '19:00', end: '23:00', icon: '🌙', color: 'from-indigo-400 to-purple-400' }
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
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'analysis'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
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
    const searchMatch = searchQuery === '' || (avail.pseudo?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const timeSlotMatch = selectedTimeSlot === 'all' || getTimeSlot(avail.start_time) === selectedTimeSlot;
    return playerMatch && dayMatch && searchMatch && timeSlotMatch;
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

  const getTimeSlot = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 19 && hour < 24) return 'evening';
    return 'morning';
  };

  const getOptimalSlots = () => {
    const slotCounts: Record<string, Record<number, number>> = {};
    
    // Compter les disponibilités par créneau et jour
    availabilities.forEach(avail => {
      const slot = getTimeSlot(avail.start_time);
      if (!slotCounts[slot]) slotCounts[slot] = {};
      slotCounts[slot][avail.day_of_week] = (slotCounts[slot][avail.day_of_week] || 0) + 1;
    });

    // Trouver les meilleurs créneaux
    const suggestions = [];
    for (const [slot, days] of Object.entries(slotCounts)) {
      for (const [day, count] of Object.entries(days)) {
        if (count >= Math.ceil(players.length * 0.6)) { // 60% minimum
          suggestions.push({
            day: parseInt(day),
            slot,
            count,
            percentage: Math.round((count / players.length) * 100)
          });
        }
      }
    }

    return suggestions.sort((a, b) => b.count - a.count).slice(0, 3);
  };

  const getTeamCoverage = () => {
    const totalPossibleSlots = players.length * 7; // 7 jours par semaine
    const actualSlots = availabilities.length;
    return Math.round((actualSlots / totalPossibleSlots) * 100);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
  };

  const getWeekRange = () => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return `${format(start, 'dd MMM', { locale: fr })} - ${format(end, 'dd MMM yyyy', { locale: fr })}`;
  };

  const optimalSlots = getOptimalSlots();
  const teamCoverage = getTeamCoverage();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-lg w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gradient-to-br from-muted to-muted-foreground/10 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-r from-muted via-muted-foreground/5 to-mused rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header avec gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-foreground/10 to-accent rounded-2xl p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-r from-background/10 to-transparent backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-background/20 rounded-xl backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Disponibilités de l'équipe</h1>
                <p className="opacity-90">Visualisez et analysez les créneaux d'entraînement</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAvailabilityModal(true)}
              className="bg-background/20 hover:bg-background/30 text-primary-foreground border-background/30 backdrop-blur-sm"
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Mes disponibilités
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-background/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Couverture équipe</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl font-bold">{teamCoverage}%</span>
                <Progress value={teamCoverage} className="flex-1 h-2" />
              </div>
            </div>
            
            <div className="bg-background/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">Joueurs actifs</span>
              </div>
              <div className="text-2xl font-bold mt-1">{Object.keys(groupedByPlayer).length}/{players.length}</div>
            </div>
            
            <div className="bg-background/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Créneaux optimaux</span>
              </div>
              <div className="text-2xl font-bold mt-1">{optimalSlots.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation semaine moderne */}
      <Card className="bg-gradient-to-r from-background to-muted/30 border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="h-12 w-12 rounded-full hover:bg-primary/10 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-lg">{getWeekRange()}</div>
                  <Badge variant="outline" className="mt-1">
                    {selectedWeek < new Date() ? '📅 Passée' : 
                     format(selectedWeek, 'yyyy') === format(new Date(), 'yyyy') && 
                     format(selectedWeek, 'w') === format(new Date(), 'w') ? '⭐ Courante' : '🔮 Future'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateWeek('next')}
              className="h-12 w-12 rounded-full hover:bg-primary/10 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles intelligents */}
      <div className="space-y-4">
        {/* Modes de vue */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger value="grid" className="flex items-center space-x-2">
              <Grid3X3 className="w-4 h-4" />
              <span>Grille</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analyse</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filtres avancés */}
        <Card className="bg-muted/20 border-dashed">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {/* Recherche */}
              <div className="flex items-center space-x-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un joueur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-background/50"
                />
              </div>

              {/* Filtre joueur */}
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger className="w-48 border-0 bg-background/50">
                    <SelectValue placeholder="Filtrer par joueur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🎯 Tous les joueurs</SelectItem>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        👤 {player.pseudo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre jour */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-48 border-0 bg-background/50">
                    <SelectValue placeholder="Filtrer par jour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📅 Tous les jours</SelectItem>
                    {Object.entries(DAYS_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        📍 {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre créneau */}
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <SelectTrigger className="w-48 border-0 bg-background/50">
                    <SelectValue placeholder="Filtrer par créneau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">⏰ Tous les créneaux</SelectItem>
                    {Object.entries(TIME_SLOTS).map(([key, slot]) => (
                      <SelectItem key={key} value={key}>
                        {slot.icon} {slot.label} ({slot.range})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions intelligentes */}
      {optimalSlots.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <Target className="w-5 h-5" />
              <span>🎯 Créneaux optimaux détectés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {optimalSlots.map((slot, index) => (
                <div key={`${slot.day}-${slot.slot}`} className="bg-white/60 dark:bg-background/60 rounded-lg p-3 border border-green-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-sm">{DAYS_CONFIG[slot.day as keyof typeof DAYS_CONFIG].name}</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{TIME_SLOTS[slot.slot as keyof typeof TIME_SLOTS].icon} {TIME_SLOTS[slot.slot as keyof typeof TIME_SLOTS].label}</span>
                      <span className="font-medium">{slot.percentage}%</span>
                    </div>
                    <Progress value={slot.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {slot.count}/{players.length} joueurs disponibles
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu principal avec modes de vue */}
      <Tabs value={viewMode} className="w-full">
        {Object.keys(groupedByPlayer).length === 0 ? (
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-dashed border-2">
            <CardContent className="p-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/60" />
                  <h3 className="text-xl font-semibold mb-3">Aucune disponibilité trouvée</h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {selectedPlayer !== 'all' || selectedDay !== 'all' || searchQuery || selectedTimeSlot !== 'all'
                      ? "🔍 Aucune disponibilité ne correspond aux filtres sélectionnés. Essayez d'ajuster vos critères de recherche."
                      : "📅 Aucune disponibilité n'a été renseignée pour cette semaine. Encouragez vos coéquipiers à partager leurs créneaux !"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Vue Grille */}
            <TabsContent value="grid" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(groupedByPlayer).map(([playerId, playerData]) => (
                  <Card key={playerId} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/20 border-primary/10 hover:border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                            {playerData.pseudo.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold">{playerData.pseudo}</h3>
                            <p className="text-sm text-muted-foreground">
                              {playerData.availabilities.length} créneau{playerData.availabilities.length > 1 ? 'x' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          {Math.round((playerData.availabilities.length / 7) * 100)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
                        const dayAvailabilities = playerData.availabilities.filter(
                          avail => avail.day_of_week === dayOfWeek
                        );
                        
                        if (dayAvailabilities.length === 0) return null;
                        
                        const dayConfig = DAYS_CONFIG[dayOfWeek as keyof typeof DAYS_CONFIG];
                        
                        return (
                          <div key={dayOfWeek} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-background to-muted/30 border border-primary/5">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${dayConfig.color}`}></div>
                              <span className="font-medium text-sm">{dayConfig.short}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {dayAvailabilities
                                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                .map((availability) => {
                                  const slot = getTimeSlot(availability.start_time);
                                  const timeSlotConfig = TIME_SLOTS[slot as keyof typeof TIME_SLOTS];
                                  return (
                                    <Badge 
                                      key={availability.id}
                                      variant="outline"
                                      className={`text-xs px-2 py-1 bg-gradient-to-r ${timeSlotConfig.color} text-white border-0`}
                                    >
                                      {formatTime(availability.start_time)}-{formatTime(availability.end_time)}
                                    </Badge>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Vue Timeline */}
            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Timeline hebdomadaire</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
                      const dayAvailabilities = filteredAvailabilities.filter(
                        avail => avail.day_of_week === dayOfWeek
                      );
                      
                      if (dayAvailabilities.length === 0) return null;
                      
                      const dayConfig = DAYS_CONFIG[dayOfWeek as keyof typeof DAYS_CONFIG];
                      const timeSlots = dayAvailabilities.reduce((acc, avail) => {
                        const hour = parseInt(avail.start_time.split(':')[0]);
                        if (!acc[hour]) acc[hour] = [];
                        acc[hour].push(avail);
                        return acc;
                      }, {} as Record<number, typeof dayAvailabilities>);
                      
                      return (
                        <div key={dayOfWeek} className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${dayConfig.color}`}></div>
                            <h3 className="text-lg font-semibold">{dayConfig.name}</h3>
                            <Badge variant="outline">{dayAvailabilities.length} créneaux</Badge>
                          </div>
                          
                          <div className="ml-6 space-y-2">
                            {Object.entries(timeSlots)
                              .sort(([a], [b]) => parseInt(a) - parseInt(b))
                              .map(([hour, slots]) => (
                                <div key={hour} className="flex items-center space-x-4">
                                  <div className="w-16 text-sm font-mono text-muted-foreground">
                                    {hour.padStart(2, '0')}:00
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {slots.map(slot => (
                                      <div 
                                        key={slot.id}
                                        className="flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-1 rounded-full border border-primary/20"
                                      >
                                        <span className="text-sm font-medium">{slot.pseudo}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {formatTime(slot.start_time)}-{formatTime(slot.end_time)}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vue Analyse */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analyse par créneaux */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Analyse par créneaux</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(TIME_SLOTS).map(([key, slot]) => {
                      const slotAvailabilities = filteredAvailabilities.filter(avail => 
                        getTimeSlot(avail.start_time) === key
                      );
                      const percentage = Math.round((slotAvailabilities.length / filteredAvailabilities.length) * 100) || 0;
                      
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{slot.icon}</span>
                              <span className="font-medium">{slot.label}</span>
                              <Badge variant="outline">{slot.range}</Badge>
                            </div>
                            <span className="font-bold">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-3" />
                          <div className="text-sm text-muted-foreground">
                            {slotAvailabilities.length} créneaux disponibles
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Analyse par jour */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Couverture par jour</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
                      const dayAvailabilities = filteredAvailabilities.filter(
                        avail => avail.day_of_week === dayOfWeek
                      );
                      const uniquePlayers = new Set(dayAvailabilities.map(a => a.user_id)).size;
                      const percentage = Math.round((uniquePlayers / players.length) * 100) || 0;
                      const dayConfig = DAYS_CONFIG[dayOfWeek as keyof typeof DAYS_CONFIG];
                      
                      return (
                        <div key={dayOfWeek} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${dayConfig.color}`}></div>
                              <span className="font-medium">{dayConfig.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold">{percentage}%</span>
                              <div className="text-xs text-muted-foreground">
                                {uniquePlayers}/{players.length} joueurs
                              </div>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-3" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Modal moderne pour gérer ses disponibilités */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-muted/30">
          <DialogHeader className="pb-4 border-b border-primary/10">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span>Gérer mes disponibilités</span>
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Configurez vos créneaux pour optimiser les entraînements d'équipe
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <SimpleAvailabilityManager 
              teamId={teamId} 
              playerId={playerId} 
              onSaveSuccess={() => {
                setShowAvailabilityModal(false);
                fetchData();
                toast({
                  title: "✅ Succès",
                  description: "Vos disponibilités ont été mises à jour avec succès !",
                });
              }}
            />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-primary/10">
            <div className="text-sm text-muted-foreground">
              💡 Astuce : Plus vous renseignez de créneaux, plus il sera facile de planifier des entraînements
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowAvailabilityModal(false)}
              className="min-w-24"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};