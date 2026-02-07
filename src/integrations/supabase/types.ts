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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      delivery_assignments: {
        Row: {
          assignment_type: string
          completed_date: string | null
          created_at: string
          delivery_partner_id: string
          id: string
          notes: string | null
          request_id: string
          scheduled_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assignment_type: string
          completed_date?: string | null
          created_at?: string
          delivery_partner_id: string
          id?: string
          notes?: string | null
          request_id: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assignment_type?: string
          completed_date?: string | null
          created_at?: string
          delivery_partner_id?: string
          id?: string
          notes?: string | null
          request_id?: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "redesign_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      designer_earnings: {
        Row: {
          amount: number
          created_at: string
          designer_id: string
          id: string
          net_amount: number
          paid_at: string | null
          platform_fee: number
          quotation_id: string
          request_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          designer_id: string
          id?: string
          net_amount: number
          paid_at?: string | null
          platform_fee?: number
          quotation_id: string
          request_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          designer_id?: string
          id?: string
          net_amount?: number
          paid_at?: string | null
          platform_fee?: number
          quotation_id?: string
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "designer_earnings_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designer_earnings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "redesign_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      designer_profiles: {
        Row: {
          bio: string | null
          created_at: string
          experience_years: number | null
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          portfolio_url: string | null
          price_range_max: number | null
          price_range_min: number | null
          rating: number | null
          specialties: string[] | null
          total_projects: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          portfolio_url?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          rating?: number | null
          specialties?: string[] | null
          total_projects?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          portfolio_url?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          rating?: number | null
          specialties?: string[] | null
          total_projects?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dress_images: {
        Row: {
          created_at: string
          id: string
          image_type: string | null
          image_url: string
          request_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url: string
          request_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_type?: string | null
          image_url?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dress_images_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "redesign_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          request_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          request_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "redesign_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          after_image_url: string
          before_image_url: string | null
          category: string | null
          created_at: string
          description: string | null
          designer_id: string
          id: string
          is_featured: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          after_image_url: string
          before_image_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          designer_id: string
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string
          before_image_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          designer_id?: string
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          designer_id: string
          estimated_days: number | null
          id: string
          request_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          designer_id: string
          estimated_days?: number | null
          id?: string
          request_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          designer_id?: string
          estimated_days?: number | null
          id?: string
          request_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "redesign_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      redesign_requests: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          customer_id: string
          delivery_address: string | null
          delivery_confirmed: boolean | null
          delivery_date: string | null
          delivery_partner_id: string | null
          description: string | null
          designer_id: string | null
          id: string
          pickup_address: string | null
          pickup_confirmed: boolean | null
          pickup_date: string | null
          status: string | null
          style_preference: string | null
          timeline_weeks: number | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          customer_id: string
          delivery_address?: string | null
          delivery_confirmed?: boolean | null
          delivery_date?: string | null
          delivery_partner_id?: string | null
          description?: string | null
          designer_id?: string | null
          id?: string
          pickup_address?: string | null
          pickup_confirmed?: boolean | null
          pickup_date?: string | null
          status?: string | null
          style_preference?: string | null
          timeline_weeks?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          customer_id?: string
          delivery_address?: string | null
          delivery_confirmed?: boolean | null
          delivery_date?: string | null
          delivery_partner_id?: string | null
          description?: string | null
          designer_id?: string | null
          id?: string
          pickup_address?: string | null
          pickup_confirmed?: boolean | null
          pickup_date?: string | null
          status?: string | null
          style_preference?: string | null
          timeline_weeks?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "designer" | "delivery_partner" | "admin"
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
      app_role: ["customer", "designer", "delivery_partner", "admin"],
    },
  },
} as const
