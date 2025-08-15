




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

export const PERMISSION_DEFINITIONS: { key: PermissionKey; label: string; description: string }[] = [
    { key: 'editNet', label: 'Edit Net Details', description: 'Modify the net name, description, schedule, and technical configuration.' },
    { key: 'manageSessions', label: 'Start / End Sessions', description: 'Start a new session or end an active one.' },
    { key: 'deleteSessions', label: 'Delete Session History', description: 'Permanently delete historical session logs for this net.' },
    { key: 'logContacts', label: 'Manage Check-ins', description: 'Ability to add, edit, and delete check-ins in an active session.' }
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

export const CheckInStatus = {
    NEW: 0,
    ACKNOWLEDGED: 1,
    ATTENTION: 2,
    QUESTION: 3,
} as const;

export type CheckInStatusValue = typeof CheckInStatus[keyof typeof CheckInStatus];


export interface CheckIn {
  id: string;
  session_id: string;
  timestamp: string;
  call_sign: string;
  name: string | null;
  location: string | null;
  notes: string | null;
  repeater_id: string | null;
  status_flag: CheckInStatusValue;
  isOptimistic?: boolean;
}

export interface NetSession {
  id: string;
  created_at: string;
  net_id: string;
  start_time: string;
  end_time: string | null;
  primary_nco: string;
  primary_nco_callsign: string;
  notes: string | null;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  call_sign: string | null;
  location: string | null;
  role: "admin" | "nco";
  is_approved: boolean;
}

export interface Badge {
  id:string;
  name: string;
  description: string;
}

export interface AwardedBadge {
  id: string;
  call_sign: string;
  badge_id: string;
  awarded_at: string;
  session_id: string;
  net_id: string;
}

export interface RosterMember {
  id: string;
  net_id: string;
  call_sign: string;
  name: string | null;
  location: string | null;
  created_at: string;
}

export type BadgeCategory = "Participation" | "Loyalty" | "Special";

export interface CheckInInsertPayload {
  call_sign: string;
  name: string | null;
  location: string | null;
  notes: string | null;
  repeater_id: string | null;
  timestamp?: string;
}

export interface ListeningStation {
  id: string;
  created_at: string;
  session_id: string;
  call_sign: string;
  name: string | null;
  location: string | null;
  notes: string | null;
  profile_id: string | null;
}

export interface JoinNetFormState {
  call_sign: string;
  name: string;
  location: string;
  notes: string;
}


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
  | { type: 'rosterEditor'; netId: string; }
  | { type: 'netDetail'; netId: string }
  | { type: 'session'; sessionId: string }
  | { type: 'callsignProfile'; callsign: string }
  | { type: 'about' }
  | { type: 'awards' }
  | { type: 'directory' }
  | { type: 'userAgreement' }
  | { type: 'releaseNotes' }
  | { type: 'profile' }
  | { type: 'settings' };