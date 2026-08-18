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
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [goalId, setGoalId] = useState(existingTask?.goal?._id || existingTask?.goal || "");
  const [progressAmount, setProgressAmount] = useState(existingTask?.progressAmount || "");
  const [scope, setScope] = useState("this"); // "this" | "future" — only relevant when editing a series instance

  const isEditingSeriesInstance = Boolean(existingTask?.seriesId);

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
    setScope("this");
  }, [existingTask]);

  const linkedGoal = goals.find((g) => g._id === goalId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title,
      notes,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      priority,
      category,
      goal: goalId || undefined,
      progressAmount: goalId ? Number(progressAmount) || 0 : 0,
    };
    if (!existingTask) {
      payload.recurrence = { type: recurrenceType, interval: 1, endDate: recurrenceEnd || undefined };
    }
    onSave(payload, scope);
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

          {!existingTask && (
            <>
              <label>
                Repeats
                <select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)} style={{ width: "100%" }}>
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              {recurrenceType !== "none" && (
                <label>
                  Ends on (optional — defaults to 90 days out)
                  <input type="date" value={recurrenceEnd} onChange={(e) => setRecurrenceEnd(e.target.value)} style={{ width: "100%" }} />
                </label>
              )}
            </>
          )}

          {isEditingSeriesInstance && (
            <div style={{ fontSize: 13, background: "#f8f8f8", padding: 8, borderRadius: 6 }}>
              <div style={{ marginBottom: 4, color: "#666" }}>Part of a repeating series. Apply changes to:</div>
              <label style={{ display: "block" }}>
                <input type="radio" checked={scope === "this"} onChange={() => setScope("this")} /> Just this occurrence
              </label>
              <label style={{ display: "block" }}>
                <input type="radio" checked={scope === "future"} onChange={() => setScope("future")} /> This and all future occurrences
              </label>
            </div>
          )}

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
            </label>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <div>
              {existingTask && (
                <button type="button" onClick={() => onDelete(existingTask._id, scope)} style={{ color: "red" }}>
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