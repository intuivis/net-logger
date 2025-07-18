
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

export const BADGE_DEFINITIONS: Omit<BadgeDefinition, 'name' | 'description'>[] = [
  // Participation Awards
  { id: 'first_checkin', category: 'Participation', isEarned: hasNTotalCheckIns(1) },
  { id: 'pathfinder', category: 'Participation', isEarned: hasNUniqueNets(5) },
  { id: 'explorer', category: 'Participation', isEarned: hasNUniqueNets(10) },
  { id: 'trailblazer', category: 'Participation', isEarned: hasNTotalCheckIns(25) },
  { id: 'pioneer', category: 'Participation', isEarned: hasNTotalCheckIns(50) },
  // Loyalty Awards
  { id: 'bronze_member', category: 'Loyalty', isEarned: hasNCheckInsOnSingleNet(5) },
  { id: 'silver_member', category: 'Loyalty', isEarned: hasNCheckInsOnSingleNet(10) },
  { id: 'gold_member', category: 'Loyalty', isEarned: hasNCheckInsOnSingleNet(25) },
  { id: 'platinum_member', category: 'Loyalty', isEarned: hasNCheckInsOnSingleNet(50) },
  // Special Awards
  { id: 'daybreaker', category: 'Special', isEarned: isDaybreaker },
  { id: 'night_owl', category: 'Special', isEarned: isNightOwl },
];


export const getBadgeById = (id: string, allBadges: BadgeDefinition[]) => {
    return allBadges.find(b => b.id === id);
}