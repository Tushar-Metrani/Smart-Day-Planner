import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, default: "general" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    deadline: { type: Date },
    unit: { type: String, default: "sessions" }, // e.g. "pages", "km", "hours", "words"
    targetValue: { type: Number, default: 1 },
    status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);