

import { Database, Repeater as DbRepeater, PasscodePermissions as DbPasscodePermissions, PermissionKey as DbPermissionKey } from './database.types';

export enum NetType {
  SOCIAL = "Social",
  TECHNICAL = "Technical",
  TRAFFIC = "Traffic",
  EMERGENCY = "Emergency",
  ARES_RACES = "Civil Service",
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
    [NetConfigType.GROUP]: "HF/Simplex",
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

export type Repeater = DbRepeater;
export type PermissionKey = DbPermissionKey;
export type PasscodePermissions = DbPasscodePermissions;

export const PERMISSION_DEFINITIONS: { key: PermissionKey; label: string; description: string }[] = [
    { key: 'editNet', label: 'Edit Net Details', description: 'Allows user to change the net name, description, schedule, and technical configuration.' },
    { key: 'manageSessions', label: 'Start / End Sessions', description: 'Allows user to start a new session or end an active one.' },
    { key: 'deleteSessions', label: 'Delete Session History', description: 'Allows user to permanently delete historical session logs for this net.' },
    { key: 'logContacts', label: 'Manage Check-ins', description: 'Allows user to add, edit, and delete check-ins in an active session.' }
];

// Re-defining Net to avoid complex recursive types that cause TS errors.
export interface Net {
    id: string;
    created_by: string;
    name: string;
    description: string | null;
    website_url: string | null;
    primary_nco: string;
    primary_nco_callsign: string;
    net_type: NetType;
    schedule: DayOfWeek;
    time: string;
    time_zone: string;
    repeaters: Repeater[];
    net_config_type: NetConfigType;
    frequency: string | null;
    band: string | null;
    mode: string | null;
    passcode: string | null;
    passcode_permissions: PasscodePermissions | null;
}

export type CheckIn = Database['public']['Tables']['check_ins']['Row'];

export type NetSession = Database['public']['Tables']['sessions']['Row'];

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type Badge = Database['public']['Tables']['badges']['Row'];

export type AwardedBadge = Database['public']['Tables']['awarded_badges']['Row'];

export type BadgeCategory = "Participation" | "Loyalty" | "Special";

export interface BadgeDefinition extends Badge {
  category: BadgeCategory;
  sortOrder: number;
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
  | { type: 'accessRevoked' }
  | { type: 'userManagement' }
  | { type: 'manageNets' }
  | { type: 'netEditor'; netId?: string }
  | { type: 'netDetail'; netId: string }
  | { type: 'session'; sessionId: string }
  | { type: 'callsignProfile'; callsign: string }
  | { type: 'about' }
  | { type: 'awards' }
  | { type: 'userAgreement' }
  | { type: 'releaseNotes' };