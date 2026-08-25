import User from "../models/User.js";
import Task from "../models/Task.js";
import { fetchGoalsWithProgress } from "./goalController.js";
import { computeFreeSlots } from "../utils/freeSlots.js";
import { computeGoalPace } from "../utils/goalPace.js";
import { getScheduleSuggestions } from "../services/groqClient.js";

export const suggestSchedule = async (req, res, next) => {
  try {
    const { date, categories } = req.body;
    if (!date) return res.status(400).json({ message: "date is required" });
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: "categories list is required" });
    }

    const user = await User.findById(req.userId);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [existingTasks, allGoals] = await Promise.all([
      Task.find({ user: req.userId, date: { $gte: dayStart, $lte: dayEnd } }),
      fetchGoalsWithProgress(req.userId),
    ]);

    const pendingGoals = allGoals
      .filter((g) => g.status !== "completed")
      .map((g) => ({ ...g, pace: computeGoalPace(g) }));

    const freeSlots = computeFreeSlots(existingTasks, user.workDayStart, user.workDayEnd);

    const dateLabel = new Date(date).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const suggestions = await getScheduleSuggestions({
      goals: pendingGoals,
      freeSlots,
      categories,
      dateLabel,
    });

    res.json({ suggestions, freeSlotsConsidered: freeSlots.length, goalsConsidered: pendingGoals.length });
  } catch (err) {
    next(err);
  }
};