import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { computeGoalScore, deadlineLabel } from "../utils/goalUtils.js";

const PRIORITIES = ["low", "medium", "high"];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("general");

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
        Ordered by suggested priority — a mix of priority level and how close the deadline is.
      </p>

      <form onSubmit={addGoal} style={{ display: "flex", gap: 8, margin: "16px 0", flexWrap: "wrap" }}>
        <input placeholder="New goal..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 2 }} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 100 }} />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <h3>Pending ({pending.length})</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {pending.map((g) => (
          <li key={g._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: "1px solid #eee", borderRadius: 6 }}>
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
            <button onClick={() => updateStatus(g, "completed")}>Done</button>
            <button onClick={() => deleteGoal(g._id)} style={{ color: "red" }}>Delete</button>
          </li>
        ))}
        {pending.length === 0 && <p style={{ color: "#888" }}>Nothing pending — add a goal above.</p>}
      </ul>

      {completed.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Completed ({completed.length})</h3>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {completed.map((g) => (
              <li key={g._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, color: "#888" }}>
                <span style={{ textDecoration: "line-through", flex: 1 }}>{g.title}</span>
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