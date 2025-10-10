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
      activate_sim_requests: {
        Row: {
          additional_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          id_document_url: string | null
          phone_number: string
          plan_preference: string | null
          sim_card_number: string
          status: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          id_document_url?: string | null
          phone_number: string
          plan_preference?: string | null
          sim_card_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          id_document_url?: string | null
          phone_number?: string
          plan_preference?: string | null
          sim_card_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          failed_login_attempts: number | null
          first_name: string | null
          id: string
          is_active: boolean
          last_ip_address: unknown | null
          last_login_at: string | null
          last_name: string | null
          locked_until: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_ip_address?: unknown | null
          last_login_at?: string | null
          last_name?: string | null
          locked_until?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_ip_address?: unknown | null
          last_login_at?: string | null
          last_name?: string | null
          locked_until?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_forms: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          order_id: string | null
          recipient_email: string
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          recipient_email: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          recipient_email?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_text: string | null
          cta_url: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          page_type: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          page_type?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          page_type?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          email: string
          failure_reason: string | null
          id: string
          ip_address: unknown
          success: boolean
          timestamp: string | null
        }
        Insert: {
          email: string
          failure_reason?: string | null
          id?: string
          ip_address: unknown
          success?: boolean
          timestamp?: string | null
        }
        Update: {
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          timestamp?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          captured_at: string | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          ip_address: unknown | null
          payment_attempts: number | null
          paypal_capture_id: string | null
          paypal_order_id: string | null
          paypal_payment_id: string | null
          plan_id: string | null
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          captured_at?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          ip_address?: unknown | null
          payment_attempts?: number | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          paypal_payment_id?: string | null
          plan_id?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          captured_at?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          ip_address?: unknown | null
          payment_attempts?: number | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          paypal_payment_id?: string | null
          plan_id?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          created_at: string | null
          environment: string | null
          id: string
          is_active: boolean | null
          live_client_id: string | null
          live_client_secret: string | null
          sandbox_client_id: string | null
          sandbox_client_secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          live_client_id?: string | null
          live_client_secret?: string | null
          sandbox_client_id?: string | null
          sandbox_client_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          live_client_id?: string | null
          live_client_secret?: string | null
          sandbox_client_id?: string | null
          sandbox_client_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      paypal_settings: {
        Row: {
          created_at: string
          environment: string
          id: string
          is_active: boolean | null
          live_client_id: string | null
          live_client_secret: string | null
          sandbox_client_id: string | null
          sandbox_client_secret: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean | null
          live_client_id?: string | null
          live_client_secret?: string | null
          sandbox_client_id?: string | null
          sandbox_client_secret?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean | null
          live_client_id?: string | null
          live_client_secret?: string | null
          sandbox_client_id?: string | null
          sandbox_client_secret?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          call_minutes: string | null
          countries: string[] | null
          created_at: string
          currency: string
          data_limit: string | null
          description: string | null
          display_order: number | null
          external_link: string | null
          features: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          price: number
          slug: string
          sms_limit: string | null
          updated_at: string
          validity_days: number | null
        }
        Insert: {
          call_minutes?: string | null
          countries?: string[] | null
          created_at?: string
          currency?: string
          data_limit?: string | null
          description?: string | null
          display_order?: number | null
          external_link?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          price: number
          slug: string
          sms_limit?: string | null
          updated_at?: string
          validity_days?: number | null
        }
        Update: {
          call_minutes?: string | null
          countries?: string[] | null
          created_at?: string
          currency?: string
          data_limit?: string | null
          description?: string | null
          display_order?: number | null
          external_link?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          price?: number
          slug?: string
          sms_limit?: string | null
          updated_at?: string
          validity_days?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          failed_login_attempts: number | null
          first_name: string | null
          id: string
          last_ip_address: unknown | null
          last_name: string | null
          locked_until: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          failed_login_attempts?: number | null
          first_name?: string | null
          id: string
          last_ip_address?: unknown | null
          last_name?: string | null
          locked_until?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string
          last_ip_address?: unknown | null
          last_name?: string | null
          locked_until?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          created_at: string
          id: string
          keywords: string | null
          meta_description: string | null
          meta_title: string
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          page_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          keywords?: string | null
          meta_description?: string | null
          meta_title: string
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          keywords?: string | null
          meta_description?: string | null
          meta_title?: string
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          type: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          type?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          type?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          company: string | null
          content: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          rating: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          rating?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          rating?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          ip_address: unknown | null
          payment_method: string | null
          paypal_order_id: string | null
          paypal_transaction_id: string | null
          plan_id: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          ip_address?: unknown | null
          payment_method?: string | null
          paypal_order_id?: string | null
          paypal_transaction_id?: string | null
          plan_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          ip_address?: unknown | null
          payment_method?: string | null
          paypal_order_id?: string | null
          paypal_transaction_id?: string | null
          plan_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          category: string | null
          created_at: string
          en: string
          es: string
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          en: string
          es: string
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          en?: string
          es?: string
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: unknown | null
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          fingerprint: string | null
          id: string
          ip_address: unknown | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wireless_pbx_content: {
        Row: {
          content: string | null
          created_at: string
          cta_text: string | null
          cta_url: string | null
          display_order: number | null
          features: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          section: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          section: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          section?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_email: string
          p_ip_address: unknown
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_user_by_id: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          first_name: string
          id: string
          is_active: boolean
          last_login_at: string
          last_name: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }[]
      }
      get_current_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          failed_login_attempts: number | null
          first_name: string | null
          id: string
          is_active: boolean
          last_ip_address: unknown | null
          last_login_at: string | null
          last_name: string | null
          locked_until: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
      }
      increment_failed_login_attempts: {
        Args: { p_ip_address: unknown; p_user_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_locked: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      log_login_attempt: {
        Args: {
          p_email: string
          p_failure_reason?: string
          p_ip_address: unknown
          p_success: boolean
        }
        Returns: undefined
      }
      update_user_login_info: {
        Args: { p_ip_address: unknown; p_user_agent: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "super_admin"
      plan_type: "prepaid" | "postpaid" | "domestic" | "special"
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
      app_role: ["admin", "super_admin"],
      plan_type: ["prepaid", "postpaid", "domestic", "special"],
    },
  },
} as const
