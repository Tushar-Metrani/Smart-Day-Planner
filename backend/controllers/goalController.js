import mongoose from "mongoose";
import Goal from "../models/Goal.js";
import Task from "../models/Task.js";

export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.userId }).sort({ createdAt: -1 });

    const progress = await Task.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          completed: true,
          goal: { $ne: null },
        },
      },
      { $group: { _id: "$goal", currentValue: { $sum: "$progressAmount" } } },
    ]);
    const progressMap = Object.fromEntries(progress.map((p) => [String(p._id), p.currentValue]));

    const goalsWithProgress = goals.map((g) => ({
      ...g.toObject(),
      currentValue: progressMap[String(g._id)] || 0,
    }));

    res.json(goalsWithProgress);
  } catch (err) {
    next(err);
  }
};

// Returns every completed, progress-logging task linked to this goal, newest first —
// the "receipts" behind the goal's currentValue total.
export const getGoalSessions = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const sessions = await Task.find({
      user: req.userId,
      goal: req.params.id,
      completed: true,
    })
      .sort({ date: -1, startTime: -1 })
      .select("title date startTime endTime progressAmount category");

    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const { currentValue, ...rest } = req.body;
    const goal = await Goal.create({ ...rest, user: req.userId });
    res.status(201).json({ ...goal.toObject(), currentValue: 0 });
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const { currentValue, ...rest } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      rest,
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal deleted" });
  } catch (err) {
    next(err);
  }
};