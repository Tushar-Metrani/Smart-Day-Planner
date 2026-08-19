import { useState } from "react";

export default function ProgressPrompt({ task, goal, onConfirm, onCancel }) {
  const [amount, setAmount] = useState(task.progressAmount || "");

  const handleConfirm = () => {
    onConfirm(Number(amount) || 0);
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h4 style={{ marginTop: 0 }}>Log progress</h4>
        <p style={{ fontSize: 13, color: "#666", marginTop: -6 }}>
          "{task.title}" is linked to <strong>{goal?.title || "a goal"}</strong>
        </p>
        <label style={{ display: "block", marginBottom: 12 }}>
          How many {goal?.unit || "units"} did you complete this session?
          <input
            type="number"
            min="0"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="button" onClick={handleConfirm}>Mark complete</button>
        </div>
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
  zIndex: 110,
};

const modalStyle = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  width: 320,
  maxWidth: "90vw",
};