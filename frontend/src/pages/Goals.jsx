import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import GoalModal from "../components/GoalModal.jsx";
import GoalSessionsModal from "../components/GoalSessionsModal.jsx";
import { computeGoalScore, deadlineLabel } from "../utils/goalUtils.js";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [sessionsGoal, setSessionsGoal] = useState(null);

  const fetchGoals = async () => {
    const { data } = await api.get("/goals");
    setGoals(data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openNewGoalModal = () => {
    setEditingGoal(null);
    setModalOpen(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (editingGoal) {
      await api.put(`/goals/${editingGoal._id}`, payload);
    } else {
      await api.post("/goals", payload);
    }
    setModalOpen(false);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h2 style={{ margin: 0 }}>Goals</h2>
        <button onClick={openNewGoalModal}>+ Add goal</button>
      </div>
      <p style={{ color: "#666", fontSize: 14 }}>
        Progress fills in automatically from completed schedule blocks linked to each goal — go to{" "}
        <Link to="/">Schedule</Link> to log a session.
      </p>

      <h3>Pending ({pending.length})</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {pending.map((g) => {
          const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
          const inProgress = g.currentValue > 0;
          return (
            <li key={g._id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, color: "white", background: priorityColor(g.priority) }}>
                  {g.priority}
                </span>
                <div style={{ flex: 1 }}>
                  <div>{g.title}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {g.deadline && deadlineLabel(g.deadline)}
                    {inProgress && (g.deadline ? " · In progress" : "In progress")}
                  </div>
                </div>
                <button onClick={() => openEditGoalModal(g)}>Edit</button>
                <button onClick={() => updateStatus(g, "completed")}>Mark done</button>
                <button onClick={() => deleteGoal(g._id)} style={{ color: "red" }}>Delete</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 3 }}>
                <button
                  onClick={() => setSessionsGoal(g)}
                  style={{ background: "none", border: "none", padding: 0, color: "#2563eb", cursor: "pointer", fontSize: 12 }}
                >
                  {g.currentValue} / {g.targetValue} {g.unit}
                </button>
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
                <button
                  onClick={() => setSessionsGoal(g)}
                  style={{ background: "none", border: "none", padding: 0, textDecoration: "line-through", flex: 1, textAlign: "left", color: "#888", cursor: "pointer" }}
                >
                  {g.title} ({g.currentValue}/{g.targetValue} {g.unit})
                </button>
                <button onClick={() => updateStatus(g, "pending")}>Reopen</button>
                <button onClick={() => deleteGoal(g._id)} style={{ color: "red" }}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {modalOpen && (
        <GoalModal existingGoal={editingGoal} onSave={handleSave} onClose={() => setModalOpen(false)} />
      )}
      {sessionsGoal && (
        <GoalSessionsModal goal={sessionsGoal} onClose={() => setSessionsGoal(null)} />
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