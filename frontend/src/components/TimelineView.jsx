import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { formatFullDate } from "../utils/dateUtils.js";
import { getCategoryMeta, timeToMinutes } from "../utils/categoryMeta.js";
import ProgressPrompt from "./ProgressPrompt.jsx";

export default function TimelineView({ date, tasks, goals = [], onToggleComplete, onEditTask, onAddTask, onPrevDay, onNextDay, onDateClick }) {
  const [promptTask, setPromptTask] = useState(null);
  const sorted = [...tasks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const findGoal = (task) => {
    const goalId = task.goal?._id || task.goal;
    return goals.find((g) => g._id === goalId);
  };

  const handleCheckboxChange = (task) => {
    if (!task.completed && task.goal) {
      setPromptTask(task);
    } else {
      onToggleComplete(task);
    }
  };

  const handleConfirmProgress = (amount) => {
    onToggleComplete(promptTask, amount);
    setPromptTask(null);
  };

  return (
    <div>
      <div className="flex-row" style={{ justifyContent: "center", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
        <button className="btn btn-icon btn-ghost" onClick={onPrevDay} aria-label="Previous day">
          <ChevronLeft size={20} />
        </button>
        <button className="btn-ghost flex-row gap-1" onClick={onDateClick} style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)" }}>
          <CalendarDays size={16} />
          <h3 style={{ margin: 0 }}>{formatFullDate(date)}</h3>
        </button>
        <button className="btn btn-icon btn-ghost" onClick={onNextDay} aria-label="Next day">
          <ChevronRight size={20} />
        </button>
      </div>

      {sorted.length === 0 && <p className="text-muted">Nothing scheduled for this day.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((t) => {
          const meta = getCategoryMeta(t.category);
          const startMin = timeToMinutes(t.startTime);
          const endMin = timeToMinutes(t.endTime);
          const durationLabel = formatDuration(endMin - startMin);

          return (
            <div key={t._id} style={{ display: "flex", gap: 10 }}>
              <div className="time-mono text-xs text-muted" style={{ width: 54, flexShrink: 0, textAlign: "right", paddingTop: 12 }}>
                {formatTime(t.startTime)}
              </div>

              <div
                onClick={() => onEditTask(t)}
                className="card"
                style={{
                  flex: 1,
                  borderLeft: `4px solid ${meta.color}`,
                  cursor: "pointer",
                  opacity: t.completed ? 0.55 : 1,
                  padding: "10px 14px",
                }}
              >
                <div className="flex-between mb-1">
                  <span className="badge" style={{ background: meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleCheckboxChange(t)}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
                <div style={{ fontWeight: 600, textDecoration: t.completed ? "line-through" : "none" }}>
                  {t.title}
                </div>
                <div className="text-xs text-muted time-mono">
                  {durationLabel}
                  {t.completed && t.goal && t.progressAmount > 0 && (
                    <span className="time-mono"> · logged {t.progressAmount} {findGoal(t)?.unit || ""}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="fab" onClick={onAddTask} aria-label="Add block">
        <Plus size={26} />
      </button>

      {promptTask && (
        <ProgressPrompt
          task={promptTask}
          goal={findGoal(promptTask)}
          onConfirm={handleConfirmProgress}
          onCancel={() => setPromptTask(null)}
        />
      )}
    </div>
  );
}

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}