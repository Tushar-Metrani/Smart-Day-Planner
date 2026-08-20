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

const PRIORITY_COLOR = { high: "#dc2626", medium: "#2563eb", low: "#65a30d" };
const FETCH_WINDOW_DAYS = 90; // fetched once; range toggle just slices this locally

export default function Analytics() {
  const [rangeDays, setRangeDays] = useState(30);
  const [allTasks, setAllTasks] = useState([]); // last 90 days, fetched once
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
      <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
        <p style={{ color: "#888" }}>Loading stats...</p>
      </div>
    );
  }

  // Section 1: Today — always "right now", no range selector involved.
  const todayTasks = filterTasksToToday(allTasks);
  const todayStats = computeTaskStats(todayTasks);
  const streak = computeStreak(allTasks);

  // Section 2: Trends — everything here respects the range toggle.
  const rangeTasks = filterTasksToRange(allTasks, rangeDays);
  const rangeStats = computeTaskStats(rangeTasks);
  const trend = computeDailyTrend(rangeTasks, Math.min(rangeDays, 30)); // cap bars at 30 for readability
  const priorityBreakdown = computePriorityBreakdown(rangeTasks);
  const maxCategoryMinutes = Math.max(1, ...rangeStats.categoryBreakdown.map((c) => c.minutes));
  const maxTrendCompleted = Math.max(1, ...trend.map((d) => d.completed));

  // Section 3: Goals — current state, independent of any range.
  const goalStats = computeGoalStats(goals);
  const activeGoalsWithDeadline = goals.filter((g) => g.status !== "completed" && g.deadline);

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 4 }}>Analytics</h2>

      {/* ---------- SECTION 1: TODAY ---------- */}
      <h3 style={{ marginBottom: 8 }}>Today</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <StatCard label="Completed today" value={`${todayStats.completed}/${todayStats.total}`} />
        <StatCard label="Completion rate" value={`${todayStats.completionRate}%`} />
        <StatCard label="Time logged" value={formatMinutes(todayStats.totalCompletedMinutes)} />
        <StatCard label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
      </div>

      {/* ---------- SECTION 2: TRENDS ---------- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Trends</h3>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
        <StatCard label="Completion rate" value={`${rangeStats.completionRate}%`} />
        <StatCard label="Time completed" value={formatMinutes(rangeStats.totalCompletedMinutes)} />
      </div>

      <h4 style={{ marginBottom: 8 }}>Daily activity</h4>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90, marginBottom: 8 }}>
        {trend.map((d) => {
          const barHeight = d.completed ? Math.max(4, (d.completed / maxTrendCompleted) * 80) : 2;
          return (
            <div
              key={d.iso}
              title={`${d.completed}/${d.total} completed`}
              style={{ flex: 1, display: "flex", alignItems: "flex-end", height: "100%" }}
            >
              <div style={{ width: "100%", height: barHeight, background: d.completed ? "#2563eb" : "#eee", borderRadius: 2 }} />
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 24 }}>
        Bar height = tasks completed per day, last {trend.length} days.
      </div>

      <h4 style={{ marginBottom: 8 }}>Follow-through by priority</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {priorityBreakdown.map((p) => (
          <div key={p.priority}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
              <span style={{ textTransform: "capitalize" }}>{p.priority}</span>
              <span style={{ color: "#888" }}>{p.total ? `${p.completed}/${p.total} · ${p.rate}%` : "No blocks"}</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: 4, height: 8 }}>
              <div style={{ width: `${p.rate || 0}%`, background: PRIORITY_COLOR[p.priority], height: 8, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <h4 style={{ marginBottom: 8 }}>Time by category</h4>
      {rangeStats.categoryBreakdown.length === 0 && (
        <p style={{ color: "#888" }}>No completed blocks in this period yet.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {rangeStats.categoryBreakdown.map((c) => {
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

      {/* ---------- SECTION 3: GOALS ---------- */}
      <h3 style={{ marginBottom: 8 }}>Goals</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <StatCard label="Completed" value={goalStats.completed} />
        <StatCard label="Pending" value={goalStats.pending} />
        <StatCard label="Overdue" value={goalStats.overdue} accent={goalStats.overdue > 0 ? "#dc2626" : undefined} />
      </div>

      <h4 style={{ marginBottom: 8 }}>Pace</h4>
      {activeGoalsWithDeadline.length === 0 && (
        <p style={{ color: "#888" }}>No active goals with a deadline set yet.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
    </div>
  );
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