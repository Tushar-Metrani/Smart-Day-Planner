import { getMonthGrid, isSameDay, isSameMonth, toISODate } from "../utils/dateUtils.js";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthView({ currentDate, tasksByDate, onSelectDay }) {
  const days = getMonthGrid(currentDate);
  const today = new Date();

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontWeight: 600, fontSize: 12, color: "#666" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((day) => {
          const iso = toISODate(day);
          const dayTasks = tasksByDate[iso] || [];
          const inMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={iso}
              onClick={() => onSelectDay(day)}
              style={{
                minHeight: 90,
                padding: 6,
                border: "1px solid #e5e5e5",
                borderRadius: 6,
                cursor: "pointer",
                background: inMonth ? "white" : "#fafafa",
                opacity: inMonth ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? "#2563eb" : "#333",
                  marginBottom: 4,
                }}
              >
                {day.getDate()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t._id}
                    style={{
                      fontSize: 11,
                      padding: "1px 4px",
                      borderRadius: 3,
                      background: priorityColor(t.priority),
                      color: "white",
                      textDecoration: t.completed ? "line-through" : "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: 10, color: "#888" }}>+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function priorityColor(priority) {
  switch (priority) {
    case "high": return "#dc2626";
    case "low": return "#65a30d";
    default: return "#2563eb";
  }
}