import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  User, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X,
  Calendar as CalendarIcon,
  BarChart3,
  MessageSquare,
  Save,
  Clock,
  Trophy,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const PlayerManagement = () => {
  const { teamId, userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [player, setPlayer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // États pour l'édition du profil
  const [pointsForts, setPointsForts] = useState<string[]>([]);
  const [pointsFaibles, setPointsFaibles] = useState<string[]>([]);
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [newPointFort, setNewPointFort] = useState("");
  const [newPointFaible, setNewPointFaible] = useState("");
  const [newObjectif, setNewObjectif] = useState("");

  // États pour le planning
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");

  useEffect(() => {
    if (teamId && userId) {
      fetchAllData();
    }
  }, [teamId, userId]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPlayerData(),
      fetchAvailabilities(),
      fetchEvents(),
      fetchFeedbacks()
    ]);
  };

  const fetchPlayerData = async () => {
    try {
      // Récupérer les infos du membre de l'équipe
      const { data: memberData, error: memberError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .single();

      if (memberError) throw memberError;

      // Récupérer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;

      // Récupérer le profil joueur
      const { data: playerProfileData, error: playerProfileError } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .maybeSingle();

      if (playerProfileError && playerProfileError.code !== 'PGRST116') {
        throw playerProfileError;
      }

      setPlayer(memberData);
      setProfile(profileData);
      setPlayerProfile(playerProfileData);
      
      if (playerProfileData) {
        setPointsForts(playerProfileData.points_forts || []);
        setPointsFaibles(playerProfileData.points_faibles || []);
        setObjectifs(playerProfileData.objectifs_individuels || []);
        setNotes(playerProfileData.notes || "");
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du joueur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilities = async () => {
    try {
      const { data, error } = await supabase
        .from("player_availabilities")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des disponibilités:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", teamId)
        .order("date_debut", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des événements:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("player_feedbacks")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des feedbacks:", error);
    }
  };

  const createPersonalEvent = async () => {
    if (!selectedDate || !newEventTitle || !newEventStartTime || !newEventEndTime) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const startDateTime = new Date(selectedDate);
      const [startHour, startMinute] = newEventStartTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endDateTime = new Date(selectedDate);
      const [endHour, endMinute] = newEventEndTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

      const { error } = await supabase
        .from("events")
        .insert({
          team_id: teamId,
          titre: newEventTitle,
          description: newEventDescription,
          type: "session_individuelle",
          date_debut: startDateTime.toISOString(),
          date_fin: endDateTime.toISOString(),
          created_by: userId
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Événement ajouté au planning du joueur",
      });

      setShowEventModal(false);
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventStartTime("");
      setNewEventEndTime("");
      fetchEvents();
    } catch (error: any) {
      console.error("Erreur lors de la création de l'événement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive",
      });
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayIndex];
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date_debut);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const savePlayerProfile = async () => {
    setSaving(true);
    try {
      const profileData = {
        team_id: teamId,
        user_id: userId,
        points_forts: pointsForts,
        points_faibles: pointsFaibles,
        objectifs_individuels: objectifs,
        notes: notes,
      };

      if (playerProfile) {
        // Mise à jour
        const { error } = await supabase
          .from("player_profiles")
          .update(profileData)
          .eq("id", playerProfile.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from("player_profiles")
          .insert(profileData);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Profil joueur sauvegardé avec succès",
      });

      // Recharger les données
      await fetchPlayerData();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addPointFort = () => {
    if (newPointFort.trim()) {
      setPointsForts([...pointsForts, newPointFort.trim()]);
      setNewPointFort("");
    }
  };

  const addPointFaible = () => {
    if (newPointFaible.trim()) {
      setPointsFaibles([...pointsFaibles, newPointFaible.trim()]);
      setNewPointFaible("");
    }
  };

  const addObjectif = () => {
    if (newObjectif.trim()) {
      setObjectifs([...objectifs, newObjectif.trim()]);
      setNewObjectif("");
    }
  };

  const removePointFort = (index: number) => {
    setPointsForts(pointsForts.filter((_, i) => i !== index));
  };

  const removePointFaible = (index: number) => {
    setPointsFaibles(pointsFaibles.filter((_, i) => i !== index));
  };

  const removeObjectif = (index: number) => {
    setObjectifs(objectifs.filter((_, i) => i !== index));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "capitaine":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "joueur":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "remplacant":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des données du joueur...</p>
      </div>
    );
  }

  if (!player || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Joueur non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'équipe
              </Button>
              <Button 
                onClick={savePlayerProfile} 
                disabled={saving}
                className="shadow-elegant"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
            
            {/* Player Info Card */}
            <div className="bg-card rounded-2xl shadow-elegant border p-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-elegant">
                    {profile?.pseudo?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {profile?.pseudo || "Joueur"}
                  </h1>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getRoleColor(player?.role)} text-sm px-3 py-1`}>
                      {player?.role || "Joueur"}
                    </Badge>
                    {profile?.tracker_last_updated && (
                      <span className="text-sm text-muted-foreground">
                        Stats mises à jour le {format(new Date(profile.tracker_last_updated), "dd/MM/yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs defaultValue="profile" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-card/80 backdrop-blur-sm border shadow-card rounded-full p-1">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2 transition-all duration-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </TabsTrigger>
                <TabsTrigger 
                  value="planning"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2 transition-all duration-200"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Planning
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2 transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Feedback
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-8 animate-fade-in">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Points forts */}
                <div className="group">
                  <Card className="bg-card shadow-elegant hover:shadow-card border transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-foreground">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">Points forts</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Nouveau point fort..."
                          value={newPointFort}
                          onChange={(e) => setNewPointFort(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addPointFort()}
                          className="bg-white/50 border-green-200 focus:border-green-400 dark:bg-slate-800/50"
                        />
                        <Button 
                          size="sm" 
                          onClick={addPointFort}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {pointsForts.map((point, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-green-200/50 backdrop-blur-sm">
                            <span className="text-sm font-medium text-green-800 dark:text-green-300">{point}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removePointFort(index)}
                              className="text-green-600 hover:text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Points faibles */}
                <div className="group">
                  <Card className="bg-card shadow-elegant hover:shadow-card border transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-foreground">
                        <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-destructive-foreground" />
                        </div>
                        <span className="text-xl font-bold">Points à améliorer</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Nouveau point à améliorer..."
                          value={newPointFaible}
                          onChange={(e) => setNewPointFaible(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addPointFaible()}
                          className="bg-background/50 border"
                        />
                        <Button 
                          size="sm" 
                          onClick={addPointFaible}
                          className="shadow-elegant transform hover:scale-105 transition-all duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {pointsFaibles.map((point, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors group cursor-pointer"
                            onClick={() => removePointFaible(index)}
                          >
                            {point}
                            <X className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        ))}
                        {pointsFaibles.length === 0 && (
                          <p className="text-muted-foreground text-sm">Aucun point à améliorer ajouté.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Objectifs */}
                <div className="group">
                  <Card className="bg-card shadow-elegant hover:shadow-card border transition-all duration-300 transform hover:scale-105">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-foreground">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                          <Target className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <span className="text-xl font-bold">Objectifs individuels</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Nouvel objectif..."
                          value={newObjectif}
                          onChange={(e) => setNewObjectif(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addObjectif()}
                          className="bg-background/50 border"
                        />
                        <Button 
                          size="sm" 
                          onClick={addObjectif}
                          className="shadow-elegant transform hover:scale-105 transition-all duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {objectifs.map((objectif, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors group cursor-pointer"
                            onClick={() => removeObjectif(index)}
                          >
                            {objectif}
                            <X className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        ))}
                        {objectifs.length === 0 && (
                          <p className="text-muted-foreground text-sm">Aucun objectif défini.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notes */}
                <div className="group lg:col-span-2">
                  <Card className="bg-card shadow-elegant hover:shadow-card border transition-all duration-300">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-foreground">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-xl font-bold">Notes du coach</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Ajoutez vos notes et observations sur ce joueur..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[120px] bg-background/50 border resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>


        <TabsContent value="planning" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Calendrier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Planning personnel</span>
                  <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter événement
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un événement personnel</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="event-title">Titre *</Label>
                          <Input
                            id="event-title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="Titre de l'événement"
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-description">Description</Label>
                          <Textarea
                            id="event-description"
                            value={newEventDescription}
                            onChange={(e) => setNewEventDescription(e.target.value)}
                            placeholder="Description de l'événement"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start-time">Heure de début *</Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={newEventStartTime}
                              onChange={(e) => setNewEventStartTime(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-time">Heure de fin *</Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={newEventEndTime}
                              onChange={(e) => setNewEventEndTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowEventModal(false)}>
                            Annuler
                          </Button>
                          <Button onClick={createPersonalEvent}>
                            Créer l'événement
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border w-full"
                    locale={fr}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Disponibilités */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span>Disponibilités régulières</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availabilities.length > 0 ? (
                  <div className="space-y-3">
                    {availabilities.map((availability) => (
                      <div key={availability.id} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {getDayName(availability.day_of_week)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Aucune disponibilité configurée par le joueur.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Événements du jour sélectionné */}
            {selectedDate && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>
                    Événements du {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).map((event) => (
                        <div key={event.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{event.titre}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(event.date_debut), "HH:mm")} - {format(new Date(event.date_fin), "HH:mm")}
                              </p>
                              {event.description && (
                                <p className="text-sm mt-2">{event.description}</p>
                              )}
                            </div>
                            <Badge variant="outline">{event.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Aucun événement prévu pour cette date.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Historique des feedbacks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{feedback.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{feedback.category}</Badge>
                            <Badge variant={feedback.status === 'pending' ? 'secondary' : 'default'}>
                              {feedback.status}
                            </Badge>
                            {feedback.is_anonymous && (
                              <Badge variant="outline">Anonyme</Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(feedback.created_at), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Aucun feedback pour ce joueur.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};