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
  const [scope, setScope] = useState("this");
  const [error, setError] = useState("");

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
    setScope("this");
    setError("");
  }, [existingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return;
    if (!startTime || !endTime) {
      setError("Start and end time are required.");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    const payload = {
      title,
      notes,
      date,
      startTime,
      endTime,
      priority,
      category,
      goal: goalId || undefined,
    };
    if (!existingTask) {
      payload.recurrence = { type: recurrenceType, interval: 1, endDate: recurrenceEnd || undefined };
    }
    onSave(payload, scope);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{existingTask ? "Edit block" : "New block"}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <textarea className="textarea" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

          <div className="form-row">
            <div className="field">
              <label className="field-label">Start *</label>
              <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="field">
              <label className="field-label">End *</label>
              <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Priority</label>
              <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Category</label>
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_LIST.map((c) => (
                  <option key={c} value={c}>{getCategoryMeta(c).icon} {getCategoryMeta(c).label}</option>
                ))}
              </select>
            </div>
          </div>

          {!existingTask && (
            <>
              <div className="field">
                <label className="field-label">Repeats</label>
                <select className="select" value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)}>
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {recurrenceType !== "none" && (
                <div className="field">
                  <label className="field-label">Ends on (optional — defaults to 90 days out)</label>
                  <input type="date" className="input" value={recurrenceEnd} onChange={(e) => setRecurrenceEnd(e.target.value)} />
                </div>
              )}
            </>
          )}

          {isEditingSeriesInstance && (
            <div className="text-sm" style={{ background: "var(--color-paper)", padding: 10, borderRadius: "var(--radius-sm)" }}>
              <div className="text-muted mb-1">Part of a repeating series. Apply changes to:</div>
              <label style={{ display: "block" }}>
                <input type="radio" checked={scope === "this"} onChange={() => setScope("this")} /> Just this occurrence
              </label>
              <label style={{ display: "block" }}>
                <input type="radio" checked={scope === "future"} onChange={() => setScope("future")} /> This and all future occurrences
              </label>
            </div>
          )}

          {goals.length > 0 && (
            <div className="field">
              <label className="field-label">Link to goal (optional)</label>
              <select className="select" value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                <option value="">None</option>
                {goals.map((g) => (
                  <option key={g._id} value={g._id}>{g.title}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions-split">
            <div>
              {existingTask && (
                <button type="button" className="btn btn-danger" onClick={() => onDelete(existingTask._id, scope)}>
                  Delete
                </button>
              )}
            </div>
            <div className="flex-row gap-2">
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
