import { supabase } from "@/integrations/supabase/client";

export interface TeamStats {
  // Statistiques de base
  totalMembers: number;
  playersByRole: { [role: string]: number };
  activeMembers: number;
  
  // Événements et matchs
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  
  // Performance des matchs
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  
  // VODs et analyses
  totalVODs: number;
  reviewedVODs: number;
  
  // Disponibilités
  currentWeekAvailabilities: number;
  totalAvailabilitySlots: number;
  availabilityRate: number;
  
  // Feedbacks
  totalFeedbacks: number;
  pendingFeedbacks: number;
  
  // Données pour graphiques
  recentMatches: Array<{
    date: string;
    result: 'win' | 'loss' | 'draw';
    score?: string;
  }>;
  
  performanceOverTime: Array<{
    period: string;
    winRate: number;
    matches: number;
  }>;
}

export class TeamStatsService {
  static async getTeamStats(teamId: string): Promise<TeamStats> {
    try {
      // Récupérer toutes les données en parallèle
      const [
        membersResult,
        eventsResult,
        coachingSessionsResult,
        vodReviewsResult,
        availabilitiesResult,
        feedbacksResult
      ] = await Promise.all([
        // Membres de l'équipe
        supabase
          .from("team_members")
          .select("id, role, created_at, profiles(pseudo)")
          .eq("team_id", teamId),
        
        // Événements
        supabase
          .from("events")
          .select("id, type, date_debut, date_fin, titre, created_at")
          .eq("team_id", teamId)
          .order("date_debut", { ascending: false }),
        
        // Sessions de coaching (pour les résultats des matchs)
        supabase
          .from("coaching_sessions")
          .select("id, resultat, created_at, events(date_debut, titre)")
          .eq("events.team_id", teamId)
          .not("resultat", "is", null),
        
        // VOD reviews
        supabase
          .from("vod_reviews")
          .select("id, created_at, notes")
          .eq("team_id", teamId),
        
        // Disponibilités de la semaine actuelle
        supabase
          .from("player_availabilities")
          .select("id, user_id")
          .eq("team_id", teamId)
          .eq("week_start", this.getCurrentWeekStart()),
        
        // Feedbacks
        supabase
          .from("player_feedbacks")
          .select("id, status, created_at")
          .eq("team_id", teamId)
      ]);

      // Vérifier les erreurs
      if (membersResult.error) throw membersResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (coachingSessionsResult.error) throw coachingSessionsResult.error;
      if (vodReviewsResult.error) throw vodReviewsResult.error;
      if (availabilitiesResult.error) throw availabilitiesResult.error;
      if (feedbacksResult.error) throw feedbacksResult.error;

      const members = membersResult.data || [];
      const events = eventsResult.data || [];
      const coachingSessions = coachingSessionsResult.data || [];
      const vodReviews = vodReviewsResult.data || [];
      const availabilities = availabilitiesResult.data || [];
      const feedbacks = feedbacksResult.data || [];

      // Calculer les statistiques des membres
      const playersByRole = members.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as { [role: string]: number });

      const activeMembers = members.filter(m => 
        ['joueur', 'capitaine', 'remplacant'].includes(m.role)
      ).length;

      // Calculer les statistiques d'événements
      const now = new Date();
      const upcomingEvents = events.filter(e => new Date(e.date_debut) > now).length;
      const pastEvents = events.filter(e => new Date(e.date_debut) <= now).length;

      // Calculer les statistiques de performance des matchs
      const { wins, losses, draws, recentMatches } = this.calculateMatchStats(coachingSessions);
      const totalMatches = wins + losses + draws;
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

      // Calculer les disponibilités
      const uniqueUsers = new Set(availabilities.map(a => a.user_id));
      const availabilityRate = activeMembers > 0 
        ? Math.round((uniqueUsers.size / activeMembers) * 100) 
        : 0;

      // Calculer les feedbacks
      const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending').length;

      // Générer les données de performance dans le temps
      const performanceOverTime = this.calculatePerformanceOverTime(coachingSessions);

      return {
        totalMembers: members.length,
        playersByRole,
        activeMembers,
        
        totalEvents: events.length,
        upcomingEvents,
        pastEvents,
        
        totalMatches,
        wins,
        losses,
        draws,
        winRate,
        
        totalVODs: vodReviews.length,
        reviewedVODs: vodReviews.filter(v => v.notes && v.notes.trim().length > 0).length,
        
        currentWeekAvailabilities: uniqueUsers.size,
        totalAvailabilitySlots: activeMembers,
        availabilityRate,
        
        totalFeedbacks: feedbacks.length,
        pendingFeedbacks,
        
        recentMatches,
        performanceOverTime
      };
    } catch (error) {
      console.error("Erreur lors du calcul des statistiques:", error);
      throw error;
    }
  }

  private static calculateMatchStats(coachingSessions: any[]) {
    let wins = 0;
    let losses = 0; 
    let draws = 0;
    
    const recentMatches = coachingSessions
      .slice(0, 10) // 10 derniers matchs
      .map(session => {
        const result = session.resultat?.toLowerCase() || '';
        let matchResult: 'win' | 'loss' | 'draw' = 'loss';
        
        if (result.includes('victoire') || result.includes('win') || result === 'v') {
          wins++;
          matchResult = 'win';
        } else if (result.includes('défaite') || result.includes('lose') || result.includes('loss') || result === 'd') {
          losses++;
          matchResult = 'loss';
        } else if (result.includes('égalité') || result.includes('draw') || result.includes('nul') || result === 'n') {
          draws++;
          matchResult = 'draw';
        } else {
          losses++; // Par défaut considérer comme défaite
        }
        
        return {
          date: session.events?.date_debut || session.created_at,
          result: matchResult,
          score: session.resultat
        };
      });

    return { wins, losses, draws, recentMatches };
  }

  private static calculatePerformanceOverTime(coachingSessions: any[]) {
    // Grouper les sessions par mois
    const monthlyStats: { [key: string]: { wins: number; total: number } } = {};
    
    coachingSessions.forEach(session => {
      const date = new Date(session.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { wins: 0, total: 0 };
      }
      
      monthlyStats[monthKey].total++;
      
      const result = session.resultat?.toLowerCase() || '';
      if (result.includes('victoire') || result.includes('win') || result === 'v') {
        monthlyStats[monthKey].wins++;
      }
    });

    // Convertir en format pour le graphique
    return Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        period: month,
        winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
        matches: stats.total
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-6); // 6 derniers mois
  }

  private static getCurrentWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split('T')[0];
  }
}