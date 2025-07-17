
import { Database } from './database.types';

export enum NetType {
  SOCIAL = "Social",
  TECHNICAL = "Technical",
  TRAFFIC = "Traffic",
  EMERGENCY = "Emergency",
  ARES_RACES = "ARES/RACES",
  SPECIAL_EVENT = "Special Event",
}

export enum NetConfigType {
  SINGLE_REPEATER = "SINGLE_REPEATER",
  LINKED_REPEATER = "LINKED_REPEATER",
  GROUP = "GROUP",
}

export const NET_CONFIG_TYPE_LABELS: Record<NetConfigType, string> = {
    [NetConfigType.SINGLE_REPEATER]: "Single Repeater",
    [NetConfigType.LINKED_REPEATER]: "Linked Repeater System",
    [NetConfigType.GROUP]: "Group/Simplex",
};

export enum DayOfWeek {
  SUNDAY = "Sunday",
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
}

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

// Re-defining Net to avoid complex recursive types that cause TS errors.
export interface Net {
    id: string;
    created_by: string;
    name: string;
    description: string | null;
    website_url: string | null;
    primary_nco: string;
    primary_nco_callsign: string;
    backup_nco: string | null;
    backup_nco_callsign: string | null;
    net_type: NetType;
    schedule: DayOfWeek;
    time: string;
    time_zone: string;
    repeaters: Repeater[];
    net_config_type: NetConfigType;
    frequency: string | null;
    band: string | null;
    mode: string | null;
}

export type CheckIn = Database['public']['Tables']['check_ins']['Row'];

export type NetSession = Database['public']['Tables']['sessions']['Row'];

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type Badge = Database['public']['Tables']['badges']['Row'];

export type AwardedBadge = Database['public']['Tables']['awarded_badges']['Row'];

export type BadgeCategory = "Participation" | "Loyalty" | "Special";

export interface BadgeDefinition extends Badge {
  category: BadgeCategory;
  isEarned: (
    allUserCheckIns: CheckIn[],
    allSessions: NetSession[],
    newCheckIn: CheckIn
  ) => boolean;
}

export type View =
  | { type: 'home' }
  | { type: 'login' }
  | { type: 'register' }
  | { type: 'pendingApproval' }
  | { type: 'adminApprovals' }
  | { type: 'manageNets' }
  | { type: 'netEditor'; netId?: string }
  | { type: 'netDetail'; netId: string }
  | { type: 'session'; sessionId: string }
  | { type: 'callsignProfile'; callsign: string }
  | { type: 'about' };