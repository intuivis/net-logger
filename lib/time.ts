import { Repeater } from "../types";

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
    if (repeater.uplink_tone && repeater.downlink_tone) {
        details.push(`Tones ${repeater.uplink_tone}/${repeater.downlink_tone}`);
    } else if (repeater.uplink_tone) {
        details.push(`Tone ${repeater.uplink_tone}`);
    }

    return `${mainPart} · ${details.join(' ')}`;
};