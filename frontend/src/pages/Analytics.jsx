import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { getCategoryMeta } from "../utils/categoryMeta.js";
import {
  computeTaskStats,
  computeStreak,
  computeGoalStats,
  computeDailyTrend,
  computePriorityBreakdown,
  computeGoalPace,
  formatMinutes,
} from "../utils/statsUtils.js";

const RANGE_OPTIONS = [
  { label: "Today", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const PRIORITY_COLOR = { high: "#dc2626", medium: "#2563eb", low: "#65a30d" };

export default function Analytics() {
  const [rangeDays, setRangeDays] = useState(7);
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
  const trend = computeDailyTrend(tasks, Math.min(rangeDays, 30)); // cap bars at 30 so they stay readable
  const priorityBreakdown = computePriorityBreakdown(tasks);
  const activeGoalsWithDeadline = goals.filter((g) => g.status !== "completed" && g.deadline);

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Completion rate" value={`${taskStats.completionRate}%`} />
        <StatCard label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
        <StatCard label="Time completed" value={formatMinutes(taskStats.totalCompletedMinutes)} />
        <StatCard label="Blocks scheduled" value={taskStats.total} />
      </div>

      {/* Daily trend */}
      <h3>Daily activity</h3>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90, marginBottom: 8 }}>
        {trend.map((d) => {
          const barHeight = d.total ? Math.max(4, (d.completed / Math.max(1, maxTrendTotal(trend))) * 80) : 2;
          return (
            <div key={d.iso} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }} title={`${d.completed}/${d.total} completed`}>
              <div style={{ width: "100%", height: barHeight, background: d.completed ? "#2563eb" : "#eee", borderRadius: 2 }} />
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 24 }}>
        Bar height = tasks completed per day, last {trend.length} days. Hover a bar for the exact count.
      </div>

      {/* Priority follow-through */}
      <h3>Follow-through by priority</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {priorityBreakdown.map((p) => (
          <div key={p.priority}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
              <span style={{ textTransform: "capitalize" }}>{p.priority}</span>
              <span style={{ color: "#888" }}>
                {p.total ? `${p.completed}/${p.total} · ${p.rate}%` : "No blocks"}
              </span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
              <div style={{ width: `${p.rate || 0}%`, background: PRIORITY_COLOR[p.priority], height: 8, borderRadius: 4 }} />
            </div>
          </div>
        ))}
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

      {/* Goal pace */}
      <h3>Goal pace</h3>
      {activeGoalsWithDeadline.length === 0 && (
        <p style={{ color: "#888" }}>No active goals with a deadline set yet.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {activeGoalsWithDeadline.map((g) => {
          const pace = computeGoalPace(g);
          const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
          return (
            <div key={g._id} style={{ border: "1px solid #eee", borderRadius: 6, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{g.title}</span>
                <PaceBadge pace={pace} />
              </div>
              <div style={{ fontSize: 12, color: "#888", margin: "4px 0" }}>
                {pace.status === "overdue" && `Deadline passed, ${g.targetValue - g.currentValue} ${g.unit} remaining`}
                {pace.status === "on_track" && `${pace.avgPerDay.toFixed(1)}/day so far — needs ${pace.neededPerDay.toFixed(1)}/day to finish on time`}
                {pace.status === "behind" && `${pace.avgPerDay.toFixed(1)}/day so far — needs ${pace.neededPerDay.toFixed(1)}/day to finish on time`}
                {pace.status === "due_today" && `Due today, ${pace.remaining} ${g.unit} remaining`}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 3 }}>
                <span>{g.currentValue} / {g.targetValue} {g.unit}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
                <div style={{ width: `${pct}%`, background: "#2563eb", height: 8, borderRadius: 4 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Goals summary */}
      <h3>Goals overview</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Completed" value={goalStats.completed} />
        <StatCard label="Pending" value={goalStats.pending} />
        <StatCard label="Overdue" value={goalStats.overdue} accent={goalStats.overdue > 0 ? "#dc2626" : undefined} />
      </div>
    </div>
  );
}

function maxTrendTotal(trend) {
  return Math.max(1, ...trend.map((d) => d.completed));
}

function PaceBadge({ pace }) {
  const map = {
    on_track: { label: "On track", bg: "#16a34a" },
    behind: { label: "Behind pace", bg: "#dc2626" },
    overdue: { label: "Overdue", bg: "#991b1b" },
    due_today: { label: "Due today", bg: "#ea580c" },
    complete: { label: "Target reached", bg: "#2563eb" },
  };
  const m = map[pace.status];
  if (!m) return null;
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: m.bg, color: "white" }}>
      {m.label}
    </span>
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