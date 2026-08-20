import { useState } from "react";
import { CATEGORY_LIST, getCategoryMeta } from "../utils/categoryMeta.js";

const PRIORITIES = ["low", "medium", "high"];

export default function GoalModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [unit, setUnit] = useState("pages");
  const [targetValue, setTargetValue] = useState(100);
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    onSave({
      title,
      category,
      priority,
      unit,
      targetValue: Number(targetValue) || 1,
      deadline: deadline || undefined,
    });
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>New goal</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Goal title (e.g. Read Atomic Habits)" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />

          <div style={{ display: "flex", gap: 10 }}>
            <label style={{ flex: 1 }}>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
                {CATEGORY_LIST.map((c) => (
                  <option key={c} value={c}>{getCategoryMeta(c).icon} {getCategoryMeta(c).label}</option>
                ))}
              </select>
            </label>
            <label style={{ flex: 1 }}>
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: "100%" }}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <label style={{ flex: 1 }}>
              Unit
              <input placeholder="pages, km, hours..." value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: "100%" }} />
            </label>
            <label style={{ flex: 1 }}>
              Target
              <input type="number" min="1" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} style={{ width: "100%" }} />
            </label>
          </div>

          <label>
            Deadline (optional)
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: "100%" }} />
          </label>

          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Add goal</button>
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