import { timeToMinutes } from "./categoryMeta.js";
import { toISODate } from "./dateUtils.js";

const taskDuration = (t) => {
  if (!t.startTime) return 0;
  const start = timeToMinutes(t.startTime);
  const end = t.endTime ? timeToMinutes(t.endTime) : start + 30;
  return Math.max(0, end - start);
};

export const computeTaskStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  const totalScheduledMinutes = tasks.reduce((sum, t) => sum + taskDuration(t), 0);
  const totalCompletedMinutes = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + taskDuration(t), 0);

  const categoryMap = {};
  for (const t of tasks.filter((t) => t.completed)) {
    const minutes = taskDuration(t);
    if (!categoryMap[t.category]) categoryMap[t.category] = { minutes: 0, count: 0 };
    categoryMap[t.category].minutes += minutes;
    categoryMap[t.category].count += 1;
  }
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.minutes - a.minutes);

  return { total, completed, completionRate, totalScheduledMinutes, totalCompletedMinutes, categoryBreakdown };
};

export const computeStreak = (tasks) => {
  const completedDates = new Set(
    tasks.filter((t) => t.completed).map((t) => toISODate(t.date))
  );
  let streak = 0;
  const cursor = new Date();
  while (completedDates.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const computeGoalStats = (goals) => {
  const completed = goals.filter((g) => g.status === "completed").length;
  const pending = goals.filter((g) => g.status !== "completed").length;
  const overdue = goals.filter(
    (g) => g.status !== "completed" && g.deadline && new Date(g.deadline) < new Date().setHours(0, 0, 0, 0)
  ).length;
  return { completed, pending, overdue, total: goals.length };
};

export const formatMinutes = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

export const computeDailyTrend = (tasks, days) => {
  const byDate = {};
  for (const t of tasks) {
    const iso = toISODate(t.date);
    if (!byDate[iso]) byDate[iso] = { total: 0, completed: 0 };
    byDate[iso].total += 1;
    if (t.completed) byDate[iso].completed += 1;
  }

  const result = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const iso = toISODate(cursor);
    const entry = byDate[iso] || { total: 0, completed: 0 };
    result.push({ iso, date: new Date(cursor), ...entry });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
};

export const computePriorityBreakdown = (tasks) => {
  const order = ["high", "medium", "low"];
  return order.map((priority) => {
    const inPriority = tasks.filter((t) => t.priority === priority);
    const completed = inPriority.filter((t) => t.completed).length;
    const total = inPriority.length;
    const rate = total ? Math.round((completed / total) * 100) : null;
    return { priority, completed, total, rate };
  });
};

// Normalizes to midnight so "days elapsed" counts calendar days, not
// fractional 24-hour periods — a goal created 3 hours ago should count
// as 1 day elapsed today, not 0.
const daysBetween = (earlier, later) => {
  const a = new Date(earlier);
  const b = new Date(later);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

export const computeGoalPace = (goal) => {
  if (!goal.deadline) return { status: "no_deadline" };

  const now = new Date();
  const daysElapsed = Math.max(1, daysBetween(goal.createdAt, now) + 1); // +1 so day-of-creation counts as day 1
  const daysRemaining = daysBetween(now, goal.deadline);

  const avgPerDay = goal.currentValue / daysElapsed;
  const remaining = Math.max(0, goal.targetValue - goal.currentValue);

  if (remaining === 0) return { status: "complete", avgPerDay };
  if (daysRemaining < 0) return { status: "overdue", avgPerDay };
  if (daysRemaining === 0) return { status: "due_today", avgPerDay, remaining };

  const neededPerDay = remaining / daysRemaining;
  const status = avgPerDay >= neededPerDay ? "on_track" : "behind";

  return { status, avgPerDay, neededPerDay, daysRemaining, remaining };
};

// Slice a superset of tasks (e.g. a 90-day fetch) down to just the last N days,
// so the Trends range toggle doesn't need a fresh network request each time.
export const filterTasksToRange = (tasks, days) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return tasks.filter((t) => new Date(t.date) >= cutoff);
};

export const filterTasksToToday = (tasks) => {
  const todayIso = toISODate(new Date());
  return tasks.filter((t) => toISODate(t.date) === todayIso);
};