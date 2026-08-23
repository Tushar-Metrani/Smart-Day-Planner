const MAX_OCCURRENCES = 90;
const DEFAULT_HORIZON_DAYS = 90;

const advance = (date, type, interval) => {
  const d = new Date(date);
  if (type === "daily") d.setDate(d.getDate() + interval);
  else if (type === "weekly") d.setDate(d.getDate() + 7 * interval);
  else if (type === "monthly") d.setMonth(d.getMonth() + interval);
  return d;
};

// Recurrence is a calendar-day concept — startTime/endTime already carry
// the time-of-day separately — so strip hours/minutes/seconds before doing
// any date-vs-cap comparisons. Otherwise a start date generated with a
// live timestamp (e.g. 15:39:36) can compare as "later" than a same-day
// cap parsed from a plain date input (00:00:00), excluding the final occurrence.
const normalizeToMidnight = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const generateRecurrenceDates = (startDate, recurrence) => {
  const { type, interval = 1, endDate } = recurrence;
  const start = normalizeToMidnight(startDate);

  const defaultHorizon = new Date(start);
  defaultHorizon.setDate(defaultHorizon.getDate() + DEFAULT_HORIZON_DAYS);
  const cap = endDate ? normalizeToMidnight(endDate) : defaultHorizon;

  const dates = [new Date(start)];
  let current = new Date(start);
  let count = 1;

  while (count < MAX_OCCURRENCES) {
    current = advance(current, type, interval);
    if (current > cap) break;
    dates.push(new Date(current));
    count++;
  }
  return dates;
};