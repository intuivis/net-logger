
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
      awarded_badges: {
        Row: {
          id: string;
          call_sign: string;
          badge_id: string;
          awarded_at: string;
          session_id: string;
        };
        Insert: {
          id?: string;
          call_sign: string;
          badge_id: string;
          awarded_at?: string;
          session_id: string;
        };
        Update: {
          id?: string;
          call_sign?: string;
          badge_id?: string;
          awarded_at?: string;
          session_id?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
        };
      };
      callsigns: {
        Row: {
          callsign: string;
          first_name: string | null;
          last_name: string | null;
          license_id: number;
        };
        Insert: {
          callsign: string;
          first_name?: string | null;
          last_name?: string | null;
          license_id: number;
        };
        Update: {
          callsign?: string;
          first_name?: string | null;
          last_name?: string | null;
          license_id?: number;
        };
      };
      check_ins: {
        Row: {
          id: string;
          session_id: string;
          timestamp: string;
          call_sign: string;
          name: string | null;
          location: string | null;
          notes: string | null;
          repeater_id: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          timestamp?: string;
          call_sign: string;
          name?: string | null;
          location?: string | null;
          notes?: string | null;
          repeater_id?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          timestamp?: string;
          call_sign?: string;
          name?: string | null;
          location?: string | null;
          notes?: string | null;
          repeater_id?: string | null;
        };
      };
      nets: {
        Row: {
          id: string;
          created_at: string;
          created_by: string;
          name: string;
          description: string | null;
          website_url: string | null;
          primary_nco: string;
          primary_nco_callsign: string;
          backup_nco: string | null;
          backup_nco_callsign: string | null;
          net_type: string;
          schedule: string;
          time: string;
          time_zone: string;
          repeaters: Json;
          net_config_type: string;
          frequency: string | null;
          band: string | null;
          mode: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          created_by: string;
          name: string;
          description?: string | null;
          website_url?: string | null;
          primary_nco: string;
          primary_nco_callsign: string;
          backup_nco?: string | null;
          backup_nco_callsign?: string | null;
          net_type: string;
          schedule: string;
          time: string;
          time_zone: string;
          repeaters: Json;
          net_config_type: string;
          frequency?: string | null;
          band?: string | null;
          mode?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          created_by?: string;
          name?: string;
          description?: string | null;
          website_url?: string | null;
          primary_nco?: string;
          primary_nco_callsign?: string;
          backup_nco?: string | null;
          backup_nco_callsign?: string | null;
          net_type?: string;
          schedule?: string;
          time?: string;
          time_zone?: string;
          repeaters?: Json;
          net_config_type?: string;
          frequency?: string | null;
          band?: string | null;
          mode?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          email: string | null;
          full_name: string | null;
          call_sign: string | null;
          role: "admin" | "nco";
          is_approved: boolean;
        };
        Insert: {
          id?: string;
          updated_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          call_sign?: string | null;
          role?: "admin" | "nco";
          is_approved?: boolean;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          call_sign?: string | null;
          role?: "admin" | "nco";
          is_approved?: boolean;
        };
      };
      sessions: {
        Row: {
          id: string;
          created_at: string;
          net_id: string;
          start_time: string;
          end_time: string | null;
          primary_nco: string;
          primary_nco_callsign: string;
          backup_nco: string | null;
          backup_nco_callsign: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          net_id: string;
          start_time?: string;
          end_time?: string | null;
          primary_nco: string;
          primary_nco_callsign: string;
          backup_nco?: string | null;
          backup_nco_callsign?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          net_id?: string;
          start_time?: string;
          end_time?: string | null;
          primary_nco?: string;
          primary_nco_callsign?: string;
          backup_nco?: string | null;
          backup_nco_callsign?: string | null;
          notes?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
