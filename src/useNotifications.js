import { useCallback, useEffect, useState } from "react";
import {
  collectDueNotifications,
  deliverNotification,
  notificationPermission,
  readNotificationSettings,
  NOTIFICATION_SETTINGS_KEY,
} from "./notifications";
import { getTodayKey } from "./schedule";

export default function useNotifications(data, calendarEvents) {
  const [settings, setSettings] = useState(readNotificationSettings);
  const [permission, setPermission] = useState(notificationPermission);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const update = useCallback((changes) => {
    setSettings((previous) => {
      const next = { ...previous, ...changes };
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  useEffect(() => {
    const sync = () => {
      setPermission(notificationPermission());
      setSettings(readNotificationSettings());
    };
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    let status;
    let stopped = false;
    navigator.permissions
      ?.query({ name: "notifications" })
      .then((result) => {
        if (stopped) return;
        status = result;
        status.addEventListener("change", sync);
      })
      .catch(() => {});
    return () => {
      stopped = true;
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      status?.removeEventListener("change", sync);
    };
  }, []);
  async function enable() {
    setError("");
    if (notificationPermission() === "unsupported") {
      setError(
        "This browser does not support these notifications. Try a current desktop browser or an installed web app.",
      );
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") update({ enabled: true });
      else if (result === "denied")
        setError(
          "Notifications are blocked. Allow them in this site’s browser settings, then try again.",
        );
      else
        setError(
          "Permission was not granted. You can try again when you’re ready.",
        );
    } catch {
      setError("Could not request notification permission in this browser.");
    }
  }
  async function test() {
    if (permission !== "granted") {
      setError("Enable notifications first.");
      return;
    }
    setTesting(true);
    setError("");
    try {
      await deliverNotification({
        id: `test:${crypto.randomUUID()}`,
        title: "Personal Assistant",
        body: "Notifications are working. You’re all set.",
        url: "/?view=calendar",
      });
    } catch {
      setError(
        "Could not display a notification. Check the browser and device notification settings.",
      );
    } finally {
      setTesting(false);
    }
  }
  const send = useCallback(async (item) => {
    if (!readNotificationSettings().enabled) return;
    try {
      await deliverNotification(item);
    } catch {
      /* The connection page reports delivery problems with a test. */
    }
  }, []);
  useEffect(() => {
    if (!settings.enabled || permission !== "granted" || !data) return;
    let stopped = false;
    const poll = async () => {
      if (stopped) return;
      try {
        for (const item of collectDueNotifications(
          data,
          calendarEvents,
          settings,
        )) {
          if (stopped) return;
          await deliverNotification(item);
        }
        const water = data.waterSettings;
        if (settings.water && water && !water.paused) {
          const dateKey = getTodayKey();
          const waterKey = `assistant-water-notification:${dateKey}`;
          const last = Number(localStorage.getItem(waterKey));
          const hour = Number(
            new Date().toLocaleTimeString("en-GB", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              hour12: false,
            }),
          );
          if (!last) localStorage.setItem(waterKey, String(Date.now()));
          else if (
            hour >= 8 &&
            hour < 22 &&
            Date.now() - last >= water.intervalMinutes * 60000
          ) {
            await deliverNotification({
              id: `water:${dateKey}:${Math.floor(Date.now() / (water.intervalMinutes * 60000))}`,
              title: "Water break",
              body: "Time for a drink of water.",
              url: "/?view=planner",
            });
            localStorage.setItem(waterKey, String(Date.now()));
          }
        }
      } catch {
        if (!stopped)
          setError(
            "A reminder could not be displayed. Check notification permissions or try a test notification.",
          );
      }
    };
    void poll();
    const interval = setInterval(poll, 15000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [data, calendarEvents, settings, permission]);
  return { settings, permission, error, testing, update, enable, test, send };
}
