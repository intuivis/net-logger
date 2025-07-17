
import { CheckIn, BadgeDefinition, NetSession } from '../types';

const getCheckInsInCurrentYear = (
  allUserCheckIns: CheckIn[],
  newCheckIn: CheckIn
): CheckIn[] => {
  const currentYear = new Date(newCheckIn.timestamp).getFullYear();
  return allUserCheckIns.filter(
    (ci) => new Date(ci.timestamp).getFullYear() === currentYear
  );
};

// Helper to get distinct net IDs from a list of check-ins
const getDistinctNetIds = (
  checkIns: CheckIn[],
  allSessions: NetSession[]
): Set<string> => {
  const sessionMap = new Map(allSessions.map((s) => [s.id, s.net_id]));
  const netIds = new Set<string>();
  for (const checkIn of checkIns) {
    const netId = sessionMap.get(checkIn.session_id);
    if (netId) {
      netIds.add(netId);
    }
  }
  return netIds;
};

// Helper to get check-in counts per net
const getCheckInCountsPerNet = (
  checkIns: CheckIn[],
  allSessions: NetSession[]
): Map<string, number> => {
  const sessionMap = new Map(allSessions.map((s) => [s.id, s.net_id]));
  const counts = new Map<string, number>();
  for (const checkIn of checkIns) {
    const netId = sessionMap.get(checkIn.session_id);
    if (netId) {
      counts.set(netId, (counts.get(netId) || 0) + 1);
    }
  }
  return counts;
};


// --- Participation Awards ---
const hasNTotalCheckIns = (n: number) => (
  allUserCheckIns: CheckIn[],
  _: NetSession[],
  newCheckIn: CheckIn
): boolean => {
  const yearlyCheckIns = getCheckInsInCurrentYear(allUserCheckIns, newCheckIn);
  return yearlyCheckIns.length >= n;
};

const hasNUniqueNets = (n: number) => (
  allUserCheckIns: CheckIn[],
  allSessions: NetSession[],
  newCheckIn: CheckIn
): boolean => {
  const yearlyCheckIns = getCheckInsInCurrentYear(allUserCheckIns, newCheckIn);
  const distinctNetIds = getDistinctNetIds(yearlyCheckIns, allSessions);
  return distinctNetIds.size >= n;
};

// --- Loyalty Awards ---
const hasNCheckInsOnSingleNet = (n: number) => (
  allUserCheckIns: CheckIn[],
  allSessions: NetSession[],
  newCheckIn: CheckIn
): boolean => {
  const yearlyCheckIns = getCheckInsInCurrentYear(allUserCheckIns, newCheckIn);
  const countsPerNet = getCheckInCountsPerNet(yearlyCheckIns, allSessions);
  for (const count of countsPerNet.values()) {
    if (count >= n) {
      return true;
    }
  }
  return false;
};

// --- Special Awards ---
const isNightOwl = (
  _: CheckIn[],
  __: NetSession[],
  newCheckIn: CheckIn
): boolean => {
  const hour = new Date(newCheckIn.timestamp).getHours();
  return hour >= 22 || hour < 5; // 10 PM - 5 AM
};

const isDaybreaker = (
  _: CheckIn[],
  __: NetSession[],
  newCheckIn: CheckIn
): boolean => {
  const hour = new Date(newCheckIn.timestamp).getHours();
  return hour >= 5 && hour < 9; // 5 AM - 9 AM
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Participation Awards
  {
    id: 'first_checkin',
    name: 'First Check-in',
    description: 'Awarded for your first check-in of the calendar year.',
    icon: 'star',
    color_classes: 'bg-yellow-500/20 text-yellow-300',
    category: 'Participation',
    isEarned: hasNTotalCheckIns(1),
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    description: 'Awarded for checking into 5 different NETs in a calendar year.',
    icon: 'explore',
    color_classes: 'bg-lime-500/20 text-lime-300',
    category: 'Participation',
    isEarned: hasNUniqueNets(5),
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Awarded for checking into 10 different NETs in a calendar year.',
    icon: 'travel_explore',
    color_classes: 'bg-green-500/20 text-green-300',
    category: 'Participation',
    isEarned: hasNUniqueNets(10),
  },
  {
    id: 'trailblazer',
    name: 'Trailblazer',
    description: 'Awarded for 25 total check-ins in a calendar year.',
    icon: 'flag',
    color_classes: 'bg-teal-500/20 text-teal-300',
    category: 'Participation',
    isEarned: hasNTotalCheckIns(25),
  },
  {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'Awarded for 50 total check-ins in a calendar year.',
    icon: 'emoji_events',
    color_classes: 'bg-cyan-500/20 text-cyan-300',
    category: 'Participation',
    isEarned: hasNTotalCheckIns(50),
  },

  // Loyalty Awards
  {
    id: 'bronze_member',
    name: 'Bronze Member',
    description: 'Awarded for checking into the same NET 5 times in a calendar year.',
    icon: 'shield',
    color_classes: 'bg-amber-700/30 text-amber-500',
    category: 'Loyalty',
    isEarned: hasNCheckInsOnSingleNet(5),
  },
  {
    id: 'silver_member',
    name: 'Silver Member',
    description: 'Awarded for checking into the same NET 10 times in a calendar year.',
    icon: 'workspace_premium',
    color_classes: 'bg-slate-400/30 text-slate-300',
    category: 'Loyalty',
    isEarned: hasNCheckInsOnSingleNet(10),
  },
  {
    id: 'gold_member',
    name: 'Gold Member',
    description: 'Awarded for checking into the same NET 25 times in a calendar year.',
    icon: 'military_tech',
    color_classes: 'bg-yellow-500/30 text-yellow-400',
    category: 'Loyalty',
    isEarned: hasNCheckInsOnSingleNet(25),
  },
  {
    id: 'platinum_member',
    name: 'Platinum Member',
    description: 'Awarded for checking into the same NET 50 times in a calendar year.',
    icon: 'diamond',
    color_classes: 'bg-sky-400/30 text-sky-300',
    category: 'Loyalty',
    isEarned: hasNCheckInsOnSingleNet(50),
  },
  
  // Special Awards
  {
    id: 'daybreaker',
    name: 'Daybreaker',
    description: 'Awarded for checking in during the early morning hours (5am - 9am).',
    icon: 'sun',
    color_classes: 'bg-orange-500/20 text-orange-300',
    category: 'Special',
    isEarned: isDaybreaker,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Awarded for checking in late at night (10pm - 5am).',
    icon: 'moon',
    color_classes: 'bg-indigo-500/20 text-indigo-300',
    category: 'Special',
    isEarned: isNightOwl,
  },
];

export const getBadgeById = (id: string) => {
    return BADGE_DEFINITIONS.find(b => b.id === id);
}
