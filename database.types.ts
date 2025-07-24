
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: any }
  | any[];

export type PermissionKey =
  | "editNet"
  | "manageSessions"
  | "deleteSessions"
  | "logContacts";

export type PasscodePermissions = Partial<Record<PermissionKey, boolean>>;

export interface Repeater {
  id: string;
  name: string;
  owner_callsign: string | null;
  grid_square: string | null;
  county: string | null;
  downlink_freq: string;
  offset: string | null;
  uplink_tone: string | null;
  downlink_tone: string | null;
  website_url: string | null;
}

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
          session_id: string;
          timestamp?: string;
          call_sign: string;
          name?: string | null;
          location?: string | null;
          notes?: string | null;
          repeater_id?: string | null;
        };
        Update: {
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
          updated_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          call_sign?: string | null;
          role?: "admin" | "nco";
          is_approved?: boolean;
        };
        Update: {
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
          notes: string | null;
        };
        Insert: {
          created_at?: string;
          net_id: string;
          start_time?: string;
          end_time?: string | null;
          primary_nco: string;
          primary_nco_callsign: string;
          notes?: string | null;
        };
        Update: {
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
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
