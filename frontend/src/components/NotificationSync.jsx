import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useAuth } from "../context/AuthContext.jsx";
import { resyncReminders } from "../utils/notifications.js";

export default function NotificationSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    resyncReminders(user.remindersEnabled);

    let listenerHandle;
    CapacitorApp.addListener("resume", () => {
      resyncReminders(user.remindersEnabled);
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      listenerHandle?.remove();
    };
  }, [user?.remindersEnabled]);

  return null;
}