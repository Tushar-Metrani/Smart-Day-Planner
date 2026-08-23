import { useState } from "react";

const PRIORITIES = ["low", "medium", "high"];

export default function GoalModal({ existingGoal, onSave, onClose }) {
  const [title, setTitle] = useState(existingGoal?.title || "");
  const [priority, setPriority] = useState(existingGoal?.priority || "medium");
  const [unit, setUnit] = useState(existingGoal?.unit || "pages");
  const [targetValue, setTargetValue] = useState(existingGoal?.targetValue || 100);
  const [deadline, setDeadline] = useState(existingGoal?.deadline ? existingGoal.deadline.slice(0, 10) : "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (Number(targetValue) <= 0) {
      setError("Target must be greater than 0.");
      return;
    }
    onSave({
      title,
      priority,
      unit,
      targetValue: Number(targetValue) || 1,
      deadline: deadline || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{existingGoal ? "Edit goal" : "New goal"}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <input className="input" placeholder="Goal title (e.g. Read Atomic Habits)" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />

          <div className="field">
            <label className="field-label">Priority</label>
            <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Unit</label>
              <input className="input" placeholder="pages, km, hours..." value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Target</label>
              <input type="number" min="1" className="input" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Deadline (optional)</label>
            <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>

          {existingGoal && (
            <p className="text-xs text-muted" style={{ margin: 0 }}>
              Current progress: {existingGoal.currentValue} {existingGoal.unit} — calculated from your completed
              schedule blocks, not editable directly.
            </p>
          )}

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{existingGoal ? "Save changes" : "Add goal"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}