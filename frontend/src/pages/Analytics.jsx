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
  filterTasksToRange,
  filterTasksToToday,
} from "../utils/statsUtils.js";

const RANGE_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const PRIORITY_VAR = {
  high: "var(--color-priority-high)",
  medium: "var(--color-priority-medium)",
  low: "var(--color-priority-low)",
};

const FETCH_WINDOW_DAYS = 90;

export default function Analytics() {
  const [rangeDays, setRangeDays] = useState(30);
  const [allTasks, setAllTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - FETCH_WINDOW_DAYS);

      const [tasksRes, goalsRes] = await Promise.all([
        api.get("/tasks", { params: { start: start.toISOString(), end: end.toISOString() } }),
        api.get("/goals"),
      ]);
      setAllTasks(tasksRes.data);
      setGoals(goalsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <p className="text-muted">Loading stats...</p>
      </div>
    );
  }

  const todayTasks = filterTasksToToday(allTasks);
  const todayStats = computeTaskStats(todayTasks);
  const streak = computeStreak(allTasks);

  const rangeTasks = filterTasksToRange(allTasks, rangeDays);
  const rangeStats = computeTaskStats(rangeTasks);
  const trend = computeDailyTrend(rangeTasks, Math.min(rangeDays, 30));
  const priorityBreakdown = computePriorityBreakdown(rangeTasks);
  const maxCategoryMinutes = Math.max(1, ...rangeStats.categoryBreakdown.map((c) => c.minutes));
  const maxTrendTotal = Math.max(1, ...trend.map((d) => d.total));

  const goalStats = computeGoalStats(goals);
  const activeGoalsWithDeadline = goals.filter((g) => g.status !== "completed" && g.deadline);

  return (
    <div className="page">
      <h2 className="mb-4 page-title">Analytics</h2>

      {/* ---------- TODAY ---------- */}
      <div className="section">
        <h3 className="section-title">Today</h3>
        <div className="stat-grid stat-grid-4">
          <StatCard label="Completed today" value={`${todayStats.completed}/${todayStats.total}`} />
          <StatCard label="Completion rate" value={`${todayStats.completionRate}%`} />
          <StatCard label="Time logged" value={formatMinutes(todayStats.totalCompletedMinutes)} />
          <StatCard label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
        </div>
      </div>

      {/* ---------- TRENDS ---------- */}
      <div className="section">
        <div className="flex-between mb-3">
          <h3 style={{ margin: 0 }}>Trends</h3>
          <div className="flex-row gap-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                className={`btn btn-sm ${rangeDays === opt.days ? "btn-primary" : ""}`}
                onClick={() => setRangeDays(opt.days)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stat-grid mb-4">
          <StatCard label="Completion rate" value={`${rangeStats.completionRate}%`} />
          <StatCard label="Time completed" value={formatMinutes(rangeStats.totalCompletedMinutes)} />
        </div>

        <h4 className="mb-2">Daily activity</h4>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90, marginBottom: 6 }}>
          {trend.map((d) => {
            const scale = 80 / maxTrendTotal;
            const completedH = d.completed * scale;
            const missedH = d.missed * scale;
            const pendingH = d.pending * scale;
            const hasAny = d.total > 0;
            return (
              <div
                key={d.iso}
                title={`${d.completed} completed, ${d.missed} missed, ${d.pending} pending`}
                style={{ flex: 1, display: "flex", flexDirection: "column-reverse", height: "100%" }}
              >
                {!hasAny && <div style={{ width: "100%", height: 2, background: "var(--color-border)", borderRadius: 2 }} />}
                {d.completed > 0 && (
                  <div style={{ width: "100%", height: completedH, background: "var(--color-accent)", borderRadius: "2px 2px 0 0" }} />
                )}
                {d.missed > 0 && (
                  <div style={{ width: "100%", height: missedH, background: "#f3c4c1" }} />
                )}
                {d.pending > 0 && (
                  <div style={{ width: "100%", height: pendingH, background: "var(--color-border)" }} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex-row gap-3 text-xs text-muted mb-4">
          <Legend color="var(--color-accent)" label="Completed" />
          <Legend color="#f3c4c1" label="Missed" />
          <Legend color="var(--color-border)" label="Pending today" />
        </div>

        <h4 className="mb-2">Follow-through by priority</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="mb-4">
          {priorityBreakdown.map((p) => (
            <div key={p.priority}>
              <div className="progress-meta">
                <span style={{ textTransform: "capitalize" }}>{p.priority}</span>
                <span>{p.total ? `${p.completed}/${p.total} · ${p.rate}%` : "No blocks"}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${p.rate || 0}%`, background: PRIORITY_VAR[p.priority] }} />
              </div>
            </div>
          ))}
        </div>

        <h4 className="mb-2">Time by category</h4>
        {rangeStats.categoryBreakdown.length === 0 && (
          <p className="text-muted">No completed blocks in this period yet.</p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rangeStats.categoryBreakdown.map((c) => {
            const meta = getCategoryMeta(c.category);
            const widthPct = (c.minutes / maxCategoryMinutes) * 100;
            return (
              <div key={c.category}>
                <div className="progress-meta">
                  <span>{meta.icon} {meta.label}</span>
                  <span className="time-mono">{formatMinutes(c.minutes)} · {c.count} block{c.count === 1 ? "" : "s"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${widthPct}%`, background: meta.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- GOALS ---------- */}
      <div className="section" style={{ marginBottom: 0 }}>
        <h3 className="section-title">Goals</h3>
        <div className="stat-grid mb-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <StatCard label="Completed" value={goalStats.completed} />
          <StatCard label="Pending" value={goalStats.pending} />
          <StatCard label="Overdue" value={goalStats.overdue} accent={goalStats.overdue > 0} />
        </div>

        <h4 className="mb-2">Pace</h4>
        {activeGoalsWithDeadline.length === 0 && (
          <p className="text-muted">No active goals with a deadline set yet.</p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeGoalsWithDeadline.map((g) => {
            const pace = computeGoalPace(g);
            const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
            return (
              <div key={g._id} className="card">
                <div className="flex-between mb-1">
                  <span style={{ fontWeight: 600 }}>{g.title}</span>
                  <PaceBadge pace={pace} />
                </div>
                <p className="text-xs text-muted" style={{ margin: "4px 0" }}>
                  {pace.status === "overdue" && `Deadline passed, ${g.targetValue - g.currentValue} ${g.unit} remaining`}
                  {pace.status === "on_track" && `${pace.avgPerDay.toFixed(1)}/day so far — needs ${pace.neededPerDay.toFixed(1)}/day to finish on time`}
                  {pace.status === "behind" && `${pace.avgPerDay.toFixed(1)}/day so far — needs ${pace.neededPerDay.toFixed(1)}/day to finish on time`}
                  {pace.status === "due_today" && `Due today, ${pace.remaining} ${g.unit} remaining`}
                </p>
                <div className="progress-meta">
                  <span>{g.currentValue} / {g.targetValue} {g.unit}</span>
                  <span>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex-row gap-1">
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function PaceBadge({ pace }) {
  const map = {
    on_track: { label: "On track", cls: "badge-status-success" },
    behind: { label: "Behind pace", cls: "badge-status-danger" },
    overdue: { label: "Overdue", cls: "badge-status-danger-strong" },
    due_today: { label: "Due today", cls: "badge-status-highlight" },
    complete: { label: "Target reached", cls: "badge-status-accent" },
  };
  const m = map[pace.status];
  if (!m) return null;
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className={`stat-card-value${accent ? " accent-danger" : ""}`}>{value}</div>
    </div>
  );
}