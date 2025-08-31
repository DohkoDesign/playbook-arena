import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Save, 
  Download, 
  Share, 
  Copy,
  User,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CoachingNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave?: () => void;
}

interface NoteTemplate {
  id: string;
  name: string;
  template: string;
  category: "individual" | "team" | "strategy" | "general";
}

const noteTemplates: NoteTemplate[] = [
  {
    id: "individual-review",
    name: "Analyse Individuelle",
    template: `## Analyse Joueur: [NOM]

### 🎯 Points Forts
- 
- 
- 

### ⚠️ Points à Améliorer
- 
- 
- 

### 📝 Recommandations
- 
- 
- 

### 🎮 Objectifs pour la prochaine session
- 
- `,
    category: "individual"
  },
  {
    id: "team-review",
    name: "Analyse d'Équipe",
    template: `## Analyse d'Équipe - [DATE]

### 🏆 Ce qui a bien fonctionné
- 
- 
- 

### 🔧 Points d'amélioration
- 
- 
- 

### 🎯 Communication
- 
- 

### 📊 Coordination
- 
- 

### 🎮 Plan d'action
- 
- `,
    category: "team"
  },
  {
    id: "strategy-analysis",
    name: "Analyse Stratégique",
    template: `## Analyse Stratégique - [MAP/MODE]

### 🎯 Stratégies utilisées
- 
- 

### ✅ Exécutions réussies
- 
- 

### ❌ Échecs d'exécution
- 
- 

### 🔄 Adaptations nécessaires
- 
- 

### 📈 Nouvelles stratégies à travailler
- 
- `,
    category: "strategy"
  },
  {
    id: "quick-notes",
    name: "Notes Rapides",
    template: `## Notes Rapides - [SUJET]

### Observations
- 
- 
- 

### Actions immédiates
- 
- 

### À retenir
- `,
    category: "general"
  }
];

const templateCategories = {
  individual: { icon: User, color: "bg-blue-100 text-blue-800", label: "Individuel" },
  team: { icon: Users, color: "bg-green-100 text-green-800", label: "Équipe" },
  strategy: { icon: Target, color: "bg-purple-100 text-purple-800", label: "Stratégie" },
  general: { icon: FileText, color: "bg-orange-100 text-orange-800", label: "Général" }
};

export const CoachingNotes = ({ notes, onNotesChange, onSave }: CoachingNotesProps) => {
  const [activeTab, setActiveTab] = useState("editor");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsUnsaved(true);
  }, [notes]);

  const saveNotes = () => {
    setLastSaved(new Date());
    setIsUnsaved(false);
    onSave?.(); // Appeler la fonction de sauvegarde du parent
    toast({
      title: "Notes sauvegardées",
      description: "Vos notes ont été enregistrées avec succès",
    });
  };

  const applyTemplate = (template: NoteTemplate) => {
    const currentNotes = notes.trim();
    const newContent = currentNotes 
      ? `${currentNotes}\n\n${template.template}`
      : template.template;
    
    onNotesChange(newContent);
    setActiveTab("editor");
    
    toast({
      title: "Modèle appliqué",
      description: `Le modèle "${template.name}" a été ajouté`,
    });
  };

  const exportNotes = () => {
    const blob = new Blob([notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coaching-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Notes exportées",
      description: "Le fichier a été téléchargé",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(notes);
    toast({
      title: "Copié!",
      description: "Les notes ont été copiées dans le presse-papier",
    });
  };

  const shareNotes = () => {
    // Future implementation: partage avec l'équipe
    toast({
      title: "Partage",
      description: "Fonctionnalité de partage à venir...",
    });
  };

  const wordCount = notes.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = notes.length;

  return (
    <div className="space-y-4">
      {/* Header avec statistiques et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <h3 className="text-lg font-medium">Notes Coach</h3>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{wordCount} mots</span>
            <span>{charCount} caractères</span>
            {lastSaved && (
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Sauvé à {lastSaved.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            )}
            {isUnsaved && (
              <Badge variant="outline" className="text-orange-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Non sauvé
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportNotes}
            disabled={!notes.trim()}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!notes.trim()}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copier
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareNotes}
            disabled={!notes.trim()}
          >
            <Share className="w-4 h-4 mr-2" />
            Partager
          </Button>

          <Button
            onClick={saveNotes}
            disabled={!isUnsaved}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Sauvegarder</span>
          </Button>
        </div>
      </div>

      {/* Interface à onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Éditeur</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Modèles</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Aperçu</span>
          </TabsTrigger>
        </TabsList>

        {/* Éditeur de notes */}
        <TabsContent value="editor" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <Textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Commencez à prendre vos notes de coaching...

💡 Conseils :
- Utilisez les modèles pour structurer vos notes
- Ajoutez des timestamps pour référencer des moments précis
- Soyez constructif dans vos commentaires
- Pensez aux actions concrètes à mettre en place

Vous pouvez utiliser le Markdown pour formater vos notes :
- # Titre principal
- ## Sous-titre
- **Texte en gras**
- *Texte en italique*
- - Liste à puces"
                className="min-h-96 font-mono text-sm"
                style={{ resize: 'vertical' }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modèles de notes */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {noteTemplates.map((template) => {
              const categoryConfig = templateCategories[template.category];
              const IconComponent = categoryConfig.icon;
              
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge className={categoryConfig.color}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {categoryConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <pre className="text-xs bg-gray-50 p-3 rounded text-gray-600 mb-4 overflow-hidden">
                      {template.template.substring(0, 200)}...
                    </pre>
                    <Button 
                      onClick={() => applyTemplate(template)}
                      className="w-full"
                      variant="outline"
                    >
                      Utiliser ce modèle
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Aperçu rendu */}
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {notes.trim() ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {notes}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Aucune note à prévisualiser</p>
                  <p className="text-sm mt-1">
                    Commencez à écrire dans l'éditeur pour voir l'aperçu
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Aide rapide */}
      <Card className="bg-muted border">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-2">💡 Conseils pour des notes efficaces</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Structurez vos observations avec les modèles fournis</li>
            <li>• Liez vos commentaires aux timestamps pour référencer des moments précis</li>
            <li>• Soyez spécifique dans vos recommandations</li>
            <li>• Prévoyez des objectifs concrets pour la prochaine session</li>
            <li>• Exportez vos notes pour les partager avec l'équipe</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};