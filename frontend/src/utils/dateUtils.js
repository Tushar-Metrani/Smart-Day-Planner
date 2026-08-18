export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Returns a 6x7 grid of Date objects covering the visible month (including
// leading/trailing days from adjacent months) so the calendar grid is always full.
export const getMonthGrid = (date) => {
  const first = startOfMonth(date);
  const gridStart = startOfWeek(first);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
};

export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const toISODate = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export const formatMonthYear = (date) =>
  date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

export const formatFullDate = (date) =>
  date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });