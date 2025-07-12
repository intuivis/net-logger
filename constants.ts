
import { NetType, DayOfWeek, NetConfigType } from './types';

export const NET_TYPE_OPTIONS: NetType[] = [
  NetType.SOCIAL,
  NetType.TECHNICAL,
  NetType.TRAFFIC,
  NetType.EMERGENCY,
  NetType.ARES_RACES,
];

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