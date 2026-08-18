import { formatFullDate, isSameDay } from "../utils/dateUtils.js";
import { getCategoryMeta, timeToMinutes } from "../utils/categoryMeta.js";

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 0;
const END_HOUR = 24;
const DEFAULT_DURATION = 30; // minutes, used when a block has no endTime

export default function TimelineView({ date, tasks, onToggleComplete, onEditTask, onAddTask, onPrevDay, onNextDay }) {
  const timed = tasks.filter((t) => t.startTime);
  const untimed = tasks.filter((t) => !t.startTime);

  const hours = [];
  for (let h = START_HOUR; h < END_HOUR; h++) hours.push(h);

  const today = new Date();
  const isToday = isSameDay(date, today);
  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onPrevDay}>◀</button>
          <h3 style={{ margin: 0 }}>{formatFullDate(date)}</h3>
          <button onClick={onNextDay}>▶</button>
        </div>
        <button onClick={onAddTask}>+ Add block</button>
      </div>

      {untimed.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {untimed.map((t) => {
            const meta = getCategoryMeta(t.category);
            return (
              <div
                key={t._id}
                onClick={() => onEditTask(t)}
                style={{
                  cursor: "pointer",
                  padding: "4px 10px",
                  borderRadius: 14,
                  background: meta.color,
                  color: "white",
                  fontSize: 12,
                  textDecoration: t.completed ? "line-through" : "none",
                }}
              >
                {meta.icon} {t.title} <span style={{ opacity: 0.8 }}>(no time set)</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position: "relative", display: "flex" }}>
        {/* Hour labels */}
        <div style={{ width: 56, flexShrink: 0 }}>
          {hours.map((h) => (
            <div key={h} style={{ height: HOUR_HEIGHT, fontSize: 11, color: "#888", textAlign: "right", paddingRight: 8, boxSizing: "border-box", transform: "translateY(-6px)" }}>
              {formatHour(h)}
            </div>
          ))}
        </div>

        {/* Timeline track */}
        <div style={{ position: "relative", flex: 1, borderLeft: "1px solid #e5e5e5" }}>
          {hours.map((h) => (
            <div key={h} style={{ height: HOUR_HEIGHT, borderBottom: "1px solid #f0f0f0" }} />
          ))}

          {isToday && nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60 && (
            <div
              style={{
                position: "absolute",
                top: (nowMinutes / 60) * HOUR_HEIGHT,
                left: 0,
                right: 0,
                borderTop: "2px solid #dc2626",
                zIndex: 5,
              }}
            >
              <div style={{ position: "absolute", left: -5, top: -5, width: 10, height: 10, borderRadius: "50%", background: "#dc2626" }} />
            </div>
          )}

          {timed.map((t) => {
            const startMin = timeToMinutes(t.startTime);
            const endMin = t.endTime ? timeToMinutes(t.endTime) : startMin + DEFAULT_DURATION;
            const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
            const height = Math.max(20, ((endMin - startMin) / 60) * HOUR_HEIGHT - 2);
            const meta = getCategoryMeta(t.category);
            const durationLabel = formatDuration(endMin - startMin);

            return (
              <div
                key={t._id}
                onClick={() => onEditTask(t)}
                style={{
                  position: "absolute",
                  top,
                  left: 8,
                  right: 8,
                  height,
                  background: "white",
                  border: `1px solid ${meta.color}33`,
                  borderLeft: `4px solid ${meta.color}`,
                  borderRadius: 6,
                  padding: "4px 8px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  overflow: "hidden",
                  opacity: t.completed ? 0.55 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleComplete(t)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                </div>
                <div style={{ fontSize: 13, textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</div>
                {height > 40 && <div style={{ fontSize: 11, color: "#888" }}>{durationLabel}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatHour(h) {
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${period}`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}