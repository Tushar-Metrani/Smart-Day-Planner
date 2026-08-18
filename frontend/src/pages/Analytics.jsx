import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { getCategoryMeta } from "../utils/categoryMeta.js";
import {
  computeTaskStats,
  computeStreak,
  computeGoalStats,
  formatMinutes,
} from "../utils/statsUtils.js";

const RANGE_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export default function Analytics() {
  const [rangeDays, setRangeDays] = useState(30);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - rangeDays);

      const [tasksRes, goalsRes] = await Promise.all([
        api.get("/tasks", { params: { start: start.toISOString(), end: end.toISOString() } }),
        api.get("/goals"),
      ]);
      setTasks(tasksRes.data);
      setGoals(goalsRes.data);
      setLoading(false);
    };
    fetchData();
  }, [rangeDays]);

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
        <p style={{ color: "#888" }}>Loading stats...</p>
      </div>
    );
  }

  const taskStats = computeTaskStats(tasks);
  const streak = computeStreak(tasks);
  const goalStats = computeGoalStats(goals);
  const maxCategoryMinutes = Math.max(1, ...taskStats.categoryBreakdown.map((c) => c.minutes));

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Analytics</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setRangeDays(opt.days)}
              style={{ fontWeight: rangeDays === opt.days ? 700 : 400 }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Completion rate" value={`${taskStats.completionRate}%`} />
        <StatCard label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
        <StatCard label="Time completed" value={formatMinutes(taskStats.totalCompletedMinutes)} />
        <StatCard label="Blocks scheduled" value={taskStats.total} />
      </div>

      {/* Category breakdown */}
      <h3>Time by category</h3>
      {taskStats.categoryBreakdown.length === 0 && (
        <p style={{ color: "#888" }}>No completed blocks with a time range in this period yet.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {taskStats.categoryBreakdown.map((c) => {
          const meta = getCategoryMeta(c.category);
          const widthPct = (c.minutes / maxCategoryMinutes) * 100;
          return (
            <div key={c.category}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                <span>{meta.icon} {meta.label}</span>
                <span style={{ color: "#888" }}>{formatMinutes(c.minutes)} · {c.count} block{c.count === 1 ? "" : "s"}</span>
              </div>
              <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
                <div style={{ width: `${widthPct}%`, background: meta.color, height: 8, borderRadius: 4 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Goals summary */}
      <h3>Goals</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Completed" value={goalStats.completed} />
        <StatCard label="Pending" value={goalStats.pending} />
        <StatCard label="Overdue" value={goalStats.overdue} accent={goalStats.overdue > 0 ? "#dc2626" : undefined} />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || "#111" }}>{value}</div>
    </div>
  );
}