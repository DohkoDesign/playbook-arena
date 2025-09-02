import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [betaCodes, setBetaCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBetaCodes();
  }, []);

  const fetchBetaCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('beta_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBetaCodes(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des codes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les codes beta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    if (!teamName.trim()) return;
    
    const baseCode = teamName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 8);
    
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const generatedCode = `${baseCode}-${randomSuffix}`.toUpperCase();
    
    setCustomCode(generatedCode);
  };

  const createBetaCode = async () => {
    if (!teamName.trim() || !customCode.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom d'équipe et le code",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { error } = await supabase
        .from('beta_codes')
        .insert({
          code: customCode.toUpperCase(),
          team_name: teamName.trim(),
          expires_at: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString() // 6 mois
        });

      if (error) {
        if (error.code === '23505') { // Contrainte d'unicité
          toast({
            title: "Erreur",
            description: "Ce code existe déjà, veuillez en choisir un autre",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Succès",
        description: `Code beta créé pour l'équipe ${teamName}`
      });

      // Reset du formulaire
      setTeamName('');
      setCustomCode('');
      setNotes('');
      
      // Refresh de la liste
      fetchBetaCodes();
    } catch (error) {
      console.error('Erreur lors de la création du code:', error);
      toast({
        title: "Erreur", 
        description: "Erreur lors de la création du code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteBetaCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('beta_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Code beta supprimé"
      });

      fetchBetaCodes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du code",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Administration - Codes Beta</h1>
        </div>
        <Badge variant="secondary">Admin: dohkoworld@gmail.com</Badge>
      </div>

      {/* Formulaire de création */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Créer un nouveau code beta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamName">Nom de l'équipe</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ex: Team Vitality"
              />
            </div>
            <div>
              <Label htmlFor="customCode">Code beta</Label>
              <div className="flex gap-2">
                <Input
                  id="customCode"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="Ex: VITALITY-ABC123"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateCode}
                  disabled={!teamName.trim()}
                >
                  Générer
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes pour ce code..."
              rows={2}
            />
          </div>

          <Button 
            onClick={createBetaCode}
            disabled={isGenerating || !teamName.trim() || !customCode.trim()}
            className="w-full md:w-auto"
          >
            {isGenerating ? 'Création...' : 'Créer le code beta'}
          </Button>
        </CardContent>
      </Card>

      {/* Liste des codes existants */}
      <Card>
        <CardHeader>
          <CardTitle>Codes beta existants ({betaCodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {betaCodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun code beta créé pour le moment
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Équipe</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Expire le</TableHead>
                  <TableHead>Utilisé par</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {betaCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.team_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {code.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.used_at ? "destructive" : "default"}>
                        {code.used_at ? "Utilisé" : "Disponible"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(code.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {new Date(code.expires_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {code.used_at ? (
                        <div>
                          <div>{new Date(code.used_at).toLocaleDateString('fr-FR')}</div>
                          {code.used_by && <div className="text-sm text-muted-foreground">{code.used_by}</div>}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBetaCode(code.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;