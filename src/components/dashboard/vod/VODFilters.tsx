import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter, 
  Calendar, 
  Users, 
  Gamepad2, 
  Tag,
  RotateCcw,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface VODFiltersProps {
  filters: {
    type: string;
    dateRange: string;
    player: string;
    tag: string;
  };
  onFiltersChange: (filters: any) => void;
  teamId: string;
}

const eventTypes = [
  { value: "all", label: "Tous les types" },
  { value: "scrim", label: "Scrimmages" },
  { value: "match", label: "Matchs officiels" },
  { value: "tournoi", label: "Tournois" },
  { value: "entrainement", label: "Entraînements" }
];

const dateRanges = [
  { value: "all", label: "Toutes les dates" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "3months", label: "3 derniers mois" }
];

const tagOptions = [
  { value: "all", label: "Tous les tags" },
  { value: "scrim", label: "Scrims" },
  { value: "officiel", label: "Officiels" },
  { value: "important", label: "Importants" },
  { value: "analyse", label: "À analyser" }
];

export const VODFilters = ({ filters, onFiltersChange, teamId }: VODFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Compter les filtres actifs
    let count = 0;
    if (filters.type !== "all") count++;
    if (filters.dateRange !== "all") count++;
    if (filters.player !== "all") count++;
    if (filters.tag !== "all") count++;
    if (searchTerm.trim()) count++;
    
    setActiveFiltersCount(count);
  }, [filters, searchTerm]);

  const resetFilters = () => {
    onFiltersChange({
      type: "all",
      dateRange: "all",
      player: "all",
      tag: "all"
    });
    setSearchTerm("");
  };

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header avec bouton toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <h3 className="font-medium">Filtres</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Réduire" : "Étendre"}
            </Button>
          </div>
        </div>

        {/* Filtres rapides (toujours visibles) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Type d'événement</label>
            <Select value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <Gamepad2 className="w-3 h-3" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Période</label>
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>{range.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tag</label>
            <Select value={filters.tag} onValueChange={(value) => updateFilter("tag", value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tagOptions.map((tag) => (
                  <SelectItem key={tag.value} value={tag.value}>
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3 h-3" />
                      <span>{tag.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Recherche</label>
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-7"
              />
            </div>
          </div>
        </div>

        {/* Filtres avancés (conditionnels) */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium">Filtres avancés</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Joueur spécifique</label>
                <Select value={filters.player} onValueChange={(value) => updateFilter("player", value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center space-x-2">
                        <Users className="w-3 h-3" />
                        <span>Tous les joueurs</span>
                      </div>
                    </SelectItem>
                    {/* Les joueurs seront chargés dynamiquement */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Durée de VOD</label>
                <Select defaultValue="all">
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes durées</SelectItem>
                    <SelectItem value="short">Courte (&lt; 30min)</SelectItem>
                    <SelectItem value="medium">Moyenne (30-60min)</SelectItem>
                    <SelectItem value="long">Longue (&gt; 60min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Statut d'analyse</label>
                <Select defaultValue="all">
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="analyzed">Analysées</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="shared">Partagées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtres rapides par tag */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Filtres rapides</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.type === "scrim" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("type", filters.type === "scrim" ? "all" : "scrim")}
                  className="text-xs"
                >
                  Scrims
                </Button>
                <Button
                  variant={filters.type === "match" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("type", filters.type === "match" ? "all" : "match")}
                  className="text-xs"
                >
                  Matchs officiels
                </Button>
                <Button
                  variant={filters.dateRange === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("dateRange", filters.dateRange === "week" ? "all" : "week")}
                  className="text-xs"
                >
                  Cette semaine
                </Button>
                <Button
                  variant={filters.tag === "important" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("tag", filters.tag === "important" ? "all" : "important")}
                  className="text-xs"
                >
                  Importants
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Résumé des filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Filtres actifs:</span>
              <div className="flex flex-wrap gap-1">
                {filters.type !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Type: {eventTypes.find(t => t.value === filters.type)?.label}
                  </Badge>
                )}
                {filters.dateRange !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Période: {dateRanges.find(d => d.value === filters.dateRange)?.label}
                  </Badge>
                )}
                {filters.tag !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Tag: {tagOptions.find(t => t.value === filters.tag)?.label}
                  </Badge>
                )}
                {searchTerm.trim() && (
                  <Badge variant="secondary" className="text-xs">
                    Recherche: "{searchTerm}"
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};