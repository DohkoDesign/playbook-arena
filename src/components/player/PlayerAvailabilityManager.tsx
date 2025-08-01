import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Save,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlayerAvailabilityManagerProps {
  teamId: string;
  playerId: string;
}

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

const DAYS_CONFIG = {
  1: { name: "Lundi", key: "monday" },
  2: { name: "Mardi", key: "tuesday" },
  3: { name: "Mercredi", key: "wednesday" },
  4: { name: "Jeudi", key: "thursday" },
  5: { name: "Vendredi", key: "friday" },
  6: { name: "Samedi", key: "saturday" },
  0: { name: "Dimanche", key: "sunday" },
};

export const PlayerAvailabilityManager = ({ teamId, playerId }: PlayerAvailabilityManagerProps) => {
  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<number, DayAvailability>>({
    1: { enabled: false, slots: [] },
    2: { enabled: false, slots: [] },
    3: { enabled: false, slots: [] },
    4: { enabled: false, slots: [] },
    5: { enabled: false, slots: [] },
    6: { enabled: false, slots: [] },
    0: { enabled: false, slots: [] },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailabilities();
  }, [teamId, playerId]);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      
      console.log("🔍 Fetching availabilities for player:", playerId, "team:", teamId);
      
      const { data: availabilities, error } = await supabase
        .from('player_availabilities')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', playerId)
        .order('day_of_week')
        .order('start_time');

      console.log("📅 Fetched availabilities:", availabilities);

      if (error) {
        console.error("Error fetching availabilities:", error);
        throw error;
      }

      // Convertir les données de la DB en format de l'interface
      const newWeeklyAvailability = { ...weeklyAvailability };
      
      // Réinitialiser
      Object.keys(newWeeklyAvailability).forEach(day => {
        newWeeklyAvailability[parseInt(day)] = { enabled: false, slots: [] };
      });

      // Grouper par jour
      (availabilities || []).forEach(avail => {
        const dayOfWeek = avail.day_of_week;
        
        if (!newWeeklyAvailability[dayOfWeek].enabled) {
          newWeeklyAvailability[dayOfWeek].enabled = true;
          newWeeklyAvailability[dayOfWeek].slots = [];
        }
        
        newWeeklyAvailability[dayOfWeek].slots.push({
          id: avail.id,
          start: avail.start_time.substring(0, 5), // Format HH:MM
          end: avail.end_time.substring(0, 5),     // Format HH:MM
        });
      });

      setWeeklyAvailability(newWeeklyAvailability);
      
    } catch (error: any) {
      console.error('Error fetching availabilities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos disponibilités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDayEnabled = (dayOfWeek: number) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayOfWeek]: {
        enabled: !prev[dayOfWeek].enabled,
        slots: !prev[dayOfWeek].enabled ? [
          {
            id: `new-${Date.now()}`,
            start: '09:00',
            end: '18:00'
          }
        ] : []
      }
    }));
  };

  const addTimeSlot = (dayOfWeek: number) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        slots: [
          ...prev[dayOfWeek].slots,
          {
            id: `new-${Date.now()}`,
            start: '09:00',
            end: '18:00'
          }
        ]
      }
    }));
  };

  const removeTimeSlot = (dayOfWeek: number, slotId: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        slots: prev[dayOfWeek].slots.filter(slot => slot.id !== slotId)
      }
    }));
  };

  const updateTimeSlot = (dayOfWeek: number, slotId: string, field: 'start' | 'end', value: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        slots: prev[dayOfWeek].slots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const saveAvailabilities = async () => {
    try {
      setSaving(true);
      
      console.log("💾 Saving availabilities...");

      // Supprimer toutes les anciennes disponibilités
      const { error: deleteError } = await supabase
        .from('player_availabilities')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', playerId);

      if (deleteError) {
        console.error("Error deleting old availabilities:", deleteError);
        throw deleteError;
      }

      // Préparer les nouvelles données
      const availabilitiesToInsert = [];

      Object.entries(weeklyAvailability).forEach(([dayOfWeek, dayData]) => {
        if (dayData.enabled && dayData.slots.length > 0) {
          dayData.slots.forEach(slot => {
            // Valider les heures
            if (slot.start && slot.end && slot.start < slot.end) {
              availabilitiesToInsert.push({
                team_id: teamId,
                user_id: playerId,
                day_of_week: parseInt(dayOfWeek),
                start_time: slot.start + ':00', // Ajouter les secondes
                end_time: slot.end + ':00',     // Ajouter les secondes
                week_start: new Date().toISOString().split('T')[0] // Date actuelle
              });
            }
          });
        }
      });

      console.log("📝 Availabilities to insert:", availabilitiesToInsert);

      if (availabilitiesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('player_availabilities')
          .insert(availabilitiesToInsert);

        if (insertError) {
          console.error("Error inserting availabilities:", insertError);
          throw insertError;
        }
      }

      toast({
        title: "Succès",
        description: "Vos disponibilités ont été sauvegardées",
      });

      // Recharger les données
      await fetchAvailabilities();

    } catch (error: any) {
      console.error('Error saving availabilities:', error);
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Clock className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p>Chargement de vos disponibilités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mes Disponibilités</h2>
          <p className="text-muted-foreground">
            Configurez vos créneaux de disponibilité pour que votre équipe puisse organiser les entraînements
          </p>
        </div>
        <Button onClick={saveAvailabilities} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <div className="grid gap-4">
        {Object.entries(DAYS_CONFIG).map(([dayNumber, dayConfig]) => {
          const dayOfWeek = parseInt(dayNumber);
          const dayData = weeklyAvailability[dayOfWeek];
          
          return (
            <Card key={dayNumber}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{dayConfig.name}</span>
                    {dayData.enabled && (
                      <Badge variant="secondary">
                        {dayData.slots.length} créneau{dayData.slots.length > 1 ? 'x' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                  <Switch
                    checked={dayData.enabled}
                    onCheckedChange={() => toggleDayEnabled(dayOfWeek)}
                  />
                </div>
              </CardHeader>
              
              {dayData.enabled && (
                <CardContent className="space-y-4">
                  {dayData.slots.length === 0 ? (
                    <div className="text-center py-4">
                      <AlertCircle className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Aucun créneau configuré</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayData.slots.map((slot) => (
                        <div key={slot.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Début</Label>
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(dayOfWeek, slot.id, 'start', e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Fin</Label>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(dayOfWeek, slot.id, 'end', e.target.value)}
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTimeSlot(dayOfWeek, slot.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => addTimeSlot(dayOfWeek)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un créneau
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};