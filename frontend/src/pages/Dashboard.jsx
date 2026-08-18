import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const { user, logout } = useAuth();

  const fetchTasks = async () => {
    const { data } = await api.get("/tasks");
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/tasks", { title, date: new Date() });
    setTitle("");
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await api.put(`/tasks/${task._id}`, { completed: !task.completed });
    fetchTasks();
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Hi, {user?.name}</h2>
        <button onClick={logout}>Log out</button>
      </div>

      <form onSubmit={addTask} style={{ margin: "20px 0" }}>
        <input
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {tasks.map((t) => (
          <li key={t._id}>
            <label>
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleComplete(t)}
              />
              {t.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
