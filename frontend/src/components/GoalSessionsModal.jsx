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
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{goal.title} — sessions</h3>
        <p style={{ fontSize: 13, color: "#888", marginTop: -8 }}>
          Every completed block that contributed to this goal's progress.
        </p>

        {loading && <p style={{ color: "#888" }}>Loading...</p>}

        {!loading && sessions.length === 0 && (
          <p style={{ color: "#888" }}>No sessions logged yet.</p>
        )}

        {!loading && sessions.length > 0 && (
          <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.map((s) => {
              const meta = getCategoryMeta(s.category);
              return (
                <div
                  key={s._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    border: "1px solid #eee",
                    borderLeft: `4px solid ${meta.color}`,
                    borderRadius: 6,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>
                      {new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      {s.startTime && ` · ${s.startTime}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                    +{s.progressAmount} {goal.unit}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={onClose}>Close</button>
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
  zIndex: 100,
};

const modalStyle = {
  background: "white",
  padding: 24,
  borderRadius: 8,
  width: 420,
  maxWidth: "90vw",
};