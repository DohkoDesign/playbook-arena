import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PlayerFeedbackViewProps {
  teamId: string;
  playerId: string;
}

interface Feedback {
  id: string;
  message: string;
  type: string;
  created_at: string;
  response?: string;
  responded_at?: string;
}

export const PlayerFeedbackView = ({ teamId, playerId }: PlayerFeedbackViewProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState("general");
  const { toast } = useToast();

  useEffect(() => {
    if (playerId) {
      fetchFeedbacks();
    }
  }, [playerId]);

  const fetchFeedbacks = async () => {
    try {
      // Pour cette démo, on simule des feedbacks depuis localStorage
      const savedFeedbacks = localStorage.getItem(`feedbacks_${playerId}`);
      if (savedFeedbacks) {
        setFeedbacks(JSON.parse(savedFeedbacks));
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async () => {
    if (!newMessage.trim()) return;

    setSubmitting(true);

    try {
      const newFeedback: Feedback = {
        id: Date.now().toString(),
        message: newMessage.trim(),
        type: messageType,
        created_at: new Date().toISOString()
      };

      const updatedFeedbacks = [newFeedback, ...feedbacks];
      setFeedbacks(updatedFeedbacks);
      
      // Sauvegarder localement (en prod, ce serait dans Supabase)
      localStorage.setItem(`feedbacks_${playerId}`, JSON.stringify(updatedFeedbacks));

      setNewMessage("");
      setMessageType("general");

      toast({
        title: "Message envoyé",
        description: "Votre message a été transmis au staff",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: "general", label: "Message général" },
    { value: "coaching_request", label: "Demande de coaching" },
    { value: "role_change", label: "Changement de rôle" },
    { value: "character_change", label: "Changement de personnage" },
    { value: "schedule", label: "Planning / Disponibilité" },
    { value: "suggestion", label: "Suggestion d'amélioration" }
  ];

  const getTypeLabel = (type: string) => {
    const found = feedbackTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "coaching_request":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "role_change":
      case "character_change":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "schedule":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "suggestion":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Communication Staff</h2>
        </div>
      </div>

      {/* Formulaire de nouveau message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Nouveau Message</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="messageType">Type de message</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Décrivez votre demande ou remarque..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={sendFeedback} 
            disabled={submitting || !newMessage.trim()}
            className="w-full"
          >
            {submitting ? "Envoi..." : "Envoyer le message"}
          </Button>
        </CardContent>
      </Card>

      {/* Historique des messages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Historique des messages</h3>
        
        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">Aucun message</h4>
              <p className="text-muted-foreground">
                Vous n'avez pas encore envoyé de message au staff. N'hésitez pas à communiquer !
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Vous</span>
                      <div className={`px-2 py-1 rounded-full text-xs ${getTypeColor(feedback.type)}`}>
                        {getTypeLabel(feedback.type)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(new Date(feedback.created_at), "PPP 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm whitespace-pre-wrap">{feedback.message}</p>
                    
                    {feedback.response ? (
                      <div className="border-t pt-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm text-primary">Réponse du staff</span>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(feedback.responded_at!), "PPP 'à' HH:mm", { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{feedback.response}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        En attente de réponse du staff
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};