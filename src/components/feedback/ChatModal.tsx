import { useState } from "react";
import { Send, Bug, Lightbulb, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatModal = ({ open, onOpenChange }: ChatModalProps) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"bug" | "improvement">("bug");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message requis",
        description: "Veuillez saisir votre message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-feedback', {
        body: {
          message: message.trim(),
          type,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
      setMessage("");
      
      toast({
        title: "Merci pour votre retour !",
        description: "Votre message a été envoyé avec succès",
      });

      // Auto close after showing success
      setTimeout(() => {
        setIsSubmitted(false);
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setType("bug");
    setIsSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Envoyer un retour
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Merci pour votre retour !</h3>
            <p className="text-muted-foreground">
              Votre message nous aide à améliorer la plateforme.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Type de retour</Label>
              <RadioGroup value={type} onValueChange={(value) => setType(value as "bug" | "improvement")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bug" id="bug" />
                  <Label htmlFor="bug" className="flex items-center gap-2 cursor-pointer">
                    <Bug className="w-4 h-4 text-red-500" />
                    Signaler un bug
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="improvement" id="improvement" />
                  <Label htmlFor="improvement" className="flex items-center gap-2 cursor-pointer">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Suggérer une amélioration
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                Votre message
              </Label>
              <Textarea
                id="message"
                placeholder={
                  type === "bug" 
                    ? "Décrivez le problème rencontré..."
                    : "Décrivez votre suggestion d'amélioration..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  "Envoi..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};