import { CheckIn, BadgeDefinition, NetSession } from '../types';

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
  __: CheckIn
): boolean => {
  return allUserCheckIns.length >= n;
};

const hasNUniqueNets = (n: number) => (
  allUserCheckIns: CheckIn[],
  allSessions: NetSession[],
  __: CheckIn
): boolean => {
  const distinctNetIds = getDistinctNetIds(allUserCheckIns, allSessions);
  return distinctNetIds.size >= n;
};

// --- Loyalty Awards ---
const isFirstCheckInForNet = (
  allUserCheckIns: CheckIn[],
  allSessions: NetSession[],
  newCheckIn: CheckIn
): boolean => {
  const sessionMap = new Map(allSessions.map((s) => [s.id, s.net_id]));
  const targetNetId = sessionMap.get(newCheckIn.session_id);

  if (!targetNetId) {
    return false; // Cannot determine net, so can't award
  }

  // Count how many times this user has checked into this specific net,
  // based on the check-ins provided.
  let countForNet = 0;
  for (const checkIn of allUserCheckIns) {
    if (sessionMap.get(checkIn.session_id) === targetNetId) {
      countForNet++;
    }
  }

  // The badge is earned if this is the first check-in for this net.
  return countForNet === 1;
};

const hasNCheckInsOnSingleNet = (n: number) => (
  allUserCheckIns: CheckIn[],
  allSessions: NetSession[],
  __: CheckIn
): boolean => {
  const countsPerNet = getCheckInCountsPerNet(allUserCheckIns, allSessions);
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
  { id: 'explorer', category: 'Participation', isEarned: hasNUniqueNets(5), sortOrder: 20 },
  { id: 'pathfinder', category: 'Participation', isEarned: hasNUniqueNets(10), sortOrder: 30 },
  { id: 'trailblazer', category: 'Participation', isEarned: hasNTotalCheckIns(25), sortOrder: 40 },
  { id: 'pioneer', category: 'Participation', isEarned: hasNTotalCheckIns(50), sortOrder: 50 },
  // Loyalty Awards
  { id: 'first_checkin', category: 'Loyalty', isEarned: isFirstCheckInForNet, sortOrder: 5 },
  { id: 'bronze_member', category: 'Loyalty', isEarned: hasNCheckInsOnSingleNet(5), sortOrder: 10 },
  { id: 'silver_member', category: 'Loyalty', isEarned: hasNCheckInsOnSingleNet(10), sortOrder: 20 },
  { id: 'gold_member', category: 'Loyalty', isEarned: hasNCheckInsOnSingleNet(25), sortOrder: 30 },
  { id: 'platinum_member', category: 'Loyalty', isEarned: hasNCheckInsOnSingleNet(50), sortOrder: 40 },
  // Special Awards
  { id: 'daybreaker', category: 'Special', isEarned: isDaybreaker, sortOrder: 10 },
  { id: 'night_owl', category: 'Special', isEarned: isNightOwl, sortOrder: 20 },
];


export const getBadgeById = (id: string, allBadges: BadgeDefinition[]) => {
    return allBadges.find(b => b.id === id);
}