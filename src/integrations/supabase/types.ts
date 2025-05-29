export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_usage: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string | null
          event: string
          event_date: string
          id: string
          value: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          event: string
          event_date: string
          id?: string
          value?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          event?: string
          event_date?: string
          id?: string
          value?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "wallet_analyses"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      wallet_analyses: {
        Row: {
          bio: string
          created_at: string | null
          id: string
          persona: Database["public"]["Enums"]["persona_type"]
          protocol_count: number | null
          risk_score: number
          total_value: number | null
          transaction_count: number | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          bio: string
          created_at?: string | null
          id?: string
          persona: Database["public"]["Enums"]["persona_type"]
          protocol_count?: number | null
          risk_score: number
          total_value?: number | null
          transaction_count?: number | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          bio?: string
          created_at?: string | null
          id?: string
          persona?: Database["public"]["Enums"]["persona_type"]
          protocol_count?: number | null
          risk_score?: number
          total_value?: number | null
          transaction_count?: number | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_badges: {
        Row: {
          created_at: string | null
          description: string
          id: string
          label: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          label: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          label?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_badges_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "wallet_analyses"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      persona_type:
        | "DeFi Degenerate"
        | "NFT Collector"
        | "HODLer"
        | "DAO Governance Expert"
        | "Yield Farmer"
        | "Memecoin Enthusiast"
        | "Blue Chip Investor"
        | "Protocol Explorer"
        | "Liquidity Provider"
        | "Newcomer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      persona_type: [
        "DeFi Degenerate",
        "NFT Collector",
        "HODLer",
        "DAO Governance Expert",
        "Yield Farmer",
        "Memecoin Enthusiast",
        "Blue Chip Investor",
        "Protocol Explorer",
        "Liquidity Provider",
        "Newcomer",
      ],
    },
  },
} as const
