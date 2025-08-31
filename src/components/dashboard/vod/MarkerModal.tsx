import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Target,
  User,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarkerData {
  time: number;
  title: string;
  description: string;
  type: "important" | "error" | "success" | "strategy" | "player-specific";
  player?: string;
  category?: string;
}

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (marker: MarkerData) => void;
  currentTime: number;
}

const markerTypes = {
  important: { icon: Clock, color: "bg-blue-100 text-blue-800", label: "Important" },
  error: { icon: AlertTriangle, color: "bg-red-100 text-red-800", label: "Erreur" },
  success: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Bon play" },
  strategy: { icon: Target, color: "bg-purple-100 text-purple-800", label: "Stratégie" },
  "player-specific": { icon: User, color: "bg-orange-100 text-orange-800", label: "Joueur spécifique" }
};

export const MarkerModal = ({ isOpen, onClose, onSave, currentTime }: MarkerModalProps) => {
  const [formData, setFormData] = useState<MarkerData>({
    time: currentTime,
    title: "",
    description: "",
    type: "important",
    player: "",
    category: ""
  });

  // Mettre à jour le temps quand currentTime change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      time: currentTime
    }));
  }, [currentTime]);
  const { toast } = useToast();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTimeInput = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erreur", 
        description: "La description est requise",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    
    // Reset form
    setFormData({
      time: currentTime,
      title: "",
      description: "",
      type: "important",
      player: "",
      category: ""
    });
    
    onClose();
    
    toast({
      title: "Marker ajouté",
      description: `Marqueur créé à ${formatTime(formData.time)}`,
    });
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      time: currentTime,
      title: "",
      description: "",
      type: "important", 
      player: "",
      category: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Configurer le Marker</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Time and Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Temps (mm:ss)</Label>
              <Input
                id="time"
                value={`${Math.floor(formData.time / 60)}:${Math.floor(formData.time % 60).toString().padStart(2, '0')}`}
                onChange={(e) => setFormData({
                  ...formData,
                  time: parseTimeInput(e.target.value)
                })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData.type}
                onValueChange={(value: keyof typeof markerTypes) => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(markerTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <config.icon className="w-4 h-4" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre du marker</Label>
            <Input
              id="title"
              placeholder="Ex: Erreur de positionnement, Bonne rotation..."
              value={formData.title}
              onChange={(e) => setFormData({
                ...formData,
                title: e.target.value
              })}
            />
          </div>

          {/* Player specific field */}
          {formData.type === "player-specific" && (
            <div className="space-y-2">
              <Label htmlFor="player">Joueur concerné</Label>
              <Input
                id="player"
                placeholder="Nom du joueur"
                value={formData.player}
                onChange={(e) => setFormData({
                  ...formData,
                  player: e.target.value
                })}
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez en détail ce qui se passe à ce moment, les points d'amélioration, les recommandations..."
              value={formData.description}
              onChange={(e) => setFormData({
                ...formData,
                description: e.target.value
              })}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted rounded-lg border">
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Aperçu du marker</span>
            </h4>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="font-mono">
                {formatTime(formData.time)}
              </Badge>
              <Badge className={markerTypes[formData.type].color}>
                {markerTypes[formData.type].label}
              </Badge>
              {formData.player && (
                <Badge variant="outline">
                  <User className="w-3 h-3 mr-1" />
                  {formData.player}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium">{formData.title || "Titre du marker"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formData.description || "Description du marker"}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Créer le Marker
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};