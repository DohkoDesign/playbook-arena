// Configuration spécifique pour chaque jeu
export interface GameConfig {
  name: string;
  players: number;
  characters?: string[];
  maps?: string[];
  roles?: string[];
  positions?: string[];
  customFields?: {
    [key: string]: {
      type: 'select' | 'text' | 'number';
      label: string;
      options?: string[];
    };
  };
  strategyTypes: Array<{ value: string; label: string }>;
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
  valorant: {
    name: "Valorant",
    players: 5,
    characters: [
      "Brimstone", "Viper", "Omen", "Killjoy", "Cypher", "Sova", "Sage", "Phoenix",
      "Jett", "Reyna", "Raze", "Breach", "Skye", "Yoru", "Astra", "KAY/O",
      "Chamber", "Neon", "Fade", "Harbor", "Gekko", "Deadlock", "Iso", "Clove"
    ],
    maps: [
      "Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Fracture", 
      "Pearl", "Lotus", "Sunset", "Abyss"
    ],
    roles: ["Duelist", "Initiator", "Controller", "Sentinel"],
    strategyTypes: [
      { value: "attaque", label: "Attaque" },
      { value: "defense", label: "Défense" },
      { value: "eco", label: "Eco Round" },
      { value: "anti_eco", label: "Anti-Eco" }
    ]
  },
  
  rocket_league: {
    name: "Rocket League",
    players: 3,
    positions: ["Striker", "Midfielder", "Goalkeeper"],
    maps: [
      "DFH Stadium", "Mannfield", "Champions Field", "Urban Central", "Beckwith Park",
      "Utopia Coliseum", "Wasteland", "Neo Tokyo", "Aquadome", "Starbase ARC",
      "Farmstead", "Salty Shores", "DFH Stadium (Stormy)", "Mannfield (Snowy)"
    ],
    customFields: {
      formation: {
        type: 'select',
        label: 'Formation',
        options: ['2-1', '1-2', '1-1-1', 'Rotation']
      },
      kickoff: {
        type: 'select',
        label: 'Stratégie Kickoff',
        options: ['Fast Kickoff', 'Diagonal', 'Fake Kickoff', 'Delayed']
      }
    },
    strategyTypes: [
      { value: "offense", label: "Offensive" },
      { value: "defense", label: "Défensive" },
      { value: "kickoff", label: "Kickoff" },
      { value: "rotation", label: "Rotation" }
    ]
  },
  
  league_of_legends: {
    name: "League of Legends",
    players: 5,
    characters: [
      // Top Laners
      "Aatrox", "Akali", "Camille", "Darius", "Fiora", "Garen", "Gnar", "Irelia", 
      "Jax", "Jayce", "Malphite", "Ornn", "Renekton", "Riven", "Shen", "Teemo",
      // Junglers  
      "Graves", "Hecarim", "Kha'Zix", "Lee Sin", "Nidalee", "Olaf", "Rek'Sai", "Shyvana",
      // Mid Laners
      "Ahri", "Akali", "Anivia", "Azir", "Cassiopeia", "Corki", "Fizz", "Katarina", 
      "LeBlanc", "Lux", "Orianna", "Syndra", "Twisted Fate", "Yasuo", "Zed",
      // ADC
      "Ashe", "Caitlyn", "Draven", "Ezreal", "Jinx", "Kai'Sa", "Lucian", "Miss Fortune",
      "Sivir", "Tristana", "Twitch", "Vayne", "Xayah",
      // Support
      "Alistar", "Braum", "Janna", "Leona", "Lulu", "Morgana", "Nautilus", "Soraka",
      "Thresh", "Zyra"
    ],
    roles: ["Top", "Jungle", "Mid", "ADC", "Support"],
    maps: ["Summoner's Rift"],
    customFields: {
      side: {
        type: 'select',
        label: 'Côté',
        options: ['Blue Side', 'Red Side']
      },
      phase: {
        type: 'select',
        label: 'Phase de jeu',
        options: ['Early Game', 'Mid Game', 'Late Game']
      }
    },
    strategyTypes: [
      { value: "early_game", label: "Early Game" },
      { value: "team_fight", label: "Team Fight" },
      { value: "split_push", label: "Split Push" },
      { value: "objective", label: "Objectifs" },
      { value: "baron", label: "Baron" },
      { value: "dragon", label: "Dragon" }
    ]
  },
  
  counter_strike: {
    name: "Counter-Strike",
    players: 5,
    roles: ["IGL", "Entry Fragger", "Support", "AWPer", "Lurker"],
    maps: [
      "Dust2", "Mirage", "Inferno", "Cache", "Overpass", "Train", "Cobblestone",
      "Nuke", "Vertigo", "Ancient", "Anubis"
    ],
    customFields: {
      side: {
        type: 'select',
        label: 'Côté',
        options: ['Terrorist', 'Counter-Terrorist']
      },
      round_type: {
        type: 'select',
        label: 'Type de round',
        options: ['Pistol', 'Eco', 'Semi-buy', 'Full-buy', 'Force-buy']
      }
    },
    strategyTypes: [
      { value: "t_side", label: "T-Side" },
      { value: "ct_side", label: "CT-Side" },
      { value: "pistol", label: "Pistol Round" },
      { value: "eco", label: "Eco Round" },
      { value: "anti_eco", label: "Anti-Eco" }
    ]
  },
  
  overwatch: {
    name: "Overwatch",
    players: 6,
    characters: [
      // Tank
      "D.Va", "Orisa", "Reinhardt", "Roadhog", "Sigma", "Winston", "Wrecking Ball", "Zarya",
      "Junker Queen", "Ramattra",
      // Damage
      "Ashe", "Bastion", "Cassidy", "Echo", "Genji", "Hanzo", "Junkrat", "Mei", "Pharah",
      "Reaper", "Soldier: 76", "Sombra", "Symmetra", "Torbjörn", "Tracer", "Widowmaker",
      // Support
      "Ana", "Baptiste", "Brigitte", "Kiriko", "Lifeweaver", "Lúcio", "Mercy", "Moira", "Zenyatta"
    ],
    roles: ["Tank", "Damage", "Support"],
    maps: [
      "King's Row", "Numbani", "Hollywood", "Dorado", "Route 66", "Watchpoint: Gibraltar",
      "Temple of Anubis", "Volskaya Industries", "Hanamura", "Ilios", "Lijiang Tower",
      "Nepal", "Oasis", "Busan", "Blizzard World"
    ],
    strategyTypes: [
      { value: "attack", label: "Attaque" },
      { value: "defense", label: "Défense" },
      { value: "dive", label: "Dive Comp" },
      { value: "bunker", label: "Bunker Comp" },
      { value: "rush", label: "Rush" }
    ]
  },
  
  call_of_duty: {
    name: "Call of Duty",
    players: 4,
    roles: ["Assault", "SMG", "Flex", "Support"],
    maps: [
      "Nuketown", "Raid", "Firing Range", "Summit", "Jungle", "Array", "Grid",
      "Villa", "Cracked", "Havana", "Crossroads", "Moscow"
    ],
    customFields: {
      mode: {
        type: 'select',
        label: 'Mode de jeu',
        options: ['Search & Destroy', 'Hardpoint', 'Control', 'Domination']
      }
    },
    strategyTypes: [
      { value: "hardpoint", label: "Hardpoint" },
      { value: "snd", label: "Search & Destroy" },
      { value: "control", label: "Control" },
      { value: "rush", label: "Rush" }
    ]
  },
  
  warzone: {
    name: "Warzone",
    players: 4,
    positions: ["IGL", "Fragger", "Support", "Sniper"],
    maps: ["Verdansk", "Rebirth Island", "Fortune's Keep", "Al Mazrah", "Ashika Island"],
    customFields: {
      zone: {
        type: 'select',
        label: 'Zone de drop',
        options: ['Hot Drop', 'Safe Drop', 'Edge Drop']
      },
      loadout: {
        type: 'text',
        label: 'Loadout principal'
      }
    },
    strategyTypes: [
      { value: "early_game", label: "Early Game" },
      { value: "mid_game", label: "Mid Game" },
      { value: "end_game", label: "End Game" },
      { value: "rotation", label: "Rotation" }
    ]
  },
  
  apex_legends: {
    name: "Apex Legends",
    players: 3,
    characters: [
      "Bloodhound", "Gibraltar", "Lifeline", "Pathfinder", "Wraith", "Bangalore", "Caustic",
      "Mirage", "Octane", "Wattson", "Crypto", "Revenant", "Loba", "Rampart", "Horizon",
      "Fuse", "Valkyrie", "Seer", "Ash", "Mad Maggie", "Newcastle", "Vantage", "Catalyst",
      "Ballistic", "Conduit"
    ],
    roles: ["Assault", "Defensive", "Support", "Recon"],
    maps: ["Kings Canyon", "World's Edge", "Olympus", "Storm Point", "Broken Moon"],
    customFields: {
      position: {
        type: 'select',
        label: 'Position de drop',
        options: ['Hot Zone', 'Mid Tier', 'Safe Zone', 'Edge']
      }
    },
    strategyTypes: [
      { value: "drop", label: "Drop Strategy" },
      { value: "early_game", label: "Early Game" },
      { value: "rotation", label: "Rotation" },
      { value: "end_game", label: "End Game" }
    ]
  }
};

// Fonction utilitaire pour obtenir la config d'un jeu
export const getGameConfig = (gameType: string): GameConfig | null => {
  return GAME_CONFIGS[gameType] || null;
};

// Fonction pour obtenir la liste des jeux disponibles
export const getAvailableGames = () => {
  return Object.entries(GAME_CONFIGS).map(([value, config]) => ({
    value,
    label: config.name,
    players: config.players
  }));
};