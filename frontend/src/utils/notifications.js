import { LocalNotifications } from "@capacitor/local-notifications";
import api from "../api/axios.js";

const REMINDER_LEAD_MINUTES = 10;
const WINDOW_DAYS = 7; // rolling window — keeps us well under iOS's ~64 pending-notification cap

const isNative = () =>
  typeof window !== "undefined" && Boolean(window.Capacitor?.isNativePlatform?.());

// Local notification IDs must be plain integers, but our tasks use Mongo
// ObjectId strings — hash the id down to a stable positive int so each
// task's reminder is always addressable by the same id every time.
const idForTask = (taskId) => {
  let hash = 0;
  const str = String(taskId);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2147483647;
};

const reminderTimeFor = (task) => {
  const [h, m] = task.startTime.split(":").map(Number);
  const dt = new Date(task.date);
  dt.setHours(h, m, 0, 0);
  dt.setMinutes(dt.getMinutes() - REMINDER_LEAD_MINUTES);
  return dt;
};

export const requestReminderPermission = async () => {
  if (!isNative()) return false;
  const result = await LocalNotifications.requestPermissions();
  return result.display === "granted";
};

export const cancelAllReminders = async () => {
  if (!isNative()) return;
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  }
};

// Full teardown-and-rebuild of the next WINDOW_DAYS of reminders. Simpler and
// far less bug-prone than trying to track incremental add/cancel diffs across
// every place a task can change (create, edit, delete, complete, series edits).
// Call this after any task mutation, on app resume, and when the setting is toggled.
export const resyncReminders = async (remindersEnabled) => {
  if (!isNative()) return;
  if (!remindersEnabled) {
    await cancelAllReminders();
    return;
  }

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") return; // don't silently re-prompt from a background resync

  await cancelAllReminders();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + WINDOW_DAYS);
  end.setHours(23, 59, 59, 999);

  const { data: tasks } = await api.get("/tasks", {
    params: { start: start.toISOString(), end: end.toISOString() },
  });

  const now = new Date();
  const toSchedule = tasks
    .filter((t) => !t.completed && t.startTime)
    .map((t) => ({ task: t, at: reminderTimeFor(t) }))
    .filter(({ at }) => at > now);

  if (toSchedule.length === 0) return;

  await LocalNotifications.schedule({
    notifications: toSchedule.map(({ task, at }) => ({
      id: idForTask(task._id),
      title: task.title,
      body: `Starts at ${task.startTime}`,
      schedule: { at },
    })),
  });
};