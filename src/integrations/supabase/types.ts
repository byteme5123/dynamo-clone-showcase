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
      admin_users: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
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
          subtitle?: string | null
          title?: string
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
          first_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "super_admin"
      plan_type: "prepaid" | "postpaid"
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
      plan_type: ["prepaid", "postpaid"],
    },
  },
} as const
