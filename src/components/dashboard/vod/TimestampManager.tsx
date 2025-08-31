import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  User,
  AlertTriangle,
  CheckCircle,
  Target,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Timestamp {
  id: string;
  time: number;
  comment: string;
  type: "important" | "error" | "success" | "strategy" | "player-specific";
  player?: string;
  category?: string;
  created_at: string;
}

interface TimestampManagerProps {
  timestamps: Timestamp[];
  onTimestampsChange: (timestamps: Timestamp[]) => void;
  teamId: string;
  onJumpToTime?: (time: number) => void;
}

const timestampTypes = {
  important: { icon: Clock, color: "bg-blue-100 text-blue-800", label: "Important" },
  error: { icon: AlertTriangle, color: "bg-red-100 text-red-800", label: "Erreur" },
  success: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Bon play" },
  strategy: { icon: Target, color: "bg-primary/10 text-primary", label: "Stratégie" },
  "player-specific": { icon: User, color: "bg-orange-100 text-orange-800", label: "Joueur spécifique" }
};

export const TimestampManager = ({ timestamps, onTimestampsChange, teamId, onJumpToTime }: TimestampManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTimestamp, setEditingTimestamp] = useState({
    time: 0,
    comment: "",
    type: "important" as keyof typeof timestampTypes,
    player: "",
    category: ""
  });
  const [newTimestamp, setNewTimestamp] = useState({
    time: 0,
    comment: "",
    type: "important" as keyof typeof timestampTypes,
    player: "",
    category: ""
  });
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

  const addTimestamp = () => {
    if (!newTimestamp.comment.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire est requis",
        variant: "destructive",
      });
      return;
    }

    const timestamp: Timestamp = {
      id: Date.now().toString(),
      time: newTimestamp.time,
      comment: newTimestamp.comment,
      type: newTimestamp.type,
      player: newTimestamp.player || undefined,
      category: newTimestamp.category || undefined,
      created_at: new Date().toISOString()
    };

    const updatedTimestamps = [...timestamps, timestamp].sort((a, b) => a.time - b.time);
    onTimestampsChange(updatedTimestamps);

    setNewTimestamp({
      time: 0,
      comment: "",
      type: "important",
      player: "",
      category: ""
    });
    setIsAdding(false);

    toast({
      title: "Timestamp ajouté",
      description: `Marqueur créé à ${formatTime(timestamp.time)}`,
    });
  };

  const updateTimestamp = (id: string, updates: Partial<Timestamp>) => {
    const updatedTimestamps = timestamps.map(ts => 
      ts.id === id ? { ...ts, ...updates } : ts
    ).sort((a, b) => a.time - b.time);
    
    onTimestampsChange(updatedTimestamps);
    setEditingId(null);

    toast({
      title: "Timestamp mis à jour",
      description: "Les modifications ont été sauvegardées",
    });
  };

  const startEditing = (timestamp: Timestamp) => {
    setEditingTimestamp({
      time: timestamp.time,
      comment: timestamp.comment,
      type: timestamp.type,
      player: timestamp.player || "",
      category: timestamp.category || ""
    });
    setEditingId(timestamp.id);
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    updateTimestamp(editingId, {
      time: editingTimestamp.time,
      comment: editingTimestamp.comment,
      type: editingTimestamp.type,
      player: editingTimestamp.player || undefined,
      category: editingTimestamp.category || undefined
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTimestamp({
      time: 0,
      comment: "",
      type: "important",
      player: "",
      category: ""
    });
  };

  const deleteTimestamp = (id: string) => {
    const updatedTimestamps = timestamps.filter(ts => ts.id !== id);
    onTimestampsChange(updatedTimestamps);

    toast({
      title: "Timestamp supprimé",
      description: "Le marqueur a été retiré",
    });
  };

  const jumpToTime = (time: number) => {
    // Appeler la fonction du parent pour naviguer dans le lecteur
    onJumpToTime?.(time);
    toast({
      title: "Navigation",
      description: `Saut à ${formatTime(time)}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <h3 className="text-lg font-medium">
            Timeline & Timestamps ({timestamps.length})
          </h3>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </Button>
      </div>

      {/* Formulaire d'ajout */}
      {isAdding && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Nouveau Timestamp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Temps (mm:ss)</Label>
                <Input
                  id="time"
                  placeholder="1:30"
                  onChange={(e) => setNewTimestamp({
                    ...newTimestamp,
                    time: parseTimeInput(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newTimestamp.type}
                  onValueChange={(value: keyof typeof timestampTypes) => 
                    setNewTimestamp({ ...newTimestamp, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(timestampTypes).map(([key, config]) => (
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

            {newTimestamp.type === "player-specific" && (
              <div className="space-y-2">
                <Label htmlFor="player">Joueur concerné</Label>
                <Input
                  id="player"
                  placeholder="Nom du joueur"
                  value={newTimestamp.player}
                  onChange={(e) => setNewTimestamp({
                    ...newTimestamp,
                    player: e.target.value
                  })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                placeholder="Décrivez ce qui se passe à ce moment..."
                value={newTimestamp.comment}
                onChange={(e) => setNewTimestamp({
                  ...newTimestamp,
                  comment: e.target.value
                })}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAdding(false)}
              >
                Annuler
              </Button>
              <Button onClick={addTimestamp}>
                Ajouter Timestamp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des timestamps */}
      <div className="space-y-3">
        {timestamps.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun timestamp créé</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des marqueurs pour annoter la VOD
              </p>
            </CardContent>
          </Card>
        ) : (
          timestamps.map((timestamp) => {
            const typeConfig = timestampTypes[timestamp.type];
            const IconComponent = typeConfig.icon;

            return editingId === timestamp.id ? (
              // Mode édition
              <Card key={timestamp.id} className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Modifier le Timestamp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-time">Temps (mm:ss)</Label>
                      <Input
                        id="edit-time"
                        placeholder="1:30"
                        value={`${Math.floor(editingTimestamp.time / 60)}:${Math.floor(editingTimestamp.time % 60).toString().padStart(2, '0')}`}
                        onChange={(e) => setEditingTimestamp({
                          ...editingTimestamp,
                          time: parseTimeInput(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Type</Label>
                      <Select 
                        value={editingTimestamp.type}
                        onValueChange={(value: keyof typeof timestampTypes) => 
                          setEditingTimestamp({ ...editingTimestamp, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(timestampTypes).map(([key, config]) => (
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

                  {editingTimestamp.type === "player-specific" && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-player">Joueur concerné</Label>
                      <Input
                        id="edit-player"
                        placeholder="Nom du joueur"
                        value={editingTimestamp.player}
                        onChange={(e) => setEditingTimestamp({
                          ...editingTimestamp,
                          player: e.target.value
                        })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="edit-comment">Commentaire</Label>
                    <Textarea
                      id="edit-comment"
                      placeholder="Décrivez ce qui se passe à ce moment..."
                      value={editingTimestamp.comment}
                      onChange={(e) => setEditingTimestamp({
                        ...editingTimestamp,
                        comment: e.target.value
                      })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={cancelEdit}
                    >
                      Annuler
                    </Button>
                    <Button onClick={saveEdit}>
                      Sauvegarder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Mode affichage normal
              <Card key={timestamp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Timeline marker */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => jumpToTime(timestamp.time)}
                          className="flex items-center space-x-1"
                        >
                          <Play className="w-3 h-3" />
                          <span className="font-mono font-medium">
                            {formatTime(timestamp.time)}
                          </span>
                        </Button>
                        
                        <Badge className={typeConfig.color}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {typeConfig.label}
                        </Badge>

                        {timestamp.player && (
                          <Badge variant="outline">
                            <User className="w-3 h-3 mr-1" />
                            {timestamp.player}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-foreground mb-2">
                        {timestamp.comment}
                      </p>

                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>
                          Créé le {new Date(timestamp.created_at).toLocaleDateString("fr-FR")} à {new Date(timestamp.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(timestamp)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTimestamp(timestamp.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Résumé rapide */}
      {timestamps.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2 text-foreground">Résumé de l'analyse</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              {Object.entries(timestampTypes).map(([type, config]) => {
                const count = timestamps.filter(ts => ts.type === type).length;
                return (
                  <div key={type} className="flex items-center space-x-2 text-muted-foreground">
                    <config.icon className="w-4 h-4" />
                    <span>{config.label}: {count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};