import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Crown, 
  Shield, 
  User, 
  UserCheck,
  MoreHorizontal,
  Settings,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeamMembersManagerProps {
  teamId: string;
  onMembersUpdated?: () => void;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    pseudo: string;
    photo_profil?: string;
  } | null;
}

const roleLabels = {
  owner: "Propriétaire",
  manager: "Manager", 
  coach: "Coach",
  capitaine: "Capitaine",
  joueur: "Joueur",
  remplacant: "Remplaçant"
};

const roleIcons = {
  owner: Crown,
  manager: Shield,
  coach: UserCheck,
  capitaine: User,
  joueur: User,
  remplacant: User
};

const roleColors = {
  owner: "bg-yellow-100 text-yellow-800 border-yellow-200",
  manager: "bg-purple-100 text-purple-800 border-purple-200", 
  coach: "bg-blue-100 text-blue-800 border-blue-200",
  capitaine: "bg-green-100 text-green-800 border-green-200",
  joueur: "bg-gray-100 text-gray-800 border-gray-200",
  remplacant: "bg-orange-100 text-orange-800 border-orange-200"
};

export const TeamMembersManager = ({ teamId, onMembersUpdated }: TeamMembersManagerProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [teamId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles:user_id (
            pseudo,
            photo_profil
          )
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMembers((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres de l'équipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("team_members")
        .update({ role: newRole as any })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Rôle mis à jour",
        description: "Le rôle du membre a été modifié avec succès",
      });

      fetchMembers();
      onMembersUpdated?.();
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

  const removeMember = async () => {
    if (!memberToRemove) return;

    try {
      setLoading(true);
      
      // Supprimer les données liées au membre
      await supabase
        .from("player_availabilities")
        .delete()
        .eq("user_id", memberToRemove.user_id)
        .eq("team_id", teamId);

      await supabase
        .from("player_profiles")
        .delete()
        .eq("user_id", memberToRemove.user_id)
        .eq("team_id", teamId);

      // Supprimer le membre de l'équipe
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberToRemove.id);

      if (error) throw error;

      toast({
        title: "Membre supprimé",
        description: `${memberToRemove.profiles?.pseudo || "L'utilisateur"} a été retiré de l'équipe`,
      });

      setMemberToRemove(null);
      fetchMembers();
      onMembersUpdated?.();
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

  const getRoleIcon = (role: string) => {
    const IconComponent = roleIcons[role as keyof typeof roleIcons] || User;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return roleColors[role as keyof typeof roleColors] || roleColors.joueur;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Gestion des membres ({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <Card key={member.id} className="border-l-4 border-l-primary/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <Avatar className="w-10 h-10">
                           <AvatarImage src={member.profiles?.photo_profil} />
                           <AvatarFallback>
                             {member.profiles?.pseudo?.charAt(0).toUpperCase() || "U"}
                           </AvatarFallback>
                         </Avatar>
                        
                        <div>
                           <div className="flex items-center space-x-2">
                             <h4 className="font-medium">{member.profiles?.pseudo || "Utilisateur"}</h4>
                             <Badge className={`${getRoleColor(member.role)} text-xs`}>
                               {getRoleIcon(member.role)}
                               <span className="ml-1">{roleLabels[member.role as keyof typeof roleLabels] || member.role}</span>
                             </Badge>
                           </div>
                          <p className="text-sm text-muted-foreground">
                            Membre depuis le {new Date(member.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                         <Select
                           value={member.role}
                           onValueChange={(newRole: string) => updateMemberRole(member.id, newRole)}
                           disabled={member.role === 'owner'}
                         >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="coach">Coach</SelectItem>
                            <SelectItem value="capitaine">Capitaine</SelectItem>
                            <SelectItem value="joueur">Joueur</SelectItem>
                            <SelectItem value="remplacant">Remplaçant</SelectItem>
                          </SelectContent>
                        </Select>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={member.role === 'owner'}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Settings className="w-4 h-4 mr-2" />
                              Paramètres du membre
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setMemberToRemove(member)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Retirer de l'équipe
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {members.length === 0 && (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun membre dans cette équipe</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invitez des joueurs pour commencer
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer le membre</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer {memberToRemove?.profiles?.pseudo || "cet utilisateur"} de l'équipe ?
              Cette action supprimera également toutes ses données liées à l'équipe (disponibilités, profil, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={removeMember}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Suppression..." : "Retirer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};