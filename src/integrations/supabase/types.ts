export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      beta_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          team_name: string | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          team_name?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          team_name?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          composition_adversaire: Json | null
          composition_equipe: Json | null
          created_at: string
          event_id: string
          id: string
          notes: string | null
          resultat: string | null
          updated_at: string
          vods: Json | null
        }
        Insert: {
          composition_adversaire?: Json | null
          composition_equipe?: Json | null
          created_at?: string
          event_id: string
          id?: string
          notes?: string | null
          resultat?: string | null
          updated_at?: string
          vods?: Json | null
        }
        Update: {
          composition_adversaire?: Json | null
          composition_equipe?: Json | null
          created_at?: string
          event_id?: string
          id?: string
          notes?: string | null
          resultat?: string | null
          updated_at?: string
          vods?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          date_debut: string
          date_fin: string
          description: string | null
          id: string
          map_name: string | null
          team_id: string
          titre: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          date_debut: string
          date_fin: string
          description?: string | null
          id?: string
          map_name?: string | null
          team_id: string
          titre: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date_debut?: string
          date_fin?: string
          description?: string | null
          id?: string
          map_name?: string | null
          team_id?: string
          titre?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          responded_by: string
          response_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          responded_by: string
          response_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          responded_by?: string
          response_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "player_feedbacks"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["player_role"]
          team_id: string
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          role: Database["public"]["Enums"]["player_role"]
          team_id: string
          token: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["player_role"]
          team_id?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          team_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          team_id: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          team_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      player_availabilities: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          team_id: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          team_id: string
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          team_id?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      player_feedbacks: {
        Row: {
          category: string
          contact_email: string | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          status: string
          team_id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          contact_email?: string | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          status?: string
          team_id: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          contact_email?: string | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      player_personal_events: {
        Row: {
          created_at: string
          created_by: string
          date_end: string
          date_start: string
          description: string | null
          id: string
          player_id: string
          team_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          date_end: string
          date_start: string
          description?: string | null
          id?: string
          player_id: string
          team_id: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date_end?: string
          date_start?: string
          description?: string | null
          id?: string
          player_id?: string
          team_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_profiles: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          objectifs_individuels: string[] | null
          points_faibles: string[] | null
          points_forts: string[] | null
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          objectifs_individuels?: string[] | null
          points_faibles?: string[] | null
          points_forts?: string[] | null
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          objectifs_individuels?: string[] | null
          points_faibles?: string[] | null
          points_forts?: string[] | null
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_staff: boolean | null
          jeux_joues: string[] | null
          personnages_favoris: string[] | null
          photo_profil: string | null
          pseudo: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff?: boolean | null
          jeux_joues?: string[] | null
          personnages_favoris?: string[] | null
          photo_profil?: string | null
          pseudo: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_staff?: boolean | null
          jeux_joues?: string[] | null
          personnages_favoris?: string[] | null
          photo_profil?: string | null
          pseudo?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          personnages_favoris: string[] | null
          role: Database["public"]["Enums"]["player_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          personnages_favoris?: string[] | null
          role?: Database["public"]["Enums"]["player_role"]
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          personnages_favoris?: string[] | null
          role?: Database["public"]["Enums"]["player_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          id: string
          jeu: Database["public"]["Enums"]["game_type"]
          logo: string | null
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          jeu: Database["public"]["Enums"]["game_type"]
          logo?: string | null
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          jeu?: Database["public"]["Enums"]["game_type"]
          logo?: string | null
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      vod_reviews: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          notes: string | null
          team_id: string | null
          timestamps: Json | null
          updated_at: string
          vod_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          notes?: string | null
          team_id?: string | null
          timestamps?: Json | null
          updated_at?: string
          vod_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          team_id?: string | null
          timestamps?: Json | null
          updated_at?: string
          vod_id?: string
        }
        Relationships: []
      }
      vod_shares: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          include_notes: boolean | null
          include_timestamps: boolean | null
          message: string | null
          review_id: string | null
          title: string
          vod_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          include_notes?: boolean | null
          include_timestamps?: boolean | null
          message?: string | null
          review_id?: string | null
          title: string
          vod_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          include_notes?: boolean | null
          include_timestamps?: boolean | null
          message?: string | null
          review_id?: string | null
          title?: string
          vod_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_intelligent_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_admin_role: {
        Args: { team_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      has_management_role: {
        Args: { team_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      has_team_role: {
        Args: {
          required_role: Database["public"]["Enums"]["player_role"]
          team_uuid: string
          user_uuid?: string
        }
        Returns: boolean
      }
      has_valid_invitation: {
        Args: { team_uuid: string }
        Returns: boolean
      }
      is_staff_of_team_with_player: {
        Args: { player_user_id: string }
        Returns: boolean
      }
      is_staff_user: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { team_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      log_security_event: {
        Args: { event_type: string; metadata?: Json; user_id?: string }
        Returns: undefined
      }
      validate_and_use_beta_code: {
        Args: { beta_code: string; user_id: string }
        Returns: boolean
      }
      validate_password: {
        Args: { password: string }
        Returns: boolean
      }
      validate_role_change: {
        Args: {
          new_role: Database["public"]["Enums"]["player_role"]
          target_team_id: string
          target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      event_type:
        | "scrim"
        | "match"
        | "tournoi"
        | "coaching"
        | "session_individuelle"
      game_type:
        | "valorant"
        | "rocket_league"
        | "league_of_legends"
        | "counter_strike"
        | "overwatch"
        | "apex_legends"
        | "fortnite"
        | "call_of_duty"
        | "rainbow_six"
        | "dota2"
        | "fifa"
        | "street_fighter"
        | "tekken"
        | "mortal_kombat"
        | "hearthstone"
        | "starcraft2"
        | "age_of_empires"
        | "world_of_warcraft"
        | "pubg"
        | "fall_guys"
        | "among_us"
        | "minecraft"
        | "chess"
        | "trackmania"
        | "rocket_league_sideswipe"
        | "csgo"
        | "cod_warzone"
        | "cod_multiplayer"
      player_role:
        | "joueur"
        | "remplacant"
        | "coach"
        | "manager"
        | "capitaine"
        | "test"
        | "owner"
      user_role: "staff" | "player"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: [
        "scrim",
        "match",
        "tournoi",
        "coaching",
        "session_individuelle",
      ],
      game_type: [
        "valorant",
        "rocket_league",
        "league_of_legends",
        "counter_strike",
        "overwatch",
        "apex_legends",
        "fortnite",
        "call_of_duty",
        "rainbow_six",
        "dota2",
        "fifa",
        "street_fighter",
        "tekken",
        "mortal_kombat",
        "hearthstone",
        "starcraft2",
        "age_of_empires",
        "world_of_warcraft",
        "pubg",
        "fall_guys",
        "among_us",
        "minecraft",
        "chess",
        "trackmania",
        "rocket_league_sideswipe",
        "csgo",
        "cod_warzone",
        "cod_multiplayer",
      ],
      player_role: [
        "joueur",
        "remplacant",
        "coach",
        "manager",
        "capitaine",
        "test",
        "owner",
      ],
      user_role: ["staff", "player"],
    },
  },
} as const
