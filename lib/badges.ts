
import { CheckIn, BadgeDefinition } from '../types';

const hasNCheckIns = (n: number) => (checkIns: Pick<CheckIn, 'timestamp'>[]) => {
    return checkIns.length >= n;
};

const isNightOwl = (_: Pick<CheckIn, 'timestamp'>[], checkInTime: Date) => {
    // Check local time of the NCO's browser. Could be configured to be UTC based.
    // For this implementation, let's use the local time of the NCO logging the checkin.
    const hour = checkInTime.getHours();
    return hour >= 22 || hour < 5; // 10 PM - 5 AM
};

const isDaybreaker = (_: Pick<CheckIn, 'timestamp'>[], checkInTime: Date) => {
    const hour = checkInTime.getHours();
    return hour >= 5 && hour < 9; // 5 AM - 9 AM
};


export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_checkin',
    name: 'First Check-in',
    description: 'Awarded for the first time checking into any net.',
    icon: 'star',
    color_classes: 'bg-yellow-500/20 text-yellow-300',
    isEarned: hasNCheckIns(1),
  },
  {
    id: 'regular_5',
    name: 'Operator',
    description: 'Awarded for checking into 5 nets.',
    icon: 'trending_up',
    color_classes: 'bg-green-500/20 text-green-300',
    isEarned: hasNCheckIns(5),
  },
  {
    id: 'regular_10',
    name: 'Regular',
    description: 'Awarded for checking into 10 nets.',
    icon: 'trending_up',
    color_classes: 'bg-teal-500/20 text-teal-300',
    isEarned: hasNCheckIns(10),
  },
   {
    id: 'regular_25',
    name: 'Veteran',
    description: 'Awarded for checking into 25 nets.',
    icon: 'award',
    color_classes: 'bg-blue-500/20 text-blue-300',
    isEarned: hasNCheckIns(25),
  },
  {
    id: 'regular_50',
    name: 'Elmer',
    description: 'Awarded for checking into 50 nets.',
    icon: 'award',
    color_classes: 'bg-purple-500/20 text-purple-300',
    isEarned: hasNCheckIns(50),
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Awarded for checking in late at night.',
    icon: 'moon',
    color_classes: 'bg-indigo-500/20 text-indigo-300',
    isEarned: isNightOwl,
  },
  {
    id: 'daybreaker',
    name: 'Daybreaker',
    description: 'Awarded for checking in early in the morning.',
    icon: 'sunrise',
    color_classes: 'bg-orange-500/20 text-orange-300',
    isEarned: isDaybreaker,
  },
];

export const getBadgeById = (id: string) => {
    return BADGE_DEFINITIONS.find(b => b.id === id);
}
