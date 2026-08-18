import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    progressAmount: { type: Number, default: 0 }, // e.g. 10 (pages) — only counted toward the goal if this task is completed
    title: { type: String, required: true },
    notes: { type: String },
    date: { type: Date, required: true, index: true },
    startTime: { type: String },
    endTime: { type: String },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    category: { type: String, default: "general" },
    completed: { type: Boolean, default: false },
    subtasks: [
      {
        title: String,
        completed: { type: Boolean, default: false },
      },
    ],
    recurrence: {
      type: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
      interval: { type: Number, default: 1 },
      endDate: { type: Date },
    },
    reminderAt: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, date: 1 });
taskSchema.index({ goal: 1 });

export default mongoose.model("Task", taskSchema);