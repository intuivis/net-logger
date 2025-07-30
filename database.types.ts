
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
          status_flag: number;
        };
        Insert: {
          session_id: string;
          timestamp?: string;
          call_sign: string;
          name?: string | null;
          location?: string | null;
          notes?: string | null;
          repeater_id?: string | null;
          status_flag?: number;
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
          status_flag?: number;
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
          net_id: string;
          call_sign: string;
          name?: string | null;
          location?: string | null;
        };
        Update: {
          id?: string;
          net_id?: string;
          call_sign?: string;
          name?: string | null;
          location?: string | null;
          created_at?: string;
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
          notes: string | null;
        };
        Insert: {
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
      update_check_in_status_flag: {
        Args: {
          p_check_in_id: string;
          p_status_flag: number;
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
      update_profile_with_callsign_check: {
        Args: {
          p_user_id: string
          p_full_name: string
          p_call_sign: string
        }
        Returns: Database["public"]["Tables"]["profiles"]["Row"]
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
