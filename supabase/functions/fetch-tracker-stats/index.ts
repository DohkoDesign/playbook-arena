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