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
  const daysElapsed = Math.max(1, daysBetween(goal.createdAt, now) + 1);
  const daysRemaining = daysBetween(now, goal.deadline);

  const avgPerDay = goal.currentValue / daysElapsed;
  const remaining = Math.max(0, goal.targetValue - goal.currentValue);

  if (remaining === 0) return { status: "complete", avgPerDay };
  if (daysRemaining < 0) return { status: "overdue", avgPerDay, remaining };
  if (daysRemaining === 0) return { status: "due_today", avgPerDay, remaining };

  const neededPerDay = remaining / daysRemaining;
  const status = avgPerDay >= neededPerDay ? "on_track" : "behind";
  return { status, avgPerDay, neededPerDay, daysRemaining, remaining };
};