// Configuration spécifique pour chaque jeu esport
export interface GameConfig {
  id: string;
  name: string;
  characters: string[];
  maps: string[];
  roles: string[];
  strategyTypes: string[];
  analyticsFields: {
    composition: string[];
    performance: string[];
    objective: string[];
  };
}

export const gameConfigs: Record<string, GameConfig> = {
  valorant: {
    id: "valorant",
    name: "Valorant",
    characters: [
      "Brimstone", "Viper", "Omen", "Killjoy", "Cypher", "Sova", "Sage", "Phoenix",
      "Jett", "Reyna", "Raze", "Breach", "Skye", "Yoru", "Astra", "KAY/O",
      "Chamber", "Neon", "Fade", "Harbor", "Gekko", "Deadlock", "Iso", "Clove", "Vyse"
    ],
    maps: [
      "Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Fracture", 
      "Pearl", "Lotus", "Sunset", "Abyss"
    ],
    roles: ["Duelist", "Initiateur", "Contrôleur", "Sentinelle"],
    strategyTypes: ["Attaque", "Défense", "Anti-eco", "Pistol", "Force"],
    analyticsFields: {
      composition: ["Agent", "Rôle", "Capacités utilisées"],
      performance: ["K/D", "ACS", "ADR", "First kills", "Clutches"],
      objective: ["Sites pris", "Défenses réussies", "Rondes économiques"]
    }
  },
  
  rocket_league: {
    id: "rocket_league",
    name: "Rocket League",
    characters: ["Octane", "Dominus", "Breakout", "Fennec", "Batmobile"],
    maps: [
      "DFH Stadium", "Mannfield", "Champions Field", "Urban Central", 
      "Beckwith Park", "Utopia Coliseum", "Wasteland", "Neo Tokyo",
      "Aquadome", "Starbase ARC", "Farmstead", "Salty Shores",
      "Forbidden Temple", "Rivals Arena", "Neon Fields", "Deadeye Canyon"
    ],
    roles: ["Attaquant", "Milieu", "Défenseur", "Gardien"],
    strategyTypes: ["Rotation", "Passing Play", "Solo Play", "Démolition", "Aérien"],
    analyticsFields: {
      composition: ["Véhicule", "Position", "Style de jeu"],
      performance: ["Buts", "Saves", "Assists", "Score", "Démolitions"],
      objective: ["Possession", "Shots on goal", "Boost management"]
    }
  },

  league_of_legends: {
    id: "league_of_legends", 
    name: "League of Legends",
    characters: [
      "Aatrox", "Ahri", "Akali", "Alistar", "Amumu", "Anivia", "Annie", "Aphelios",
      "Ashe", "Aurelion Sol", "Azir", "Bard", "Blitzcrank", "Brand", "Braum", "Caitlyn",
      "Camille", "Cassiopeia", "Cho'Gath", "Corki", "Darius", "Diana", "Dr. Mundo", "Draven",
      "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio",
      "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Gwen", "Hecarim", "Heimerdinger",
      "Illaoi", "Irelia", "Ivern", "Janna", "Jarvan IV", "Jax", "Jayce", "Jhin",
      "Jinx", "Kai'Sa", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle",
      "Kayn", "Kennen", "Kha'Zix", "Kindred", "Kled", "Kog'Maw", "LeBlanc", "Lee Sin",
      "Leona", "Lillia", "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar",
      "Maokai", "Master Yi", "Miss Fortune", "Mordekaiser", "Morgana", "Nami", "Nasus", "Nautilus"
    ],
    maps: [
      "Summoner's Rift", "ARAM", "Twisted Treeline", "Crystal Scar"
    ],
    roles: ["Top", "Jungle", "Mid", "ADC", "Support"],
    strategyTypes: ["Early Game", "Mid Game", "Late Game", "Team Fight", "Split Push", "Pick"],
    analyticsFields: {
      composition: ["Champion", "Lane", "Build", "Summoner Spells"],
      performance: ["KDA", "CS", "Gold", "Damage", "Vision Score"],
      objective: ["Dragons", "Baron", "Towers", "Inhibitors"]
    }
  },

  csgo: {
    id: "csgo",
    name: "CS:GO / CS2",
    characters: ["Terrorist", "Counter-Terrorist"],
    maps: [
      "Dust2", "Mirage", "Inferno", "Cache", "Overpass", "Nuke", "Train",
      "Cobblestone", "Vertigo", "Ancient", "Anubis"
    ],
    roles: ["Entry Fragger", "AWPer", "Support", "IGL", "Lurker"],
    strategyTypes: ["Attaque", "Défense", "Eco", "Force Buy", "Full Buy", "Anti-eco", "Retake", "Execute"],
    analyticsFields: {
      composition: ["Armes", "Position", "Rôle", "Économie"],
      performance: ["K/D", "ADR", "Rating", "KAST", "Entry frags"],
      objective: ["Sites plantés", "Défuses", "Rondes gagnées"]
    }
  },

  overwatch: {
    id: "overwatch",
    name: "Overwatch 2",
    characters: [
      // Tank
      "D.Va", "Doomfist", "Junker Queen", "Orisa", "Ramattra", "Reinhardt", 
      "Roadhog", "Sigma", "Winston", "Wrecking Ball", "Zarya",
      // DPS
      "Ashe", "Bastion", "Cassidy", "Echo", "Genji", "Hanzo", "Junkrat",
      "Mei", "Pharah", "Reaper", "Soldier: 76", "Sombra", "Symmetra",
      "Torbjörn", "Tracer", "Widowmaker",
      // Support
      "Ana", "Baptiste", "Brigitte", "Kiriko", "Lifeweaver", "Lúcio",
      "Mercy", "Moira", "Zenyatta"
    ],
    maps: [
      "King's Row", "Dorado", "Havana", "Junkertown", "Rialto", "Route 66",
      "Gibraltar", "Hollywood", "Numbani", "Blizzard World", "Eichenwalde",
      "Hanamura", "Temple of Anubis", "Volskaya Industries", "Ilios",
      "Lijiang Tower", "Nepal", "Oasis", "Busan", "Gibraltar", "Circuit Royal"
    ],
    roles: ["Tank", "DPS", "Support"],
    strategyTypes: ["Dive", "Bunker", "Brawl", "Poke", "Rush", "Split"],
    analyticsFields: {
      composition: ["Héros", "Rôle", "Synergie", "Counter picks"],
      performance: ["Eliminations", "Deaths", "Damage", "Healing", "Objective time"],
      objective: ["Points capturés", "Payload progression", "Final blows"]
    }
  },

  cod_warzone: {
    id: "cod_warzone",
    name: "Call of Duty Warzone",
    characters: ["Operator 1", "Operator 2", "Operator 3"],
    maps: [
      "Verdansk", "Rebirth Island", "Fortune's Keep", "Caldera", "Ashika Island",
      "Vondel", "Al Mazrah", "Blacksite"
    ],
    roles: ["Assault", "Support", "Sniper", "Scout"],
    strategyTypes: ["Drop Strategy", "Rotation", "End Game", "Building Clear", "Vehicle"],
    analyticsFields: {
      composition: ["Loadout", "Perks", "Equipment", "Position"],
      performance: ["Kills", "Deaths", "Damage", "Headshots", "Assists"],
      objective: ["Zone rotations", "Contracts completed", "Cash earned"]
    }
  },

  cod_multiplayer: {
    id: "cod_multiplayer",
    name: "Call of Duty Multiplayer",
    characters: ["Assault", "SMG", "LMG", "Sniper", "Marksman"],
    maps: [
      "Nuketown", "Crash", "Shipment", "Rust", "Terminal", "Hijacked",
      "Firing Range", "Standoff", "Express", "Plaza"
    ],
    roles: ["Slayer", "Objective", "Support", "Anchor"],
    strategyTypes: ["Rush", "Hold", "Rotation", "Setup", "Break"],
    analyticsFields: {
      composition: ["Classe", "Arme principale", "Perks", "Scorestreaks"],
      performance: ["K/D", "SPM", "Accuracy", "Headshots", "Time on objective"],
      objective: ["Captures", "Defends", "Plants", "Defuses"]
    }
  },

  apex_legends: {
    id: "apex_legends",
    name: "Apex Legends", 
    characters: [
      "Bloodhound", "Gibraltar", "Lifeline", "Pathfinder", "Wraith", "Bangalore",
      "Caustic", "Mirage", "Octane", "Wattson", "Crypto", "Revenant",
      "Loba", "Rampart", "Horizon", "Fuse", "Valkyrie", "Seer",
      "Ash", "Mad Maggie", "Newcastle", "Vantage", "Catalyst", "Ballistic",
      "Conduit"
    ],
    maps: [
      "Kings Canyon", "World's Edge", "Olympus", "Storm Point", "Broken Moon"
    ],
    roles: ["Assault", "Defensive", "Support", "Recon"],
    strategyTypes: ["Hot Drop", "Rotate", "Third Party", "End Game", "High Ground"],
    analyticsFields: {
      composition: ["Légende", "Classe", "Capacités", "Synergie"],
      performance: ["Kills", "Assists", "Damage", "Revives", "Survie"],
      objective: ["Placement", "Ring damage", "Zone rotations"]
    }
  }
};

export const getGameConfig = (gameId: string): GameConfig | null => {
  return gameConfigs[gameId] || null;
};

export const getAllGames = (): GameConfig[] => {
  return Object.values(gameConfigs);
};