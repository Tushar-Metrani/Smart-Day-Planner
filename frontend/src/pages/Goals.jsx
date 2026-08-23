import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import api from "../api/axios.js";
import GoalModal from "../components/GoalModal.jsx";
import GoalSessionsModal from "../components/GoalSessionsModal.jsx";
import { computeGoalScore, deadlineLabel } from "../utils/goalUtils.js";

const PRIORITY_CLASS = {
  high: "badge-priority-high",
  medium: "badge-priority-medium",
  low: "badge-priority-low",
};

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
    <div className="page">
      <h2 className="mb-1">Goals</h2>
      <p className="text-sm text-muted mb-4">
        Progress fills in automatically from completed schedule blocks linked to each goal — go to{" "}
        <Link to="/">Schedule</Link> to log a session.
      </p>

      <div className="section">
        <h3 className="section-title">Pending ({pending.length})</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.map((g) => {
            const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
            const inProgress = g.currentValue > 0;
            return (
              <div key={g._id} className="card">
                <div className="flex-row gap-2 mb-2">
                  <span className={`badge ${PRIORITY_CLASS[g.priority]}`}>{g.priority}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{g.title}</div>
                    <div className="text-xs text-muted">
                      {g.deadline && deadlineLabel(g.deadline)}
                      {inProgress && (g.deadline ? " · In progress" : "In progress")}
                    </div>
                  </div>
                </div>

                <div className="progress-meta">
                  <button className="btn-link" onClick={() => setSessionsGoal(g)}>
                    {g.currentValue} / {g.targetValue} {g.unit}
                  </button>
                  <span>{pct}%</span>
                </div>
                <div className="progress-track mb-3">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>

                <div className="flex-row gap-2" style={{ justifyContent: "flex-end" }}>
                  <button className="btn btn-sm" onClick={() => openEditGoalModal(g)}>Edit</button>
                  <button className="btn btn-sm" onClick={() => updateStatus(g, "completed")}>Mark done</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteGoal(g._id)}>Delete</button>
                </div>
              </div>
            );
          })}
          {pending.length === 0 && <p className="text-muted">Nothing pending — tap + to add a goal.</p>}
        </div>
      </div>

      {completed.length > 0 && (
        <div className="section">
          <h3 className="section-title">Completed ({completed.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {completed.map((g) => (
              <div key={g._id} className="card flex-between">
                <button
                  onClick={() => setSessionsGoal(g)}
                  className="btn-link text-muted"
                  style={{ textDecoration: "line-through", textAlign: "left", flex: 1 }}
                >
                  {g.title} ({g.currentValue}/{g.targetValue} {g.unit})
                </button>
                <div className="flex-row gap-2">
                  <button className="btn btn-sm" onClick={() => updateStatus(g, "pending")}>Reopen</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteGoal(g._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="fab" onClick={openNewGoalModal} aria-label="Add goal">
        <Plus size={26} />
      </button>

      {modalOpen && (
        <GoalModal existingGoal={editingGoal} onSave={handleSave} onClose={() => setModalOpen(false)} />
      )}
      {sessionsGoal && (
        <GoalSessionsModal goal={sessionsGoal} onClose={() => setSessionsGoal(null)} />
      )}
    </div>
  );
}