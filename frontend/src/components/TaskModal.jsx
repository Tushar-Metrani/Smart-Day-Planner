import { useState, useEffect } from "react";
import { CATEGORY_LIST, getCategoryMeta } from "../utils/categoryMeta.js";

const PRIORITIES = ["low", "medium", "high"];

export default function TaskModal({ date, existingTask, goals = [], onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(existingTask?.title || "");
  const [notes, setNotes] = useState(existingTask?.notes || "");
  const [startTime, setStartTime] = useState(existingTask?.startTime || "");
  const [endTime, setEndTime] = useState(existingTask?.endTime || "");
  const [priority, setPriority] = useState(existingTask?.priority || "medium");
  const [category, setCategory] = useState(existingTask?.category || "general");
  const [recurrenceType, setRecurrenceType] = useState(existingTask?.recurrence?.type || "none");
  const [goalId, setGoalId] = useState(existingTask?.goal?._id || existingTask?.goal || "");
  const [progressAmount, setProgressAmount] = useState(existingTask?.progressAmount || "");

  useEffect(() => {
    setTitle(existingTask?.title || "");
    setNotes(existingTask?.notes || "");
    setStartTime(existingTask?.startTime || "");
    setEndTime(existingTask?.endTime || "");
    setPriority(existingTask?.priority || "medium");
    setCategory(existingTask?.category || "general");
    setRecurrenceType(existingTask?.recurrence?.type || "none");
    setGoalId(existingTask?.goal?._id || existingTask?.goal || "");
    setProgressAmount(existingTask?.progressAmount || "");
  }, [existingTask]);

  const linkedGoal = goals.find((g) => g._id === goalId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      notes,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      priority,
      category,
      recurrence: { type: recurrenceType, interval: 1 },
      goal: goalId || undefined,
      progressAmount: goalId ? Number(progressAmount) || 0 : 0,
    });
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3>{existingTask ? "Edit block" : "New block"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

          <div style={{ display: "flex", gap: 10 }}>
            <label style={{ flex: 1 }}>
              Start
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: "100%" }} />
            </label>
            <label style={{ flex: 1 }}>
              End
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: "100%" }} />
            </label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <label style={{ flex: 1 }}>
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: "100%" }}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label style={{ flex: 1 }}>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
                {CATEGORY_LIST.map((c) => (
                  <option key={c} value={c}>{getCategoryMeta(c).icon} {getCategoryMeta(c).label}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Repeats
            <select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)} style={{ width: "100%" }}>
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>

          {goals.length > 0 && (
            <label>
              Link to goal (optional)
              <select value={goalId} onChange={(e) => setGoalId(e.target.value)} style={{ width: "100%" }}>
                <option value="">None</option>
                {goals.map((g) => (
                  <option key={g._id} value={g._id}>{g.title}</option>
                ))}
              </select>
            </label>
          )}

          {goalId && linkedGoal && (
            <label>
              Progress this session ({linkedGoal.unit})
              <input
                type="number"
                min="0"
                placeholder={`e.g. 10 ${linkedGoal.unit}`}
                value={progressAmount}
                onChange={(e) => setProgressAmount(e.target.value)}
                style={{ width: "100%" }}
              />
              <span style={{ fontSize: 11, color: "#888" }}>
                Only counted toward the goal once this block is marked complete.
              </span>
            </label>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <div>
              {existingTask && (
                <button type="button" onClick={() => onDelete(existingTask._id)} style={{ color: "red" }}>
                  Delete
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
};

const modalStyle = {
  background: "white",
  padding: 24,
  borderRadius: 8,
  width: 360,
  maxWidth: "90vw",
};