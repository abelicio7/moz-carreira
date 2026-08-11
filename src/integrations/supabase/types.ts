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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      cartas: {
        Row: {
          conteudo: string
          created_at: string
          curriculo_id: string | null
          id: string
          idioma: string
          tipo: Database["public"]["Enums"]["carta_tipo"]
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo?: string
          created_at?: string
          curriculo_id?: string | null
          id?: string
          idioma?: string
          tipo?: Database["public"]["Enums"]["carta_tipo"]
          titulo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          curriculo_id?: string | null
          id?: string
          idioma?: string
          tipo?: Database["public"]["Enums"]["carta_tipo"]
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cartas_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
      }
      certificados: {
        Row: {
          created_at: string
          curriculo_id: string
          data: string | null
          id: string
          instituicao: string | null
          nome: string
          ordem: number
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          curriculo_id: string
          data?: string | null
          id?: string
          instituicao?: string | null
          nome?: string
          ordem?: number
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          curriculo_id?: string
          data?: string | null
          id?: string
          instituicao?: string | null
          nome?: string
          ordem?: number
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
      }
      competencias: {
        Row: {
          created_at: string
          curriculo_id: string
          id: string
          nivel: number
          nome: string
          ordem: number
          user_id: string
        }
        Insert: {
          created_at?: string
          curriculo_id: string
          id?: string
          nivel?: number
          nome?: string
          ordem?: number
          user_id: string
        }
        Update: {
          created_at?: string
          curriculo_id?: string
          id?: string
          nivel?: number
          nome?: string
          ordem?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competencias_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculos: {
        Row: {
          cor_principal: string
          created_at: string
          dados_pessoais: Json
          espacamento: string
          foto: string | null
          id: string
          idioma: string
          modelo: string
          ordem_seccoes: Json
          pago: boolean
          seccoes_visiveis: Json
          status: Database["public"]["Enums"]["cv_status"]
          tamanho_fonte: number
          tipografia: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cor_principal?: string
          created_at?: string
          dados_pessoais?: Json
          espacamento?: string
          foto?: string | null
          id?: string
          idioma?: string
          modelo?: string
          ordem_seccoes?: Json
          pago?: boolean
          seccoes_visiveis?: Json
          status?: Database["public"]["Enums"]["cv_status"]
          tamanho_fonte?: number
          tipografia?: string
          titulo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cor_principal?: string
          created_at?: string
          dados_pessoais?: Json
          espacamento?: string
          foto?: string | null
          id?: string
          idioma?: string
          modelo?: string
          ordem_seccoes?: Json
          pago?: boolean
          seccoes_visiveis?: Json
          status?: Database["public"]["Enums"]["cv_status"]
          tamanho_fonte?: number
          tipografia?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiencias: {
        Row: {
          atual: boolean
          cargo: string
          created_at: string
          curriculo_id: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          empresa: string
          id: string
          local: string | null
          ordem: number
          user_id: string
        }
        Insert: {
          atual?: boolean
          cargo?: string
          created_at?: string
          curriculo_id: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa?: string
          id?: string
          local?: string | null
          ordem?: number
          user_id: string
        }
        Update: {
          atual?: boolean
          cargo?: string
          created_at?: string
          curriculo_id?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa?: string
          id?: string
          local?: string | null
          ordem?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiencias_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
      }
      formacoes: {
        Row: {
          atual: boolean
          created_at: string
          curriculo_id: string
          curso: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          instituicao: string
          nivel: string | null
          ordem: number
          user_id: string
        }
        Insert: {
          atual?: boolean
          created_at?: string
          curriculo_id: string
          curso?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          instituicao?: string
          nivel?: string | null
          ordem?: number
          user_id: string
        }
        Update: {
          atual?: boolean
          created_at?: string
          curriculo_id?: string
          curso?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          instituicao?: string
          nivel?: string | null
          ordem?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formacoes_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
      }
      idiomas: {
        Row: {
          created_at: string
          curriculo_id: string
          id: string
          idioma: string
          nivel: string
          ordem: number
          user_id: string
        }
        Insert: {
          created_at?: string
          curriculo_id: string
          id?: string
          idioma?: string
          nivel?: string
          ordem?: number
          user_id: string
        }
        Update: {
          created_at?: string
          curriculo_id?: string
          id?: string
          idioma?: string
          nivel?: string
          ordem?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idiomas_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          idioma: string
          nome: string
          pais: string
          plano: Database["public"]["Enums"]["plano_tipo"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          idioma?: string
          nome?: string
          pais?: string
          plano?: Database["public"]["Enums"]["plano_tipo"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          idioma?: string
          nome?: string
          pais?: string
          plano?: Database["public"]["Enums"]["plano_tipo"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          created_at: string
          curriculo_id: string
          data: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          curriculo_id: string
          data?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          curriculo_id?: string
          data?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
      }
      referencias: {
        Row: {
          cargo: string | null
          created_at: string
          curriculo_id: string
          email: string | null
          empresa: string | null
          id: string
          nome: string
          ordem: number
          telefone: string | null
          user_id: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          curriculo_id: string
          email?: string | null
          empresa?: string | null
          id?: string
          nome?: string
          ordem?: number
          telefone?: string | null
          user_id: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          curriculo_id?: string
          email?: string | null
          empresa?: string | null
          id?: string
          nome?: string
          ordem?: number
          telefone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referencias_curriculo_id_fkey"
            columns: ["curriculo_id"]
            isOneToOne: false
            referencedRelation: "curriculos"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      carta_tipo: "apresentacao" | "motivacao"
      cv_status: "rascunho" | "concluido" | "arquivado"
      plano_tipo: "gratuito" | "premium"
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
      app_role: ["admin", "user"],
      carta_tipo: ["apresentacao", "motivacao"],
      cv_status: ["rascunho", "concluido", "arquivado"],
      plano_tipo: ["gratuito", "premium"],
    },
  },
} as const
