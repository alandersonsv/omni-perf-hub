export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          created_at: string
          email: string
          id: string
          n8n_instance_id: string | null
          name: string
          phone: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          n8n_instance_id?: string | null
          name: string
          phone?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          n8n_instance_id?: string | null
          name?: string
          phone?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      agency_clients: {
        Row: {
          agency_id: string
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          agency_id: string
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          agency_id?: string
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_clients_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts_config: {
        Row: {
          agency_id: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          id: string
          is_active: boolean | null
          notify_time: string | null
          platforms: Json | null
          threshold_value: number | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          agency_id: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          id?: string
          is_active?: boolean | null
          notify_time?: string | null
          platforms?: Json | null
          threshold_value?: number | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          agency_id?: string
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          id?: string
          is_active?: boolean | null
          notify_time?: string | null
          platforms?: Json | null
          threshold_value?: number | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_config_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_campaigns: {
        Row: {
          average_ticket: number | null
          budget: number | null
          campaign_id: string | null
          campaign_name: string
          campaign_type: string | null
          clicks: number | null
          conversion_rate: number | null
          conversion_value: number | null
          conversions: number | null
          cost_per_click: number | null
          cost_per_conversion: number | null
          ctr: number | null
          customer_id: string | null
          date: string | null
          end_date: string | null
          id: number
          impressions: number | null
          roas: number | null
          start_date: string | null
          status: string | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          average_ticket?: number | null
          budget?: number | null
          campaign_id?: string | null
          campaign_name: string
          campaign_type?: string | null
          clicks?: number | null
          conversion_rate?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost_per_click?: number | null
          cost_per_conversion?: number | null
          ctr?: number | null
          customer_id?: string | null
          date?: string | null
          end_date?: string | null
          id?: number
          impressions?: number | null
          roas?: number | null
          start_date?: string | null
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          average_ticket?: number | null
          budget?: number | null
          campaign_id?: string | null
          campaign_name?: string
          campaign_type?: string | null
          clicks?: number | null
          conversion_rate?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost_per_click?: number | null
          cost_per_conversion?: number | null
          ctr?: number | null
          customer_id?: string | null
          date?: string | null
          end_date?: string | null
          id?: number
          impressions?: number | null
          roas?: number | null
          start_date?: string | null
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      google_ads_campaigns_kpi: {
        Row: {
          average_ticket: number | null
          budget: number | null
          campaign_id: string | null
          campaign_name: string
          campaign_type: string | null
          clicks: number | null
          conversion_rate: number | null
          conversion_value: number | null
          conversions: number | null
          cost_per_click: number | null
          cost_per_conversion: number | null
          ctr: number | null
          customer_id: string | null
          date: string | null
          end_date: string | null
          id: number
          impressions: number | null
          roas: number | null
          start_date: string | null
          status: string | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          average_ticket?: number | null
          budget?: number | null
          campaign_id?: string | null
          campaign_name: string
          campaign_type?: string | null
          clicks?: number | null
          conversion_rate?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost_per_click?: number | null
          cost_per_conversion?: number | null
          ctr?: number | null
          customer_id?: string | null
          date?: string | null
          end_date?: string | null
          id?: number
          impressions?: number | null
          roas?: number | null
          start_date?: string | null
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          average_ticket?: number | null
          budget?: number | null
          campaign_id?: string | null
          campaign_name?: string
          campaign_type?: string | null
          clicks?: number | null
          conversion_rate?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost_per_click?: number | null
          cost_per_conversion?: number | null
          ctr?: number | null
          customer_id?: string | null
          date?: string | null
          end_date?: string | null
          id?: number
          impressions?: number | null
          roas?: number | null
          start_date?: string | null
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      google_ads_sync_log: {
        Row: {
          campaigns_synced: number
          created_by: string | null
          error_message: string | null
          id: number
          sync_status: string | null
          sync_timestamp: string | null
          total_campaigns: number
          total_customers: number
        }
        Insert: {
          campaigns_synced?: number
          created_by?: string | null
          error_message?: string | null
          id?: number
          sync_status?: string | null
          sync_timestamp?: string | null
          total_campaigns?: number
          total_customers?: number
        }
        Update: {
          campaigns_synced?: number
          created_by?: string | null
          error_message?: string | null
          id?: number
          sync_status?: string | null
          sync_timestamp?: string | null
          total_campaigns?: number
          total_customers?: number
        }
        Relationships: []
      }
      integrations: {
        Row: {
          account_id: string
          agency_id: string
          created_at: string
          credentials: Json | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at: string
        }
        Insert: {
          account_id: string
          agency_id: string
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          agency_id?: string
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      reports_config: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string
          frequency: Database["public"]["Enums"]["report_frequency"] | null
          id: string
          is_active: boolean | null
          message_template: string | null
          metrics: Json
          name: string
          send_days: Json | null
          send_time: string | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string
          frequency?: Database["public"]["Enums"]["report_frequency"] | null
          id?: string
          is_active?: boolean | null
          message_template?: string | null
          metrics?: Json
          name: string
          send_days?: Json | null
          send_time?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string
          frequency?: Database["public"]["Enums"]["report_frequency"] | null
          id?: string
          is_active?: boolean | null
          message_template?: string | null
          metrics?: Json
          name?: string
          send_days?: Json | null
          send_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_config_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_config_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "agency_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          agency_id: string
          email: string
          id: string
          invited_at: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          accepted_at?: string | null
          agency_id: string
          email: string
          id?: string
          invited_at?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          accepted_at?: string | null
          agency_id?: string
          email?: string
          id?: string
          invited_at?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_connections: {
        Row: {
          agency_id: string
          connected_at: string | null
          created_at: string
          evolution_session_id: string | null
          id: string
          phone_number: string
          qr_code: string | null
          status: Database["public"]["Enums"]["connection_status"] | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          connected_at?: string | null
          created_at?: string
          evolution_session_id?: string | null
          id?: string
          phone_number: string
          qr_code?: string | null
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          connected_at?: string | null
          created_at?: string
          evolution_session_id?: string | null
          id?: string
          phone_number?: string
          qr_code?: string | null
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_google_ads_sync_log: {
        Args: {
          p_total_customers: number
          p_total_campaigns: number
          p_campaigns_synced: number
          p_sync_status?: string
          p_error_message?: string
        }
        Returns: number
      }
    }
    Enums: {
      alert_type:
        | "low_budget"
        | "account_blocked"
        | "api_error"
        | "performance_drop"
      connection_status: "disconnected" | "pending" | "connected"
      platform_type: "meta_ads" | "google_ads" | "ga4" | "search_console"
      report_frequency: "daily" | "weekly" | "monthly"
      subscription_plan: "trial" | "basic" | "premium"
      user_role: "owner" | "admin" | "analyst" | "viewer"
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
      alert_type: [
        "low_budget",
        "account_blocked",
        "api_error",
        "performance_drop",
      ],
      connection_status: ["disconnected", "pending", "connected"],
      platform_type: ["meta_ads", "google_ads", "ga4", "search_console"],
      report_frequency: ["daily", "weekly", "monthly"],
      subscription_plan: ["trial", "basic", "premium"],
      user_role: ["owner", "admin", "analyst", "viewer"],
    },
  },
} as const
