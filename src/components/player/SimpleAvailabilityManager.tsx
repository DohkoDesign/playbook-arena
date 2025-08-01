import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  Save,
  Sun,
  Sunset,
  Moon,
  Plus,
  Minus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SimpleAvailabilityManagerProps {
  teamId: string;
  playerId: string;
}

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  label: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

const PREDEFINED_SLOTS = [
  { id: 'morning', start: '09:00', end: '12:00', label: 'Matin', icon: Sun },
  { id: 'afternoon', start: '14:00', end: '18:00', label: 'Après-midi', icon: Sunset },
  { id: 'evening', start: '19:00', end: '23:00', label: 'Soir', icon: Moon },
];

const DAYS_CONFIG = [
  { id: 1, name: "Lundi", short: "LUN" },
  { id: 2, name: "Mardi", short: "MAR" },
  { id: 3, name: "Mercredi", short: "MER" },
  { id: 4, name: "Jeudi", short: "JEU" },
  { id: 5, name: "Vendredi", short: "VEN" },
  { id: 6, name: "Samedi", short: "SAM" },
  { id: 0, name: "Dimanche", short: "DIM" },
];

const getWeekStart = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  return monday.toISOString().split('T')[0];
};

export const SimpleAvailabilityManager = ({ teamId, playerId }: SimpleAvailabilityManagerProps) => {
  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<number, Record<string, boolean>>>({
    1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 0: {}
  });
  const [customSlots, setCustomSlots] = useState<Record<number, TimeSlot[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: []
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
      console.log("🔍 Fetching availabilities for player:", playerId);

      const weekStart = getWeekStart();
      const { data, error } = await supabase
        .from('player_availabilities')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', playerId)
        .eq('week_start', weekStart);

      if (error) throw error;

      // Convertir les données en format d'interface
      const newWeeklyAvailability = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 0: {} };
      const newCustomSlots = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] };

      data?.forEach(avail => {
        const dayOfWeek = avail.day_of_week;
        const startTime = avail.start_time.slice(0, 5);
        const endTime = avail.end_time.slice(0, 5);

        // Vérifier si c'est un créneau prédéfini
        const predefinedSlot = PREDEFINED_SLOTS.find(slot => 
          slot.start === startTime && slot.end === endTime
        );

        if (predefinedSlot) {
          newWeeklyAvailability[dayOfWeek][predefinedSlot.id] = true;
        } else {
          // Créneau personnalisé
          newCustomSlots[dayOfWeek].push({
            id: avail.id,
            start: startTime,
            end: endTime,
            label: `${startTime} - ${endTime}`
          });
        }
      });

      setWeeklyAvailability(newWeeklyAvailability);
      setCustomSlots(newCustomSlots);

    } catch (error: any) {
      console.error("❌ Error fetching availabilities:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les disponibilités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (dayId: number, slotId: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [slotId]: !prev[dayId][slotId]
      }
    }));
  };

  const addCustomSlot = (dayId: number) => {
    const newSlot: TimeSlot = {
      id: `custom_${Date.now()}`,
      start: '18:00',
      end: '20:00',
      label: 'Personnalisé'
    };
    
    setCustomSlots(prev => ({
      ...prev,
      [dayId]: [...prev[dayId], newSlot]
    }));
  };

  const removeCustomSlot = (dayId: number, slotId: string) => {
    setCustomSlots(prev => ({
      ...prev,
      [dayId]: prev[dayId].filter(slot => slot.id !== slotId)
    }));
  };

  const updateCustomSlot = (dayId: number, slotId: string, field: 'start' | 'end', value: string) => {
    setCustomSlots(prev => ({
      ...prev,
      [dayId]: prev[dayId].map(slot => 
        slot.id === slotId 
          ? { ...slot, [field]: value, label: field === 'start' ? `${value} - ${slot.end}` : `${slot.start} - ${value}` }
          : slot
      )
    }));
  };

  const saveAvailabilities = async () => {
    try {
      setSaving(true);
      console.log("💾 Saving availabilities for:", { teamId, playerId });

      const weekStart = getWeekStart();
      console.log("📅 Week start:", weekStart);

      // Supprimer les anciennes disponibilités
      console.log("🗑️ Deleting old availabilities...");
      const { error: deleteError } = await supabase
        .from('player_availabilities')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', playerId)
        .eq('week_start', weekStart);

      if (deleteError) {
        console.error("❌ Delete error:", deleteError);
        throw deleteError;
      }

      const availabilitiesToInsert = [];

      // Ajouter les créneaux prédéfinis
      DAYS_CONFIG.forEach(day => {
        PREDEFINED_SLOTS.forEach(slot => {
          if (weeklyAvailability[day.id][slot.id]) {
            availabilitiesToInsert.push({
              team_id: teamId,
              user_id: playerId,
              day_of_week: day.id,
              start_time: slot.start + ':00',
              end_time: slot.end + ':00',
              week_start: weekStart
            });
          }
        });

        // Ajouter les créneaux personnalisés
        customSlots[day.id].forEach(slot => {
          if (slot.start && slot.end) {
            availabilitiesToInsert.push({
              team_id: teamId,
              user_id: playerId,
              day_of_week: day.id,
              start_time: slot.start + ':00',
              end_time: slot.end + ':00',
              week_start: weekStart
            });
          }
        });
      });

      console.log("📝 Inserting availabilities:", availabilitiesToInsert);

      if (availabilitiesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('player_availabilities')
          .insert(availabilitiesToInsert);

        if (insertError) {
          console.error("❌ Insert error:", insertError);
          throw insertError;
        }
        console.log("✅ Successfully inserted availabilities");
      } else {
        console.log("⚠️ No availabilities to insert");
      }

      toast({
        title: "Succès",
        description: "Vos disponibilités ont été sauvegardées",
      });

    } catch (error: any) {
      console.error("❌ Error saving availabilities:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
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
          <Clock className="w-5 h-5" />
          <h2 className="text-xl font-bold">Mes Disponibilités</h2>
        </div>
        <Button onClick={saveAvailabilities} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DAYS_CONFIG.map(day => (
          <Card key={day.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-sm font-medium">
                <div className="text-lg font-bold">{day.short}</div>
                <div className="text-xs text-muted-foreground">{day.name}</div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Créneaux prédéfinis */}
              {PREDEFINED_SLOTS.map(slot => {
                const Icon = slot.icon;
                const isActive = weeklyAvailability[day.id][slot.id];
                
                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-muted/30 hover:bg-muted/50 border-border'
                    }`}
                    onClick={() => toggleSlot(day.id, slot.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{slot.label}</span>
                      </div>
                      <Switch
                        checked={isActive}
                        onChange={() => {}} // Géré par le clic sur le div
                        className="pointer-events-none"
                      />
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      {slot.start} - {slot.end}
                    </div>
                  </div>
                );
              })}

              {/* Créneaux personnalisés */}
              {customSlots[day.id].map(slot => (
                <div key={slot.id} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Personnalisé</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCustomSlot(day.id, slot.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateCustomSlot(day.id, slot.id, 'start', e.target.value)}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateCustomSlot(day.id, slot.id, 'end', e.target.value)}
                      className="w-full p-1 text-xs border rounded"
                    />
                  </div>
                </div>
              ))}

              {/* Bouton ajouter créneau personnalisé */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addCustomSlot(day.id)}
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                Ajouter
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Cliquez sur les créneaux pour les activer/désactiver</p>
        <p>Ajoutez des créneaux personnalisés si nécessaire</p>
      </div>
    </div>
  );
};