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
      [_ in never]: never
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
    Enums: {},
  },
} as const
