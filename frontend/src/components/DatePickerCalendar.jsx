import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthGrid, isSameDay, isSameMonth, formatMonthYear } from "../utils/dateUtils.js";

export default function DatePickerCalendar({ month, onChangeMonth, selectedDay, onSelectDay, onToday }) {
  const days = getMonthGrid(month);
  const today = new Date();
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="card" style={{ width: 300 }}>
      <div className="flex-between mb-3">
        <button className="btn btn-icon btn-ghost" onClick={() => onChangeMonth(-1)} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <strong className="text-sm">{formatMonthYear(month)}</strong>
        <button className="btn btn-icon btn-ghost" onClick={() => onChangeMonth(1)} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {weekdayLabels.map((d, i) => (
          <div key={i} className="text-xs text-muted" style={{ textAlign: "center" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className="btn-ghost"
              style={{
                aspectRatio: "1",
                borderRadius: "var(--radius-sm)",
                border: "none",
                fontSize: "var(--text-sm)",
                fontWeight: isToday ? 700 : 400,
                color: isSelected ? "white" : isToday ? "var(--color-accent)" : inMonth ? "var(--color-ink)" : "var(--color-muted)",
                background: isSelected ? "var(--color-accent)" : "transparent",
                opacity: inMonth ? 1 : 0.5,
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <button className="btn btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={onToday}>
        Today
      </button>
    </div>
  );
}