import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import TimelineView from "../components/TimelineView.jsx";
import TaskModal from "../components/TaskModal.jsx";
import MonthView from "../components/MonthView.jsx";
import { getMonthGrid, toISODate, formatMonthYear, isSameMonth } from "../utils/dateUtils.js";

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch a whole month range around whatever month contains selectedDay,
  // so the mini date-picker's dots (task indicators) and the timeline share one fetch.
  const gridDays = useMemo(() => getMonthGrid(pickerMonth), [pickerMonth]);
  const rangeStart = gridDays[0];
  const rangeEnd = gridDays[gridDays.length - 1];

  const fetchTasks = async () => {
    const { data } = await api.get("/tasks", {
      params: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },
    });
    setTasks(data);
  };

  const fetchGoals = async () => {
    const { data } = await api.get("/goals");
    setGoals(data.filter((g) => g.status !== "completed"));
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerMonth]);

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    // Keep the picker's visible month in sync if the user jumps to a day
    // outside the currently loaded month (e.g. via prev/next day arrows).
    if (!isSameMonth(selectedDay, pickerMonth)) setPickerMonth(selectedDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  const tasksByDate = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      const iso = toISODate(t.date);
      if (!map[iso]) map[iso] = [];
      map[iso].push(t);
    }
    return map;
  }, [tasks]);

  const selectedDayTasks = tasksByDate[toISODate(selectedDay)] || [];

  const changeDay = (delta) => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + delta);
    setSelectedDay(d);
  };

  const goToday = () => setSelectedDay(new Date());

  const handlePickDay = (day) => {
    setSelectedDay(day);
    setPickerOpen(false);
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (editingTask) {
      await api.put(`/tasks/${editingTask._id}`, payload);
    } else {
      await api.post("/tasks", payload);
    }
    setModalOpen(false);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setModalOpen(false);
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await api.put(`/tasks/${task._id}`, { completed: !task.completed });
    fetchTasks();
  };

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
        <button onClick={goToday}>Today</button>
        <button onClick={() => setPickerOpen((o) => !o)}>📅 Jump to date</button>
      </div>

      {pickerOpen && (
        <div
          style={{
            position: "absolute",
            top: 44,
            right: 16,
            zIndex: 50,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: 12,
            width: 320,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <button onClick={() => setPickerMonth((d) => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}>◀</button>
            <strong>{formatMonthYear(pickerMonth)}</strong>
            <button onClick={() => setPickerMonth((d) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}>▶</button>
          </div>
          <MonthView currentDate={pickerMonth} tasksByDate={tasksByDate} onSelectDay={handlePickDay} />
        </div>
      )}

      <TimelineView
        date={selectedDay}
        tasks={selectedDayTasks}
        onToggleComplete={toggleComplete}
        onEditTask={openEditTaskModal}
        onAddTask={openNewTaskModal}
        onPrevDay={() => changeDay(-1)}
        onNextDay={() => changeDay(1)}
      />

      {modalOpen && (
        <TaskModal
          date={selectedDay}
          existingTask={editingTask}
          goals={goals}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}