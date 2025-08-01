import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TrackerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { game, username, platform = "pc" } = await req.json()

    if (!game || !username) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters: game and username" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    let trackerData: TrackerResponse = { success: false, error: "Game not supported" };

    // Simulation des données selon le jeu
    switch (game) {
      case 'valorant':
        trackerData = await fetchValorantStats(username);
        break;
      case 'overwatch':
        trackerData = await fetchOverwatchStats(username);
        break;
      case 'csgo':
        trackerData = await fetchCSGOStats(username);
        break;
      case 'league_of_legends':
        trackerData = await fetchLoLStats(username);
        break;
      case 'apex_legends':
        trackerData = await fetchApexStats(username);
        break;
      case 'rocket_league':
        trackerData = await fetchRocketLeagueStats(username);
        break;
      case 'cod_warzone':
        trackerData = await fetchCODWarzoneStats(username);
        break;
      case 'cod_multiplayer':
        trackerData = await fetchCODMultiplayerStats(username);
        break;
      default:
        trackerData = {
          success: false,
          error: `Tracker not supported for game: ${game}`
        };
    }

    return new Response(JSON.stringify(trackerData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in tracker function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function fetchValorantStats(username: string): Promise<TrackerResponse> {
  // Simulation de données Valorant réalistes
  const mockData = {
    player: {
      username: username,
      rank: "Diamond 2",
      rr: 67,
      peakRank: "Immortal 1"
    },
    stats: {
      matchesPlayed: 342,
      winRate: 67.2,
      kd: 1.32,
      adr: 156.8,
      hs: 24.5,
      acs: 198.4
    },
    recent: {
      last5Games: {
        wins: 3,
        losses: 2,
        avgKD: 1.45,
        avgACS: 203.2
      }
    },
    agents: {
      mostPlayed: "Jett",
      winRateByAgent: {
        "Jett": 72.1,
        "Omen": 64.8,
        "Sage": 58.9
      }
    }
  };

  return {
    success: true,
    data: mockData
  };
}

async function fetchOverwatchStats(username: string): Promise<TrackerResponse> {
  // Simulation de données Overwatch réalistes
  const mockData = {
    player: {
      username: username,
      endorsementLevel: 3,
      competitiveRank: "Platinum",
      sr: 2687
    },
    stats: {
      gamesPlayed: 156,
      winRate: 64.1,
      eliminations: 12.8,
      deaths: 8.2,
      healing: 8542,
      damage: 6234
    },
    heroes: {
      mostPlayed: "Ana",
      playtime: {
        "Ana": "23h 45m",
        "Mercy": "18h 12m",
        "Baptiste": "12h 33m"
      }
    }
  };

  return {
    success: true,
    data: mockData
  };
}

async function fetchCSGOStats(username: string): Promise<TrackerResponse> {
  // Simulation de données CS:GO réalistes
  const mockData = {
    player: {
      username: username,
      rank: "Legendary Eagle Master",
      elo: 1847
    },
    stats: {
      matchesPlayed: 487,
      winRate: 58.7,
      kd: 1.18,
      adr: 78.4,
      hsr: 47.2,
      rating: 1.09
    },
    maps: {
      favoriteMap: "Dust2",
      winRateByMap: {
        "Dust2": 62.4,
        "Mirage": 56.8,
        "Inferno": 61.2
      }
    }
  };

  return {
    success: true,
    data: mockData
  };
}

async function fetchLoLStats(username: string): Promise<TrackerResponse> {
  // Simulation de données League of Legends réalistes
  const mockData = {
    player: {
      username: username,
      rank: "Gold II",
      lp: 45,
      tier: "Gold"
    },
    stats: {
      gamesPlayed: 234,
      winRate: 61.5,
      kda: 2.34,
      averageKills: 8.2,
      averageDeaths: 5.8,
      averageAssists: 9.1
    },
    champions: {
      mostPlayed: "Jinx",
      winRateByChampion: {
        "Jinx": 68.4,
        "Caitlyn": 59.2,
        "Ashe": 63.8
      }
    }
  };

  return {
    success: true,
    data: mockData
  };
}

async function fetchApexStats(username: string): Promise<TrackerResponse> {
  // Simulation de données Apex Legends réalistes
  const mockData = {
    player: {
      username: username,
      level: 187,
      rankScore: 4832,
      rank: "Platinum IV"
    },
    stats: {
      matchesPlayed: 892,
      wins: 78,
      kills: 2341,
      damage: 486203,
      kd: 1.45,
      avgDamage: 545.2
    },
    legends: {
      mostPlayed: "Wraith",
      killsByLegend: {
        "Wraith": 634,
        "Pathfinder": 387,
        "Bloodhound": 298
      }
    }
  };

  return {
    success: true,
    data: mockData
  };
}

async function fetchRocketLeagueStats(username: string): Promise<TrackerResponse> {
  // Simulation de données Rocket League réalistes
  const mockData = {
    player: {
      username: username,
      rank: "Champion I",
      mmr: 1156,
      division: "Div III"
    },
    stats: {
      matchesPlayed: 287,
      winRate: 63.4,
      goals: 1.8,
      saves: 1.2,
      assists: 0.9,
      score: 287.5,
      mvps: 45
    },
    modes: {
      "1v1": { rank: "Diamond III", mmr: 1045 },
      "2v2": { rank: "Champion I", mmr: 1156 },
      "3v3": { rank: "Diamond II", mmr: 967 }
    },
    car: {
      mostUsed: "Octane",
      winRateByCar: {
        "Octane": 65.2,
        "Dominus": 58.7,
        "Fennec": 61.9
      }
    }
  };

  return {
    success: true,
    data: mockData
  };
}

async function fetchCODWarzoneStats(username: string): Promise<TrackerResponse> {
  // Simulation de données COD Warzone réalistes
  const mockData = {
    player: {
      username: username,
      level: 89,
      prestige: 2,
      battlePassTier: 45
    },
    stats: {
      matchesPlayed: 456,
      wins: 23,
      kills: 1247,
      deaths: 892,
      kd: 1.4,
      avgDamage: 1245.7,
      avgPlacement: 15.2,
      topTenFinishes: 156
    },
    weapons: {
      mostUsed: "AK-74",
      killsByWeapon: {
        "AK-74": 287,
        "M4A1": 198,
        "Kar98k": 156
      }
    },
    modes: {
      "Battle Royale": { matches: 234, wins: 18 },
      "Plunder": { matches: 156, wins: 5 },
      "Resurgence": { matches: 66, wins: 0 }
    }
  };

  return {
    success: true,
    data: mockData
  };
}

async function fetchCODMultiplayerStats(username: string): Promise<TrackerResponse> {
  // Simulation de données COD Multiplayer réalistes
  const mockData = {
    player: {
      username: username,
      level: 142,
      prestige: 3,
      battlePassTier: 67
    },
    stats: {
      matchesPlayed: 892,
      wins: 534,
      winRate: 59.9,
      kills: 12847,
      deaths: 8965,
      kd: 1.43,
      spm: 287.5,
      accuracy: 18.7,
      headshots: 1847
    },
    modes: {
      "Team Deathmatch": { matches: 234, kd: 1.52 },
      "Domination": { matches: 198, kd: 1.38 },
      "Search & Destroy": { matches: 156, kd: 1.29 },
      "Hardpoint": { matches: 123, kd: 1.47 }
    },
    weapons: {
      mostUsed: "M4A1",
      killsByWeapon: {
        "M4A1": 2847,
        "AK-74": 2198,
        "MP5": 1756
      }
    }
  };

  return {
    success: true,
    data: mockData
  };
}