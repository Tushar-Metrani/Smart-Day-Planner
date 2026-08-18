const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

export const daysUntil = (date) => {
  if (!date) return null;
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// Higher score = more urgent. Priority matters most; a closer/overdue deadline
// pushes the score up further, but doesn't override priority weighting alone.
export const computeGoalScore = (goal) => {
  let score = PRIORITY_WEIGHT[goal.priority] * 100;
  const days = daysUntil(goal.deadline);
  if (days !== null) {
    if (days < 0) score += 500; // overdue: bump to top
    else score += Math.max(0, 100 - days * 5); // closer deadline = more urgency
  }
  return score;
};

export const deadlineLabel = (date) => {
  const days = daysUntil(date);
  if (days === null) return null;
  if (days < 0) return `Overdue by ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
};