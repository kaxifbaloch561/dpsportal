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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chapter_exercises: {
        Row: {
          answer: string | null
          chapter_number: number
          class_id: number
          correct_option: string | null
          created_at: string
          exercise_type: string
          id: string
          options: Json | null
          question: string
          sort_order: number
          subject_id: string
        }
        Insert: {
          answer?: string | null
          chapter_number: number
          class_id: number
          correct_option?: string | null
          created_at?: string
          exercise_type: string
          id?: string
          options?: Json | null
          question: string
          sort_order?: number
          subject_id: string
        }
        Update: {
          answer?: string | null
          chapter_number?: number
          class_id?: number
          correct_option?: string | null
          created_at?: string
          exercise_type?: string
          id?: string
          options?: Json | null
          question?: string
          sort_order?: number
          subject_id?: string
        }
        Relationships: []
      }
      chapter_qa: {
        Row: {
          answer: string
          chapter_id: string | null
          class_id: number
          created_at: string
          id: string
          keywords: string[]
          question: string
          search_vector: unknown
          subject_id: string
        }
        Insert: {
          answer: string
          chapter_id?: string | null
          class_id: number
          created_at?: string
          id?: string
          keywords?: string[]
          question: string
          search_vector?: unknown
          subject_id: string
        }
        Update: {
          answer?: string
          chapter_id?: string | null
          class_id?: number
          created_at?: string
          id?: string
          keywords?: string[]
          question?: string
          search_vector?: unknown
          subject_id?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          chapter_title: string
          class_id: number
          content: string
          created_at: string
          id: string
          subject_id: string
        }
        Insert: {
          chapter_number: number
          chapter_title: string
          class_id: number
          content: string
          created_at?: string
          id?: string
          subject_id: string
        }
        Update: {
          chapter_number?: number
          chapter_title?: string
          class_id?: number
          content?: string
          created_at?: string
          id?: string
          subject_id?: string
        }
        Relationships: []
      }
      teacher_accounts: {
        Row: {
          avatar_type: string | null
          avatar_url: string | null
          class_teacher: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          middle_name: string | null
          password: string
          status: string | null
          subjects: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_type?: string | null
          avatar_url?: string | null
          class_teacher?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          middle_name?: string | null
          password: string
          status?: string | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_type?: string | null
          avatar_url?: string | null
          class_teacher?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          middle_name?: string | null
          password?: string
          status?: string | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_requests: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          replied_at: string | null
          subject: string
          teacher_email: string
          type: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          replied_at?: string | null
          subject: string
          teacher_email: string
          type: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          replied_at?: string | null
          subject?: string
          teacher_email?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_chapter_qa: {
        Args: {
          p_class_id: number
          p_limit?: number
          p_query: string
          p_subject_id: string
        }
        Returns: {
          answer: string
          question: string
        }[]
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
