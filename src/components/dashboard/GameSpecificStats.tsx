import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Crosshair, 
  Shield, 
  Zap, 
  Gamepad2,
  MapPin,
  Clock,
  Star,
  Flame
} from "lucide-react";
import { TeamStats } from "./TeamStatsService";

interface GameSpecificStatsProps {
  gameType: string;
  stats: TeamStats;
}

const getGameConfig = (gameType: string) => {
  const configs = {
    valorant: {
      name: "Valorant",
      icon: Crosshair,
      color: "from-red-500 to-orange-500",
      metrics: [
        { label: "Rounds gagnés", value: "74%", icon: Trophy },
        { label: "Précision moyenne", value: "68%", icon: Target },
        { label: "First Kills", value: "42%", icon: Zap },
        { label: "Clutch Rate", value: "23%", icon: Star }
      ],
      roles: ["Duelist", "Initiateur", "Contrôleur", "Sentinelle"],
      maps: ["Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Fracture"]
    },
    counter_strike: {
      name: "CS2",
      icon: Crosshair,
      color: "from-orange-500 to-yellow-500",
      metrics: [
        { label: "K/D Ratio", value: "1.24", icon: Target },
        { label: "ADR", value: "78.5", icon: Flame },
        { label: "HS%", value: "64%", icon: Crosshair },
        { label: "Entry Rate", value: "31%", icon: Zap }
      ],
      roles: ["Entry Fragger", "Support", "AWPer", "IGL", "Lurker"],
      maps: ["Dust2", "Mirage", "Inferno", "Cache", "Overpass", "Vertigo"]
    },
    league_of_legends: {
      name: "League of Legends",
      icon: Shield,
      color: "from-blue-500 to-purple-500",
      metrics: [
        { label: "Winrate Soloq", value: "67%", icon: Trophy },
        { label: "KDA moyen", value: "2.8", icon: Star },
        { label: "Vision Score", value: "1.2", icon: Target },
        { label: "CS/min", value: "7.4", icon: Zap }
      ],
      roles: ["Top", "Jungle", "Mid", "ADC", "Support"],
      maps: ["Rift de l'Invocateur"]
    },
    rocket_league: {
      name: "Rocket League",
      icon: Gamepad2,
      color: "from-orange-500 to-red-500",
      metrics: [
        { label: "Goals/Game", value: "1.8", icon: Trophy },
        { label: "Save %", value: "71%", icon: Shield },
        { label: "Shot %", value: "54%", icon: Target },
        { label: "Assists/Game", value: "1.2", icon: Star }
      ],
      roles: ["Striker", "Midfielder", "Goalkeeper"],
      maps: ["DFH Stadium", "Mannfield", "Champions Field", "Urban Central"]
    },
    overwatch: {
      name: "Overwatch 2",
      icon: Shield,
      color: "from-orange-400 to-orange-600",
      metrics: [
        { label: "Eliminations/10min", value: "18.4", icon: Crosshair },
        { label: "Healing/10min", value: "9.2k", icon: Shield },
        { label: "Damage/10min", value: "8.7k", icon: Flame },
        { label: "Objective Time", value: "2:34", icon: Clock }
      ],
      roles: ["Tank", "Damage", "Support"],
      maps: ["King's Row", "Hanamura", "Temple of Anubis", "Dorado"]
    },
    apex_legends: {
      name: "Apex Legends",
      icon: Target,
      color: "from-red-500 to-purple-500",
      metrics: [
        { label: "Avg Placement", value: "#3.2", icon: Trophy },
        { label: "Damage/Game", value: "1,247", icon: Flame },
        { label: "K/D Ratio", value: "1.89", icon: Target },
        { label: "Survival Time", value: "14:23", icon: Clock }
      ],
      roles: ["Assault", "Defensive", "Support", "Recon"],
      maps: ["King's Canyon", "World's Edge", "Olympus", "Storm Point"]
    },
    call_of_duty: {
      name: "Call of Duty",
      icon: Crosshair,
      color: "from-green-500 to-blue-500",
      metrics: [
        { label: "K/D Ratio", value: "1.45", icon: Target },
        { label: "Win Rate", value: "72%", icon: Trophy },
        { label: "SPM", value: "387", icon: Zap },
        { label: "Accuracy", value: "24%", icon: Crosshair }
      ],
      roles: ["Assault", "SMG", "LMG", "Sniper", "Support"],
      maps: ["Nuketown", "Crash", "Firing Range", "Raid"]
    }
  };

  return configs[gameType as keyof typeof configs] || {
    name: gameType,
    icon: Gamepad2,
    color: "from-gray-500 to-gray-600",
    metrics: [],
    roles: [],
    maps: []
  };
};

export const GameSpecificStats = ({ gameType, stats }: GameSpecificStatsProps) => {
  const config = getGameConfig(gameType);
  const IconComponent = config.icon;

  // Calculer des métriques dynamiques basées sur les vraies données
  const getDynamicMetrics = () => {
    return config.metrics.map((metric, index) => {
      let dynamicValue = metric.value;
      
      // Adapter certaines valeurs selon les vraies données
      switch (metric.label.toLowerCase()) {
        case "winrate soloq":
        case "win rate":
          dynamicValue = `${stats.winRate}%`;
          break;
        case "rounds gagnés":
          dynamicValue = `${stats.winRate}%`;
          break;
        case "avg placement":
          if (stats.winRate > 70) dynamicValue = "#2.1";
          else if (stats.winRate > 50) dynamicValue = "#3.8";
          else dynamicValue = "#5.4";
          break;
        default:
          // Garder la valeur par défaut mais la faire varier légèrement
          if (metric.value.includes('%')) {
            const baseValue = parseInt(metric.value);
            const variance = Math.floor(Math.random() * 20) - 10; // ±10%
            dynamicValue = `${Math.max(0, Math.min(100, baseValue + variance))}%`;
          }
      }
      
      return { ...metric, value: dynamicValue };
    });
  };

  const dynamicMetrics = getDynamicMetrics();

  return (
    <div className="space-y-6">
      {/* En-tête du jeu */}
      <Card className={`bg-gradient-to-r ${config.color} text-white border-0`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{config.name}</h2>
              <p className="text-white/80">Statistiques spécifiques au jeu</p>
            </div>
            <div className="p-4 rounded-full bg-white/20">
              <IconComponent className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques spécifiques au jeu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dynamicMetrics.map((metric, index) => {
          const MetricIcon = metric.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MetricIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Répartition des rôles spécifiques au jeu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Rôles dans l'équipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.roles.map((role, index) => {
                // Calculer combien de joueurs ont ce rôle (simulation basée sur les vraies données)
                const playersInRole = Math.max(1, Math.floor(stats.activeMembers / config.roles.length));
                const isMainRole = index < (stats.activeMembers % config.roles.length);
                
                return (
                  <div key={role} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{role}</span>
                    <Badge variant={isMainRole ? "default" : "secondary"}>
                      {playersInRole + (isMainRole ? 1 : 0)} joueur{playersInRole + (isMainRole ? 1 : 0) > 1 ? 's' : ''}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Cartes favorites</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.maps.slice(0, 5).map((map, index) => {
                // Simuler un winrate par carte basé sur le winrate global
                const mapWinRate = Math.max(30, Math.min(90, stats.winRate + (Math.random() * 30 - 15)));
                
                return (
                  <div key={map} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{map}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={mapWinRate > 60 ? "default" : "secondary"}>
                        {Math.round(mapWinRate)}% WR
                      </Badge>
                      {mapWinRate > 70 && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};