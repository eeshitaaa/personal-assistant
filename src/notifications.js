import { activitiesForDay, getTodayKey } from "./schedule.js";

export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: false,
  reminders: true,
  activities: true,
  checkins: true,
  calendar: true,
  water: true,
  calendarLeadMinutes: 5,
};
export const NOTIFICATION_SETTINGS_KEY = "assistant-notification-settings-v1";
const DELIVERY_KEY = "assistant-notification-deliveries-v1";
export function readNotificationSettings() {
  try {
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || "{}"),
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_SETTINGS };
  }
}
function dueWithinWindow(due, now) {
  return Number.isFinite(due) && now >= due && now - due <= 15 * 60 * 1000;
}
export function collectDueNotifications(
  data,
  events = [],
  settings = DEFAULT_NOTIFICATION_SETTINGS,
  now = Date.now(),
) {
  if (!data) return [];
  const result = [];
  const dateKey = getTodayKey(new Date(now));
  const weekday = new Date(`${dateKey}T12:00:00Z`).getUTCDay();
  const scheduledAt = (time) =>
    new Date(`${dateKey}T${time}:00+05:30`).getTime();
  if (settings.reminders)
    for (const reminder of data.reminders || []) {
      if (
        reminder.status === "completed" ||
        !dueWithinWindow(new Date(reminder.remind_at).getTime(), now)
      )
        continue;
      result.push({
        id: `reminder:${reminder.id}:${reminder.remind_at}`,
        title: "Your reminder",
        body: reminder.text,
        url: "/?view=planner",
      });
    }
  if (settings.activities)
    for (const activity of activitiesForDay(data.activities || [], weekday)) {
      if (
        (activity.completedDates || []).includes(dateKey) ||
        !dueWithinWindow(scheduledAt(activity.time), now)
      )
        continue;
      result.push({
        id: `activity:${activity.id}:${dateKey}:${activity.time}`,
        title: "On your plan",
        body: activity.title,
        url: "/?view=planner",
      });
    }
  if (settings.checkins)
    for (const task of data.checkins || []) {
      if (
        task.status !== "active" ||
        task.isDoneToday ||
        !dueWithinWindow(scheduledAt(task.time_of_day), now)
      )
        continue;
      result.push({
        id: `checkin:${task.id}:${dateKey}:${task.time_of_day}`,
        title: "Daily check-in",
        body: task.text,
        url: "/?view=planner",
      });
    }
  if (settings.calendar)
    for (const event of events) {
      if (!event.start?.dateTime || event.status === "cancelled") continue;
      const due =
        new Date(event.start.dateTime).getTime() -
        Number(settings.calendarLeadMinutes) * 60000;
      if (!dueWithinWindow(due, now)) continue;
      result.push({
        id: `calendar:${event.id}:${event.start.dateTime}:${settings.calendarLeadMinutes}`,
        title: settings.calendarLeadMinutes
          ? `Calendar · in ${settings.calendarLeadMinutes} min`
          : "Calendar · starting now",
        body: event.summary || "Untitled event",
        url: "/?view=calendar",
      });
    }
  return result;
}
export function notificationPermission() {
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !window.isSecureContext
  )
    return "unsupported";
  return Notification.permission;
}
let registrationPromise;
export function getNotificationRegistration() {
  if (!registrationPromise)
    registrationPromise = navigator.serviceWorker
      .register("/notifications-sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .catch((error) => {
        registrationPromise = null;
        throw error;
      });
  return registrationPromise;
}
export async function deliverNotification(item) {
  if (notificationPermission() !== "granted") return false;
  const run = async () => {
    let delivered;
    try {
      delivered = JSON.parse(localStorage.getItem(DELIVERY_KEY) || "{}");
    } catch {
      delivered = {};
    }
    const now = Date.now();
    if (delivered[item.id]) return false;
    const registration = await getNotificationRegistration();
    await registration.showNotification(item.title, {
      body: item.body,
      icon: "/assistant.svg",
      badge: "/assistant.svg",
      tag: item.id,
      data: { url: item.url || "/?view=planner" },
    });
    delivered[item.id] = now;
    for (const key of Object.keys(delivered))
      if (now - delivered[key] > 7 * 86400000) delete delivered[key];
    localStorage.setItem(DELIVERY_KEY, JSON.stringify(delivered));
    return true;
  };
  if (navigator.locks)
    return navigator.locks.request(
      "assistant-notifications",
      { ifAvailable: true },
      (lock) => (lock ? run() : false),
    );
  return run();
}
