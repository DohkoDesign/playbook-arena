import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamName: string;
  loading?: boolean;
}

export const DeleteTeamModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  teamName, 
  loading = false 
}: DeleteTeamModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  
  const canDelete = confirmText === teamName;

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Supprimer l'équipe
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Cette action est irréversible. Toutes les données associées à cette équipe seront définitivement supprimées.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Vous êtes sur le point de supprimer l'équipe <strong>"{teamName}"</strong> ainsi que :
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Tous les membres de l'équipe</li>
              <li>• Toutes les stratégies</li>
              <li>• Tous les événements du calendrier</li>
              <li>• Tous les profils de joueurs</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmText">
              Pour confirmer, tapez le nom de l'équipe : <strong>{teamName}</strong>
            </Label>
            <Input
              id="confirmText"
              placeholder={`Tapez "${teamName}" pour confirmer`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="border-red-200 focus:border-red-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm} 
              disabled={!canDelete || loading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};