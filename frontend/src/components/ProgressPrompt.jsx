import { useState } from "react";

export default function ProgressPrompt({ task, goal, onConfirm, onCancel }) {
  const [amount, setAmount] = useState(task.progressAmount || "");

  const handleConfirm = () => {
    onConfirm(Number(amount) || 0);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h4 className="modal-title">Log progress</h4>
        <p className="text-sm text-muted" style={{ marginTop: -4 }}>
          "{task.title}" is linked to <strong>{goal?.title || "a goal"}</strong>
        </p>
        <div className="field mb-3">
          <label className="field-label">How many {goal?.unit || "units"} did you complete this session?</label>
          <input
            type="number"
            min="0"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Mark complete</button>
        </div>
      </div>
    </div>
  );
}