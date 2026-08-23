import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { getCategoryMeta } from "../utils/categoryMeta.js";

export default function GoalSessionsModal({ goal, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await api.get(`/goals/${goal._id}/sessions`);
      setSessions(data);
      setLoading(false);
    };
    fetchSessions();
  }, [goal._id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{goal.title} — sessions</h3>
        <p className="text-sm text-muted" style={{ marginTop: -4, marginBottom: 12 }}>
          Every completed block that contributed to this goal's progress.
        </p>

        {loading && <p className="text-muted">Loading...</p>}
        {!loading && sessions.length === 0 && <p className="text-muted">No sessions logged yet.</p>}

        {!loading && sessions.length > 0 && (
          <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.map((s) => {
              const meta = getCategoryMeta(s.category);
              return (
                <div
                  key={s._id}
                  className="card flex-between"
                  style={{ borderLeft: `4px solid ${meta.color}`, padding: "8px 12px" }}
                >
                  <div>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{s.title}</div>
                    <div className="text-xs text-muted time-mono">
                      {new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      {s.startTime && ` · ${s.startTime}`}
                    </div>
                  </div>
                  <div className="text-sm time-mono" style={{ fontWeight: 700, color: "var(--color-accent)" }}>
                    +{s.progressAmount} {goal.unit}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}