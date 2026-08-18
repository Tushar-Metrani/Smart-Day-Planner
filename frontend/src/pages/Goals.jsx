import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { computeGoalScore, deadlineLabel } from "../utils/goalUtils.js";

const PRIORITIES = ["low", "medium", "high"];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("general");
  const [unit, setUnit] = useState("pages");
  const [targetValue, setTargetValue] = useState(100);

  const fetchGoals = async () => {
    const { data } = await api.get("/goals");
    setGoals(data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const addGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/goals", {
      title,
      priority,
      category,
      deadline: deadline || undefined,
      unit,
      targetValue: Number(targetValue) || 1,
    });
    setTitle("");
    setDeadline("");
    setPriority("medium");
    fetchGoals();
  };

  const updateStatus = async (goal, status) => {
    await api.put(`/goals/${goal._id}`, { status });
    fetchGoals();
  };

  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    fetchGoals();
  };

  const pending = goals
    .filter((g) => g.status !== "completed")
    .sort((a, b) => computeGoalScore(b) - computeGoalScore(a));
  const completed = goals.filter((g) => g.status === "completed");

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
      <h2>Goals</h2>
      <p style={{ color: "#666", fontSize: 14 }}>
        Progress fills in automatically from completed schedule blocks linked to each goal — go to{" "}
        <Link to="/">Schedule</Link> to log a session.
      </p>

      <form onSubmit={addGoal} style={{ display: "flex", gap: 8, margin: "16px 0", flexWrap: "wrap" }}>
        <input placeholder="Goal title..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 2 }} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 100 }} />
        <input placeholder="Unit (pages, km...)" value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: 130 }} />
        <input type="number" min="1" placeholder="Target" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} style={{ width: 90 }} />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <h3>Pending ({pending.length})</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {pending.map((g) => {
          const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
          return (
            <li key={g._id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, color: "white", background: priorityColor(g.priority) }}>
                  {g.priority}
                </span>
                <div style={{ flex: 1 }}>
                  <div>{g.title}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {g.category}
                    {g.deadline && ` · ${deadlineLabel(g.deadline)}`}
                    {g.status === "in_progress" && " · In progress"}
                  </div>
                </div>
                {g.status !== "in_progress" && (
                  <button onClick={() => updateStatus(g, "in_progress")}>Start</button>
                )}
                <button onClick={() => updateStatus(g, "completed")}>Mark done</button>
                <button onClick={() => deleteGoal(g._id)} style={{ color: "red" }}>Delete</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 3 }}>
                <span>{g.currentValue} / {g.targetValue} {g.unit}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
                <div style={{ width: `${pct}%`, background: "#2563eb", height: 8, borderRadius: 4 }} />
              </div>
            </li>
          );
        })}
        {pending.length === 0 && <p style={{ color: "#888" }}>Nothing pending — add a goal above.</p>}
      </ul>

      {completed.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Completed ({completed.length})</h3>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {completed.map((g) => (
              <li key={g._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, color: "#888" }}>
                <span style={{ textDecoration: "line-through", flex: 1 }}>
                  {g.title} ({g.currentValue}/{g.targetValue} {g.unit})
                </span>
                <button onClick={() => deleteGoal(g._id)} style={{ color: "red" }}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function priorityColor(priority) {
  switch (priority) {
    case "high": return "#dc2626";
    case "low": return "#65a30d";
    default: return "#2563eb";
  }
}