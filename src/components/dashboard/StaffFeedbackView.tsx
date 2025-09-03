import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  Lightbulb,
  Heart,
  Bug,
  HelpCircle,
  Reply,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface StaffFeedbackViewProps {
  teamId: string;
}

interface Feedback {
  id: string;
  title: string;
  content: string;
  category: 'suggestion' | 'complaint' | 'compliment' | 'bug' | 'other';
  is_anonymous: boolean;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  user_id?: string;
  pseudo?: string;
  responses?: FeedbackResponse[];
}

interface FeedbackResponse {
  id: string;
  response_text: string;
  created_at: string;
  responded_by: string;
  pseudo?: string;
}

const categoryConfig = {
  suggestion: {
    label: 'Suggestion',
    icon: Lightbulb,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  complaint: {
    label: 'Plainte',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-700 border-red-200'
  },
  compliment: {
    label: 'Compliment',
    icon: Heart,
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  bug: {
    label: 'Bug/Problème',
    icon: Bug,
    color: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  other: {
    label: 'Autre',
    icon: HelpCircle,
    color: 'bg-gray-50 text-gray-700 border-gray-200'
  }
};

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  reviewed: { label: 'Examiné', color: 'bg-blue-100 text-blue-800', icon: Eye },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

export const StaffFeedbackView = ({ teamId }: StaffFeedbackViewProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchFeedbacks();
  }, [teamId]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('player_feedbacks')
        .select(`
          *,
          feedback_responses(
            id,
            response_text,
            created_at,
            responded_by,
            profiles!inner(pseudo)
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const feedbacksWithData = await Promise.all(
        (data || []).map(async (feedback) => {
          let pseudo = 'Anonyme';
          
          if (!feedback.is_anonymous && feedback.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('pseudo')
              .eq('user_id', feedback.user_id)
              .single();
            
            pseudo = profile?.pseudo || 'Utilisateur inconnu';
          }
          
          return {
            id: feedback.id,
            title: feedback.title,
            content: feedback.content,
            category: feedback.category as Feedback['category'],
            is_anonymous: feedback.is_anonymous,
            status: feedback.status as Feedback['status'],
            created_at: feedback.created_at,
            user_id: feedback.user_id,
            pseudo,
            responses: feedback.feedback_responses?.map((response: any) => ({
              ...response,
              pseudo: response.profiles?.pseudo || 'Staff'
            })) || []
          };
        })
      );
      
      setFeedbacks(feedbacksWithData);
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les feedbacks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: Feedback['status']) => {
    try {
      const { error } = await supabase
        .from('player_feedbacks')
        .update({ status: newStatus })
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedbacks(prev => prev.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, status: newStatus }
          : feedback
      ));

      toast({
        title: "Statut mis à jour",
        description: `Le feedback a été marqué comme ${statusConfig[newStatus].label.toLowerCase()}`,
      });
    } catch (error: any) {
      console.error('Error updating feedback status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const statusMatch = selectedStatus === 'all' || feedback.status === selectedStatus;
    const categoryMatch = selectedCategory === 'all' || feedback.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  const getStatsCount = (status: string) => {
    return feedbacks.filter(f => status === 'all' || f.status === status).length;
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('feedback_responses')
        .insert({
          feedback_id: selectedFeedback.id,
          response_text: responseText.trim(),
          responded_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Réponse envoyée",
        description: "Votre réponse a été envoyée avec succès",
      });

      setResponseText('');
      setShowResponseModal(false);
      setSelectedFeedback(null);
      fetchFeedbacks(); // Refresh to show new response
    } catch (error: any) {
      console.error('Error submitting response:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-primary rounded-lg mx-auto animate-pulse"></div>
          <p>Chargement des feedbacks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feedbacks des Joueurs</h2>
          <p className="text-muted-foreground">
            Gérez les retours et suggestions de votre équipe
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{getStatsCount('all')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{getStatsCount('pending')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Examinés</p>
                <p className="text-2xl font-bold">{getStatsCount('reviewed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Résolus</p>
                <p className="text-2xl font-bold">{getStatsCount('resolved')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="reviewed">Examiné</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Feedbacks ({filteredFeedbacks.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun feedback trouvé</h3>
              <p className="text-muted-foreground">
                {selectedStatus !== 'all' || selectedCategory !== 'all' 
                  ? "Aucun feedback ne correspond aux filtres sélectionnés."
                  : "Aucun feedback n'a encore été envoyé par votre équipe."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => {
                const categoryInfo = categoryConfig[feedback.category];
                const statusInfo = statusConfig[feedback.status];
                const CategoryIcon = categoryInfo.icon;
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={feedback.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg border ${categoryInfo.color}`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{feedback.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {feedback.is_anonymous ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Anonyme</span>
                              </>
                            ) : (
                              <>
                                <Users className="w-3 h-3" />
                                <span>{feedback.pseudo || 'Joueur inconnu'}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{format(new Date(feedback.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                      {feedback.content}
                    </p>
                    
                    {/* Affichage des réponses */}
                    {feedback.responses && feedback.responses.length > 0 && (
                      <div className="mb-4 border-t pt-4">
                        <h5 className="text-sm font-medium mb-3 text-muted-foreground">Réponses</h5>
                        <div className="space-y-3">
                          {feedback.responses.map((response) => (
                            <div key={response.id} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">{response.pseudo}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(response.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                                </span>
                              </div>
                              <p className="text-sm">{response.response_text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Catégorie: {categoryInfo.label}</span>
                        <span>•</span>
                        <span>ID: {feedback.id.slice(0, 8)}...</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={feedback.status} 
                          onValueChange={(value) => updateFeedbackStatus(feedback.id, value as Feedback['status'])}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="reviewed">Examiné</SelectItem>
                            <SelectItem value="resolved">Résolu</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setShowResponseModal(true);
                          }}
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Répondre
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de réponse */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Répondre au feedback</DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium mb-2">{selectedFeedback.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedFeedback.is_anonymous ? 'Joueur anonyme' : selectedFeedback.pseudo} • 
                  {format(new Date(selectedFeedback.created_at), "d MMM yyyy", { locale: fr })}
                </p>
                <p className="text-sm">{selectedFeedback.content}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="response">Votre réponse</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Tapez votre réponse..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText('');
                    setSelectedFeedback(null);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmitResponse}
                  disabled={!responseText.trim() || submitting}
                >
                  {submitting ? "Envoi..." : "Envoyer la réponse"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};