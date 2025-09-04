import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, Users, RefreshCw, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const ROLES = [
  { value: "joueur", label: "Joueur", category: "player" },
  { value: "remplacant", label: "Remplaçant", category: "player" },
  { value: "coach", label: "Coach", category: "staff" },
  { value: "manager", label: "Manager", category: "staff" },
  { value: "capitaine", label: "Capitaine", category: "staff" },
];

export const TeamCodeModal = ({ isOpen, onClose, teamId, teamName }: TeamCodeModalProps) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCodes, setActiveCodes] = useState<any[]>([]);
  const [showCodes, setShowCodes] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateTeamCode = async () => {
    if (!selectedRole) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rôle",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Générer un code unique
      let code = generateRandomCode();
      
      // Vérifier que le code n'existe pas déjà
      let codeExists = true;
      while (codeExists) {
        const { data: existingCode } = await supabase
          .from("team_codes")
          .select("id")
          .eq("code", code)
          .single();
        
        if (!existingCode) {
          codeExists = false;
        } else {
          code = generateRandomCode();
        }
      }

      const { data, error } = await supabase
        .from("team_codes")
        .insert({
          team_id: teamId,
          code,
          created_by: user.id,
          max_uses: maxUses === "" ? null : Number(maxUses),
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedCode(code);
      
      const selectedRoleInfo = ROLES.find(r => r.value === selectedRole);
      const accessType = selectedRoleInfo?.category === "player" ? "joueur" : "staff";
      
      toast({
        title: "Code généré !",
        description: `Code créé pour le rôle ${selectedRoleInfo?.label} (accès ${accessType})`,
      });

      fetchActiveCodes();
      setSelectedRole("");
      setMaxUses("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("team_codes")
        .select("*")
        .eq("team_id", teamId)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActiveCodes(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des codes:", error);
    }
  };

  const deactivateCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from("team_codes")
        .update({ is_active: false })
        .eq("id", codeId);

      if (error) throw error;

      toast({
        title: "Code désactivé",
        description: "Le code a été désactivé avec succès",
      });

      fetchActiveCodes();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le code a été copié dans le presse-papiers",
    });
  };

  const toggleCodeVisibility = (codeId: string) => {
    setShowCodes(prev => ({
      ...prev,
      [codeId]: !prev[codeId]
    }));
  };

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.round(diffHours / 24);
    
    if (diffDays > 1) {
      return `Expire dans ${diffDays} jours`;
    } else if (diffHours > 0) {
      return `Expire dans ${diffHours}h`;
    } else {
      return "Expiré";
    }
  };

  const getUsageInfo = (code: any) => {
    const usedCount = code.used_by ? code.used_by.length : 0;
    const maxUses = code.max_uses;
    
    if (maxUses) {
      return `${usedCount}/${maxUses} utilisations`;
    } else {
      return `${usedCount} utilisation${usedCount > 1 ? 's' : ''}`;
    }
  };

  // Charger les codes actifs à l'ouverture
  useEffect(() => {
    if (isOpen) {
      fetchActiveCodes();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Générer un code d'équipe - {teamName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Génération nouveau code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Créer un nouveau code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle attribué</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Accès Joueur</div>
                        {ROLES.filter(role => role.category === "player").map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center space-x-2">
                              <span>{role.label}</span>
                              <Badge variant="outline" className="text-xs">Joueur</Badge>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="text-xs font-medium text-muted-foreground mb-2 mt-3">Accès Staff</div>
                        {ROLES.filter(role => role.category === "staff").map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center space-x-2">
                              <span>{role.label}</span>
                              <Badge variant="secondary" className="text-xs">Staff</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUses">Limite d'utilisation (optionnel)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    placeholder="Illimité"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value === "" ? "" : parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={generateTeamCode} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  "Générer le code d'équipe"
                )}
              </Button>

              {generatedCode && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Code généré :</span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Valable 30 jours
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={generatedCode} 
                      readOnly 
                      className="text-center font-mono text-lg font-bold bg-background"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Partagez ce code avec la personne à inviter pour qu'elle puisse s'inscrire.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Codes actifs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Codes actifs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeCodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun code actif
                </p>
              ) : (
                <div className="space-y-3">
                  {activeCodes.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold">
                              {showCodes[code.id] ? code.code : "••••••••"}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleCodeVisibility(code.id)}
                              className="h-6 w-6 p-0"
                            >
                              {showCodes[code.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {ROLES.find(r => r.value === "joueur")?.label || "Rôle"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{formatExpirationDate(code.expires_at)}</span>
                          <span>{getUsageInfo(code)}</span>
                          <span>Créé le {new Date(code.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deactivateCode(code.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Désactiver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};