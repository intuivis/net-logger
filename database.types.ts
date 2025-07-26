

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
        Relationships: [
          {
            foreignKeyName: "awarded_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awarded_badges_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "check_ins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
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
          net_type: string;
          schedule: string;
          time: string;
          time_zone: string;
          repeaters: Json;
          net_config_type: string;
          frequency: string | null;
          band: string | null;
          mode: string | null;
          passcode: string | null;
          passcode_permissions: Json | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          name: string;
          description?: string | null;
          website_url?: string | null;
          primary_nco: string;
          primary_nco_callsign: string;
          net_type: string;
          schedule: string;
          time: string;
          time_zone: string;
          repeaters: Json;
          net_config_type: string;
          frequency?: string | null;
          band?: string | null;
          mode?: string | null;
          passcode?: string | null;
          passcode_permissions?: Json | null;
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
          net_type?: string;
          schedule?: string;
          time?: string;
          time_zone?: string;
          repeaters?: Json;
          net_config_type?: string;
          frequency?: string | null;
          band?: string | null;
          mode?: string | null;
          passcode?: string | null;
          passcode_permissions?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "nets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      };
      roster_members: {
        Row: {
          id: string;
          net_id: string;
          call_sign: string;
          name: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          net_id: string;
          call_sign: string;
          name?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          net_id?: string;
          call_sign?: string;
          name?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roster_members_net_id_fkey"
            columns: ["net_id"]
            isOneToOne: false
            referencedRelation: "nets"
            referencedColumns: ["id"]
          },
        ]
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
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_net_id_fkey"
            columns: ["net_id"]
            isOneToOne: false
            referencedRelation: "nets"
            referencedColumns: ["id"]
          },
        ]
      };
    };
    Views: {};
    Functions: {
      create_check_in: {
        Args: {
          p_session_id: string;
          p_call_sign: string;
          p_name: string | null;
          p_location: string | null;
          p_notes: string | null;
          p_repeater_id: string | null;
          p_passcode: string | null;
        };
        Returns: undefined;
      };
      delete_check_in: {
        Args: {
          p_check_in_id: string;
          p_passcode: string | null;
        };
        Returns: undefined;
      };
      end_session: {
        Args: {
          p_session_id: string;
          p_passcode: string | null;
        };
        Returns: Database["public"]["Tables"]["sessions"]["Row"];
      };
      start_session: {
        Args: {
          p_net_id: string;
          p_primary_nco: string;
          p_primary_nco_callsign: string;
          p_passcode: string | null;
        };
        Returns: Database["public"]["Tables"]["sessions"]["Row"];
      };
      update_check_in: {
        Args: {
          p_check_in_id: string;
          p_call_sign: string;
          p_name: string | null;
          p_location: string | null;
          p_notes: string | null;
          p_repeater_id: string | null;
          p_passcode: string | null;
        };
        Returns: undefined;
      };
      update_net_details: {
        Args: {
          p_net_id: string;
          p_name: string;
          p_description: string | null;
          p_website_url: string | null;
          p_primary_nco: string;
          p_primary_nco_callsign: string;
          p_net_type: string;
          p_schedule: string;
          p_time: string;
          p_time_zone: string;
          p_net_config_type: string;
          p_repeaters: Json;
          p_frequency: string | null;
          p_band: string | null;
          p_mode: string | null;
          p_passcode_val: string | null;
          p_passcode_permissions: Json | null;
          p_passcode: string | null;
        };
        Returns: Database["public"]["Tables"]["nets"]["Row"];
      };
      verify_passcode: {
        Args: {
          p_net_id: string;
          p_passcode_attempt: string;
        };
        Returns: Json;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
