
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
