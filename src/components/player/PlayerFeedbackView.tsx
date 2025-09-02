import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Lightbulb,
  Heart,
  Bug,
  HelpCircle
} from "lucide-react";
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
  title: string;
  content: string;
  category: 'suggestion' | 'complaint' | 'compliment' | 'bug' | 'other';
  is_anonymous: boolean;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
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
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  reviewed: { label: 'Examiné', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800' }
};

export const PlayerFeedbackView = ({ teamId, playerId }: PlayerFeedbackViewProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'suggestion' as Feedback['category'],
    is_anonymous: false
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbacks();
  }, [teamId, playerId]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les feedbacks du joueur (anonymes et non-anonymes)
      const { data, error } = await supabase
        .from('player_feedbacks')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', playerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapper les données pour correspondre à l'interface
      const mappedFeedbacks: Feedback[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category as Feedback['category'],
        is_anonymous: item.is_anonymous,
        status: item.status as Feedback['status'],
        created_at: item.created_at
      }));
      
      setFeedbacks(mappedFeedbacks);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const feedbackData = {
        team_id: teamId,
        user_id: playerId, // Toujours associer au joueur pour qu'il puisse voir ses feedbacks
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        is_anonymous: formData.is_anonymous
      };

      const { error } = await supabase
        .from('player_feedbacks')
        .insert([feedbackData]);

      if (error) throw error;

      toast({
        title: "Feedback envoyé",
        description: formData.is_anonymous 
          ? "Votre feedback anonyme a été envoyé avec succès"
          : "Votre feedback a été envoyé avec succès",
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'suggestion',
        is_anonymous: false
      });
      
      setShowCreateModal(false);
      
      // Toujours recharger les feedbacks
      fetchFeedbacks();
      
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le feedback",
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
          <h2 className="text-2xl font-bold">Mes Feedbacks</h2>
          <p className="text-muted-foreground">
            Partagez vos suggestions, compliments ou signalements avec votre équipe
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau feedback</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Résumé de votre feedback..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Feedback['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Décrivez votre feedback en détail..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center space-x-2">
                  {formData.is_anonymous ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                  <Label htmlFor="anonymous" className="cursor-pointer">
                    Envoyer de manière anonyme
                  </Label>
                </div>
                <Switch
                  id="anonymous"
                  checked={formData.is_anonymous}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_anonymous: checked }))}
                />
              </div>
              
              {formData.is_anonymous && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note :</strong> Les feedbacks anonymes seront visibles dans votre historique, mais votre identité ne sera pas révélée au staff.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Envoyer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des feedbacks non-anonymes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Mes feedbacks envoyés</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun feedback pour le moment</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre premier feedback pour partager vos idées avec l'équipe.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un feedback
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => {
                const categoryInfo = categoryConfig[feedback.category];
                const statusInfo = statusConfig[feedback.status];
                const Icon = categoryInfo.icon;
                
                return (
                  <div key={feedback.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg border ${categoryInfo.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{feedback.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(feedback.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {feedback.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Catégorie: {categoryInfo.label}</span>
                      <span>ID: {feedback.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};