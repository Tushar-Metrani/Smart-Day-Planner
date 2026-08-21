import { useEffect, useState } from "react";
import api from "../api/axios.js";
import TimelineView from "../components/TimelineView.jsx";
import TaskModal from "../components/TaskModal.jsx";
import DatePickerCalendar from "../components/DatePickerCalendar.jsx";
import { toISODate, isSameMonth } from "../utils/dateUtils.js";

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    const dayStart = new Date(selectedDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDay);
    dayEnd.setHours(23, 59, 59, 999);

    const { data } = await api.get("/tasks", {
      params: { start: dayStart.toISOString(), end: dayEnd.toISOString() },
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
  }, [selectedDay]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const changeDay = (delta) => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + delta);
    setSelectedDay(d);
  };

  const openPicker = () => {
    setPickerMonth(selectedDay);
    setPickerOpen((o) => !o);
  };

  const handlePickDay = (day) => {
    setSelectedDay(day);
    setPickerOpen(false);
  };

  const goToday = () => {
    const today = new Date();
    setSelectedDay(today);
    setPickerOpen(false);
  };

  const changePickerMonth = (delta) => {
    setPickerMonth((d) => {
      const n = new Date(d);
      n.setMonth(n.getMonth() + delta);
      return n;
    });
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (payload, scope) => {
    if (editingTask) {
      await api.put(`/tasks/${editingTask._id}?scope=${scope}`, payload);
    } else {
      await api.post("/tasks", payload);
    }
    setModalOpen(false);
    fetchTasks();
  };

  const handleDelete = async (id, scope) => {
    await api.delete(`/tasks/${id}?scope=${scope}`);
    setModalOpen(false);
    fetchTasks();
  };

  const toggleComplete = async (task, progressAmount) => {
    const payload = { completed: !task.completed };
    if (!task.completed && progressAmount !== undefined) {
      payload.progressAmount = progressAmount;
    }
    await api.put(`/tasks/${task._id}`, payload);
    fetchTasks();
  };

  return (
    <div className="page" style={{ position: "relative" }}>
      {pickerOpen && (
        <div style={{ position: "absolute", top: 54, left: 0, zIndex: 60 }}>
          <DatePickerCalendar
            month={pickerMonth}
            onChangeMonth={changePickerMonth}
            selectedDay={selectedDay}
            onSelectDay={handlePickDay}
            onToday={goToday}
          />
        </div>
      )}

      <TimelineView
        date={selectedDay}
        tasks={tasks}
        goals={goals}
        onToggleComplete={toggleComplete}
        onEditTask={openEditTaskModal}
        onAddTask={openNewTaskModal}
        onPrevDay={() => changeDay(-1)}
        onNextDay={() => changeDay(1)}
        onDateClick={openPicker}
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