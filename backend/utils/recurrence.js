// Safety cap: even with no endDate, never generate more than this many occurrences
// (also bounded by 90 days out) so an open-ended recurrence can't runaway-grow the DB.
const MAX_OCCURRENCES = 90;
const DEFAULT_HORIZON_DAYS = 90;

const advance = (date, type, interval) => {
  const d = new Date(date);
  if (type === "daily") d.setDate(d.getDate() + interval);
  else if (type === "weekly") d.setDate(d.getDate() + 7 * interval);
  else if (type === "monthly") d.setMonth(d.getMonth() + interval);
  return d;
};

export const generateRecurrenceDates = (startDate, recurrence) => {
  const { type, interval = 1, endDate } = recurrence;
  const defaultHorizon = new Date(startDate);
  defaultHorizon.setDate(defaultHorizon.getDate() + DEFAULT_HORIZON_DAYS);
  const cap = endDate ? new Date(endDate) : defaultHorizon;

  const dates = [new Date(startDate)];
  let current = new Date(startDate);
  let count = 1;

  while (count < MAX_OCCURRENCES) {
    current = advance(current, type, interval);
    if (current > cap) break;
    dates.push(new Date(current));
    count++;
  }
  return dates;
};