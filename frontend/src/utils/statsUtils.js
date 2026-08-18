import { timeToMinutes } from "./categoryMeta.js";
import { toISODate } from "./dateUtils.js";

// Duration in minutes for a task; falls back to 30min if no endTime is set.
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

  // Time per category (completed tasks only — reflects time actually spent, not just planned)
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

// Current streak: consecutive days (counting back from today) that have at
// least one completed task. Breaks on the first day with zero completions.
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