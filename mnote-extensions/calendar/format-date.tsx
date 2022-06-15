function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// "Wednesday, Jun 15, 2022"
function getDateString(date: Date) {
  return new Intl.DateTimeFormat([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    weekday: "long",
  }).format(date);
}

// 12:00 PM
function getTimeString(date: Date) {
  return new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

// - en dash
// - same day --> Monday, Jan 1 ⋅ 4.00pm-4.30pm
// - all day --> 1-31 Jan
// - Monday, Jan 1 2022 4.00pm - Tuesday, Jan 2 2022 4.00pm
export function getRangeString({
  start,
  end,
  isAllDay,
}: {
  start: Date;
  end: Date;
  isAllDay: boolean;
}) {
  if (isSameDay(start, end)) {
    return `${getDateString(start)} ⋅ ${getTimeString(
      start
    )} \u2013 ${getTimeString(end)}`;
  } else if (isAllDay) {
    // an all day event's end date spills into the next day 12 AM
    const newEnd = new Date(end);
    newEnd.setDate(end.getDate() - 1);

    return isSameDay(start, newEnd)
      ? getDateString(start)
      : `${getDateString(start)} \u2013 ${getDateString(newEnd)}`;
  } else {
    return `${getDateString(start)} ${getTimeString(
      start
    )} \u2013 ${getDateString(end)} ${getTimeString(end)}`;
  }
}
