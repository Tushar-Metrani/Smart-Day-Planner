import { useState } from "react";
import { formatFullDate } from "../utils/dateUtils.js";
import { getCategoryMeta, timeToMinutes } from "../utils/categoryMeta.js";
import ProgressPrompt from "./ProgressPrompt.jsx";

export default function TimelineView({ date, tasks, goals = [], onToggleComplete, onEditTask, onAddTask, onPrevDay, onNextDay }) {
  const [promptTask, setPromptTask] = useState(null);
  const sorted = [...tasks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const findGoal = (task) => {
    const goalId = task.goal?._id || task.goal;
    return goals.find((g) => g._id === goalId);
  };

  const handleCheckboxChange = (task) => {
    // Only intercept when *completing* a goal-linked task — unchecking needs no input.
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onPrevDay}>◀</button>
          <h3 style={{ margin: 0 }}>{formatFullDate(date)}</h3>
          <button onClick={onNextDay}>▶</button>
        </div>
        <button onClick={onAddTask}>+ Add block</button>
      </div>

      {sorted.length === 0 && <p style={{ color: "#888" }}>Nothing scheduled for this day.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((t) => {
          const meta = getCategoryMeta(t.category);
          const startMin = timeToMinutes(t.startTime);
          const endMin = timeToMinutes(t.endTime);
          const durationLabel = formatDuration(endMin - startMin);

          return (
            <div key={t._id} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 50, flexShrink: 0, fontSize: 12, color: "#888", textAlign: "right", paddingTop: 10 }}>
                {formatTime(t.startTime)}
              </div>

              <div
                onClick={() => onEditTask(t)}
                style={{
                  flex: 1,
                  background: "white",
                  border: "1px solid #eee",
                  borderLeft: `4px solid ${meta.color}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  opacity: t.completed ? 0.55 : 1,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "white",
                      background: meta.color,
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleCheckboxChange(t)}
                  />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, textDecoration: t.completed ? "line-through" : "none" }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {durationLabel}
                  {t.completed && t.goal && t.progressAmount > 0 && ` · logged ${t.progressAmount} ${findGoal(t)?.unit || ""}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
  return `${display}:${String(m).padStart(2, "0")}`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}