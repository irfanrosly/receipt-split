export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          approved?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          receipt_url: string | null;
          split_mode: "equal" | "per_item";
          subtotal: number;
          service_pct: number;
          tax_pct: number;
          tax_on: "subtotal" | "after_service";
          total: number;
          currency: string;
          status: "draft" | "settled";
          pay_name: string | null;
          pay_bank: string | null;
          pay_account: string | null;
          pay_qr_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          receipt_url?: string | null;
          split_mode?: "equal" | "per_item";
          subtotal?: number;
          service_pct?: number;
          tax_pct?: number;
          tax_on?: "subtotal" | "after_service";
          total?: number;
          currency?: string;
          status?: "draft" | "settled";
          pay_name?: string | null;
          pay_bank?: string | null;
          pay_account?: string | null;
          pay_qr_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          receipt_url?: string | null;
          split_mode?: "equal" | "per_item";
          subtotal?: number;
          service_pct?: number;
          tax_pct?: number;
          tax_on?: "subtotal" | "after_service";
          total?: number;
          currency?: string;
          status?: "draft" | "settled";
          pay_name?: string | null;
          pay_bank?: string | null;
          pay_account?: string | null;
          pay_qr_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          color: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          quantity?: number;
          unit_price?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          quantity?: number;
          unit_price?: number;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      item_assignments: {
        Row: {
          id: string;
          item_id: string;
          participant_id: string;
          session_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          participant_id: string;
          session_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          participant_id?: string;
          session_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Participant = Database["public"]["Tables"]["participants"]["Row"];
export type Item = Database["public"]["Tables"]["items"]["Row"];
export type ItemAssignment =
  Database["public"]["Tables"]["item_assignments"]["Row"];
