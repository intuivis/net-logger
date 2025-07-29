

import { NetType, DayOfWeek, NetConfigType } from './types';

export const NET_TYPE_OPTIONS: NetType[] = [
  NetType.SOCIAL,
  NetType.TECHNICAL,
  NetType.TRAFFIC,
  NetType.EMERGENCY,
  NetType.ARES_RACES,
  NetType.SPECIAL_EVENT,
];

export const NET_TYPE_INFO: Record<NetType, { icon: string, classes: string, description: string }> = {
    [NetType.SOCIAL]: {
        icon: 'groups',
        classes: 'bg-yellow-500/20 text-yellow-300',
        description: 'Casual gatherings for operators to chat and connect. A great way to meet new people on the air.',
    },
    [NetType.TECHNICAL]: {
        icon: 'construction',
        classes: 'bg-sky-500/20 text-sky-300',
        description: 'Discussions focused on radio technology, equipment, antennas, and amateur radio theory.',
    },
    [NetType.TRAFFIC]: {
        icon: 'swap_horiz',
        classes: 'bg-emerald-500/20 text-emerald-300',
        description: 'For passing formal messages (radiograms). Practices skills used by the National Traffic System (NTS).',
    },
    [NetType.EMERGENCY]: {
        icon: 'campaign',
        classes: 'bg-red-500/20 text-red-300',
        description: 'For handling critical communications during actual emergencies like natural disasters or public safety incidents. Activation is often rapid, and participation may be restricted to trained operators from groups like ARES or RACES.',
    },
    [NetType.ARES_RACES]: {
        icon: 'security',
        classes: 'bg-blue-500/20 text-blue-300',
        description: 'Official nets for Amateur Radio Emergency Service (ARES) or Radio Amateur Civil Emergency Service (RACES) groups, often in support of served agencies.',
    },
    [NetType.SPECIAL_EVENT]: {
        icon: 'celebration',
        classes: 'bg-purple-500/20 text-purple-300',
        description: 'Nets operating for a limited time to commemorate a special occasion, such as a historical anniversary, a festival, or a contest. These are a fun way to make unique contacts.',
    },
};

export const BADGE_STYLES: Record<string, { icon: string; color_classes: string; }> = {
    // Participation
    first_checkin: { icon: 'looks_one', color_classes: 'bg-yellow-500/20 text-yellow-300' },
    explorer: { icon: 'travel_explore', color_classes: 'bg-lime-500/20 text-lime-300' },
    pathfinder: { icon: 'explore', color_classes: 'bg-green-500/20 text-green-300' },
    trailblazer: { icon: 'flag', color_classes: 'bg-teal-500/20 text-teal-300' },
    pioneer: { icon: 'emoji_events', color_classes: 'bg-cyan-500/20 text-cyan-300' },
    // Loyalty
    bronze_member: { icon: 'verified_user', color_classes: 'bg-amber-700/30 text-amber-500' },
    silver_member: { icon: 'workspace_premium', color_classes: 'bg-slate-400/30 text-slate-300' },
    gold_member: { icon: 'military_tech', color_classes: 'bg-yellow-500/30 text-yellow-400' },
    platinum_member: { icon: 'diamond', color_classes: 'bg-sky-400/30 text-sky-300' },
    // Special
    daybreaker: { icon: 'sun', color_classes: 'bg-orange-500/20 text-orange-300' },
    night_owl: { icon: 'moon', color_classes: 'bg-indigo-500/20 text-indigo-300' },
    // Default/Fallback
    default: { icon: 'badge', color_classes: 'bg-gray-500/20 text-gray-300' },
};


export const NET_CONFIG_TYPE_OPTIONS: NetConfigType[] = [
  NetConfigType.SINGLE_REPEATER,
  NetConfigType.LINKED_REPEATER,
  NetConfigType.GROUP,
];

export const DAY_OF_WEEK_OPTIONS: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

export const TIME_ZONE_OPTIONS: string[] = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Pacific/Honolulu",
];