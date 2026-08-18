import { formatFullDate } from "../utils/dateUtils.js";

export default function DayView({ date, tasks, onToggleComplete, onEditTask, onAddTask }) {
  const sorted = [...tasks].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{formatFullDate(date)}</h3>
        <button onClick={onAddTask}>+ Add task</button>
      </div>

      {sorted.length === 0 && <p style={{ color: "#888" }}>No tasks for this day.</p>}

      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((t) => (
          <li
            key={t._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 8,
              border: "1px solid #eee",
              borderRadius: 6,
            }}
          >
            <input type="checkbox" checked={t.completed} onChange={() => onToggleComplete(t)} />
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onEditTask(t)}>
              <div style={{ textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {t.startTime && `${t.startTime}${t.endTime ? " - " + t.endTime : ""} · `}
                {t.category} · {t.priority}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}