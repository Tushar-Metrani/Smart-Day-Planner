import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import MonthView from "../components/MonthView.jsx";
import DayView from "../components/DayView.jsx";
import TimelineView from "../components/TimelineView.jsx";
import TaskModal from "../components/TaskModal.jsx";
import {
  getMonthGrid,
  toISODate,
  formatMonthYear,
  isSameMonth,
} from "../utils/dateUtils.js";

export default function Calendar() {
  const [view, setView] = useState("month"); // "month" | "timeline"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const gridDays = useMemo(() => getMonthGrid(currentDate), [currentDate]);
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
  }, [currentDate]);

  useEffect(() => {
    fetchGoals();
  }, []);

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

  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
  };

  const changeMonth = (delta) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  const changeDay = (delta) => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + delta);
    setSelectedDay(d);
    if (!isSameMonth(d, currentDate)) setCurrentDate(d); // triggers refetch for new range
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
    <div style={{ maxWidth: 1000, margin: "20px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <button onClick={() => setView("month")} style={{ fontWeight: view === "month" ? 700 : 400 }}>
          Month
        </button>
        <button onClick={() => setView("timeline")} style={{ fontWeight: view === "timeline" ? 700 : 400 }}>
          Timeline
        </button>
      </div>

      {view === "month" ? (
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <button onClick={() => changeMonth(-1)}>◀</button>
              <h3 style={{ margin: 0, minWidth: 180 }}>{formatMonthYear(currentDate)}</h3>
              <button onClick={() => changeMonth(1)}>▶</button>
              <button onClick={goToday}>Today</button>
            </div>
            <MonthView currentDate={currentDate} tasksByDate={tasksByDate} onSelectDay={setSelectedDay} />
          </div>

          <div style={{ flex: 1, borderLeft: "1px solid #eee", paddingLeft: 24 }}>
            <DayView
              date={selectedDay}
              tasks={selectedDayTasks}
              onToggleComplete={toggleComplete}
              onEditTask={openEditTaskModal}
              onAddTask={openNewTaskModal}
            />
          </div>
        </div>
      ) : (
        <TimelineView
          date={selectedDay}
          tasks={selectedDayTasks}
          onToggleComplete={toggleComplete}
          onEditTask={openEditTaskModal}
          onAddTask={openNewTaskModal}
          onPrevDay={() => changeDay(-1)}
          onNextDay={() => changeDay(1)}
        />
      )}

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