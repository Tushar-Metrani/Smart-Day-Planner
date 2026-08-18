import mongoose from "mongoose";
import Task from "../models/Task.js";
import { generateRecurrenceDates } from "../utils/recurrence.js";

export const getTasks = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const filter = { user: req.userId };
    if (start && end) {
      filter.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const tasks = await Task.find(filter).sort({ date: 1, startTime: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { recurrence, date } = req.body;
    const isRecurring = recurrence && recurrence.type && recurrence.type !== "none";

    if (!isRecurring) {
      const task = await Task.create({ ...req.body, user: req.userId });
      return res.status(201).json([task]);
    }

    const seriesId = new mongoose.Types.ObjectId().toString();
    const dates = generateRecurrenceDates(new Date(date), recurrence);
    const docs = dates.map((d) => ({
      ...req.body,
      date: d,
      seriesId,
      user: req.userId,
    }));
    const created = await Task.insertMany(docs);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// Fields that must never be bulk-copied across a series (each occurrence keeps its own).
const SERIES_EXCLUDED_FIELDS = ["date", "_id", "seriesId", "completed"];

const sanitizeSeriesUpdate = (body) => {
  const clean = { ...body };
  for (const field of SERIES_EXCLUDED_FIELDS) delete clean[field];
  return clean;
};

export const updateTask = async (req, res, next) => {
  try {
    const { scope } = req.query; // "this" (default) | "future"
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (scope === "future" && task.seriesId) {
      const update = sanitizeSeriesUpdate(req.body);
      await Task.updateMany(
        { seriesId: task.seriesId, user: req.userId, date: { $gte: task.date } },
        { $set: update }
      );
      const updated = await Task.find({
        seriesId: task.seriesId,
        user: req.userId,
        date: { $gte: task.date },
      });
      return res.json(updated);
    }

    Object.assign(task, req.body);
    await task.save();
    res.json([task]);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { scope } = req.query;
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (scope === "future" && task.seriesId) {
      await Task.deleteMany({ seriesId: task.seriesId, user: req.userId, date: { $gte: task.date } });
      return res.json({ message: "This and future occurrences deleted" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};