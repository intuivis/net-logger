import { Repeater, Schedule, OCCURRENCE_OPTIONS } from "../types";

export const formatTime = (time24: string): string => {
  if (!time24 || !time24.includes(':')) {
    return time24; // Return original if format is unexpected
  }
  const [hours, minutes] = time24.split(':');
  const hoursInt = parseInt(hours, 10);
  const minutesInt = parseInt(minutes, 10);

  const ampm = hoursInt >= 12 ? 'PM' : 'AM';
  let hours12 = hoursInt % 12;
  if (hours12 === 0) {
    hours12 = 12; // the hour '0' should be '12'
  }

  const minutesStr = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;

  return `${hours12}:${minutesStr} ${ampm}`;
};

const TIME_ZONE_MAP: Record<string, string> = {
    "America/New_York": "ET",
    "America/Chicago": "CT",
    "America/Denver": "MT",
    "America/Los_Angeles": "PT",
    "America/Phoenix": "MST",
    "Pacific/Honolulu": "HST",
    "UTC": "UTC",
};

export const formatTimeZone = (timeZone: string): string => {
    return TIME_ZONE_MAP[timeZone] || timeZone;
};

const WEEK_ORDER = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const formatSchedule = (schedule: Schedule | string): string => {
  if (typeof schedule === 'string') {
    return `Weekly on ${schedule}s`;
  }
  
  if (!schedule || !schedule.type) return 'Ad-hoc';
  
  switch (schedule.type) {
    case 'weekly':
      return `Weekly on ${schedule.day}s`;

    case 'daily':
      if (schedule.days.length === 7) return 'Daily';
      if (schedule.days.length === 0) return 'Ad-hoc';

      // Ensure days are in proper weekly order
      const sortedDays = [...schedule.days].sort(
        (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)
      );

      const dayAbbrs = sortedDays.map(d => d.substring(0, 3)).join(', ');
      return `Daily on ${dayAbbrs}`;

    case 'monthly':
      const { config } = schedule;
      if (config.type === 'date') {
        const date = config.date;
        if (!date) return 'Monthly';
        const lastDigit = date % 10;
        const lastTwoDigits = date % 100;
        if (lastTwoDigits > 10 && lastTwoDigits < 14) {
          return `Monthly on the ${date}th`;
        }
        switch (lastDigit) {
          case 1: return `Monthly on the ${date}st`;
          case 2: return `Monthly on the ${date}nd`;
          case 3: return `Monthly on the ${date}rd`;
          default: return `Monthly on the ${date}th`;
        }
      }
      if (config.type === 'day') {
        const occurrenceLabel = OCCURRENCE_OPTIONS.find(o => o.value === config.occurrence)?.label;
        return `Monthly on the ${occurrenceLabel} ${config.day}`;
      }
      return 'Monthly';

    default:
      return 'Ad-hoc';
  }
};



export const formatRepeaterCondensed = (repeater: Repeater): string => {
    let mainPart = repeater.name;
    if (repeater.owner_callsign) {
        mainPart += ` (${repeater.owner_callsign})`;
    }

    const details: string[] = [];
    if (repeater.downlink_freq) {
        details.push(`${repeater.downlink_freq} MHz`);
    }
    if (repeater.offset) {
        const offsetNum = parseFloat(repeater.offset);
        if (!isNaN(offsetNum)) {
             details.push(`${offsetNum > 0 ? '+' : ''}${repeater.offset}`);
        }
    }
    if (repeater.uplink_tone) {
        details.push(`Tone ${repeater.uplink_tone}`);
    }

    return `${mainPart} · ${details.join(' ')}`;
};
