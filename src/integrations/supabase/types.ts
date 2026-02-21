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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      chat_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          ended_at: string | null
          id: string
          metadata: Json | null
          session_type: string
          started_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          session_type?: string
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          session_type?: string
          started_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          likes_count: number | null
          user_id: string | null
          whisper_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          user_id?: string | null
          whisper_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          user_id?: string | null
          whisper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_whisper_id_fkey"
            columns: ["whisper_id"]
            isOneToOne: false
            referencedRelation: "whispers"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          file_size: number
          file_type: string
          filename: string
          id: string
          message_id: string | null
          storage_path: string
          thumbnail_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          message_id?: string | null
          storage_path: string
          thumbnail_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          message_id?: string | null
          storage_path?: string
          thumbnail_path?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          category: string | null
          created_at: string
          id: string
          search_term: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          search_term: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          search_term?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_play_audio: boolean
          created_at: string
          font_size: string
          id: string
          notifications_enabled: boolean
          preferences: Json | null
          theme: string
          updated_at: string
          user_id: string | null
          voice_id: string | null
        }
        Insert: {
          auto_play_audio?: boolean
          created_at?: string
          font_size?: string
          id?: string
          notifications_enabled?: boolean
          preferences?: Json | null
          theme?: string
          updated_at?: string
          user_id?: string | null
          voice_id?: string | null
        }
        Update: {
          auto_play_audio?: boolean
          created_at?: string
          font_size?: string
          id?: string
          notifications_enabled?: boolean
          preferences?: Json | null
          theme?: string
          updated_at?: string
          user_id?: string | null
          voice_id?: string | null
        }
        Relationships: []
      }
      whisper_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          whisper_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          whisper_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          whisper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whisper_likes_whisper_id_fkey"
            columns: ["whisper_id"]
            isOneToOne: false
            referencedRelation: "whispers"
            referencedColumns: ["id"]
          },
        ]
      }
      whispers: {
        Row: {
          category: string | null
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          likes_count: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
