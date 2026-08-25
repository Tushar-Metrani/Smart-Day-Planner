const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTimeString = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const MIN_SLOT_MINUTES = 15; // ignore gaps too small to schedule anything meaningful in
const MAX_SLOTS_RETURNED = 6; // cap prompt size — largest gaps are the most useful anyway

// Returns free windows within [workDayStart, workDayEnd], excluding time
// already occupied by existingTasks. Busy blocks are merged first so
// overlapping/adjacent tasks don't create phantom tiny gaps between them.
export const computeFreeSlots = (existingTasks, workDayStart, workDayEnd) => {
  const dayStart = toMinutes(workDayStart);
  const dayEnd = toMinutes(workDayEnd);

  const busy = existingTasks
    .filter((t) => t.startTime && t.endTime)
    .map((t) => ({ start: toMinutes(t.startTime), end: toMinutes(t.endTime) }))
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const block of busy) {
    const last = merged[merged.length - 1];
    if (last && block.start <= last.end) {
      last.end = Math.max(last.end, block.end);
    } else {
      merged.push({ ...block });
    }
  }

  const slots = [];
  let cursor = dayStart;
  for (const block of merged) {
    if (block.start > cursor) {
      slots.push({ start: cursor, end: Math.min(block.start, dayEnd) });
    }
    cursor = Math.max(cursor, block.end);
    if (cursor >= dayEnd) break;
  }
  if (cursor < dayEnd) slots.push({ start: cursor, end: dayEnd });

  return slots
    .filter((s) => s.end - s.start >= MIN_SLOT_MINUTES)
    .sort((a, b) => (b.end - b.start) - (a.end - a.start))
    .slice(0, MAX_SLOTS_RETURNED)
    .map((s) => ({ startTime: toTimeString(s.start), endTime: toTimeString(s.end) }));
};