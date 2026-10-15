import { getTodayKey } from "./schedule.js";

export const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.events.owned";
export const GOOGLE_CLIENT_ID_KEY = "assistant-google-client-id";
export const CALENDAR_ZONE = "Asia/Kolkata";
const API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
export function isGoogleClientId(value) {
  return /^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(value);
}
let identityPromise;
export function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2)
    return Promise.resolve(window.google.accounts.oauth2);
  if (!identityPromise)
    identityPromise = new Promise((resolve, reject) => {
      let script = document.querySelector("script[data-assistant-google]");
      const timeout = setTimeout(() => {
        identityPromise = null;
        reject(
          new Error(
            "Google sign-in could not load. Check your connection and try again.",
          ),
        );
      }, 15000);
      const success = () => {
        clearTimeout(timeout);
        if (window.google?.accounts?.oauth2)
          resolve(window.google.accounts.oauth2);
        else {
          identityPromise = null;
          reject(new Error("Google sign-in is unavailable."));
        }
      };
      const failure = () => {
        clearTimeout(timeout);
        script?.remove();
        identityPromise = null;
        reject(
          new Error(
            "Google sign-in could not load. Check your connection and try again.",
          ),
        );
      };
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.dataset.assistantGoogle = "true";
        script.addEventListener("load", success, { once: true });
        script.addEventListener("error", failure, { once: true });
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", success, { once: true });
        script.addEventListener("error", failure, { once: true });
      }
    });
  return identityPromise;
}
export function calendarWindow(now = new Date()) {
  const start = new Date(`${getTodayKey(now)}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 14 * 86400000);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}
export async function googleCalendarRequest(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    let reason;
    try {
      const payload = await response.json();
      reason = payload.error?.errors?.[0]?.reason;
    } catch {
      /* Use a non-sensitive error message. */
    }
    const error = new Error(
      response.status === 401
        ? "Your Google session expired. Reconnect Calendar to continue."
        : response.status === 403 && reason === "accessNotConfigured"
          ? "Enable Google Calendar API in your Google Cloud project, then reconnect."
          : response.status === 403
            ? "Google did not allow this action. Check Calendar access and whether you can edit this event."
            : response.status === 412
              ? "This event changed in Google Calendar. Refresh it before editing again."
              : "Google Calendar could not complete the request. Please try again.",
    );
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}
export async function listCalendarEvents(token, now = new Date()) {
  const result = [];
  let pageToken;
  do {
    const params = new URLSearchParams({
      ...calendarWindow(now),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
      timeZone: CALENDAR_ZONE,
      fields:
        "items(id,summary,description,location,start,end,htmlLink,status,recurringEventId,etag,reminders),nextPageToken",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await googleCalendarRequest(token, `${API}?${params}`);
    result.push(
      ...(response.items || []).filter((event) => event.status !== "cancelled"),
    );
    pageToken = response.nextPageToken;
  } while (pageToken && result.length < 1000);
  return { events: result.slice(0, 1000), truncated: Boolean(pageToken) };
}
export function localDateTimeParts(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CALENDAR_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type) => parts.find((item) => item.type === type).value;
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}
function shiftDate(value, delta) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}
function validDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value || "") &&
    Number.isFinite(new Date(`${value}T12:00:00Z`).getTime()) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  );
}
export function blankCalendarDraft() {
  const current = new Date(Math.ceil(Date.now() / 1800000) * 1800000);
  const start = localDateTimeParts(current),
    end = localDateTimeParts(new Date(current.getTime() + 3600000));
  return {
    title: "",
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    allDay: false,
    description: "",
    location: "",
    reminder: "default",
  };
}
export function eventToDraft(event) {
  const allDay = Boolean(event.start.date);
  const start = allDay
    ? { date: event.start.date, time: "09:00" }
    : localDateTimeParts(event.start.dateTime);
  const end = allDay
    ? { date: shiftDate(event.end.date, -1), time: "10:00" }
    : localDateTimeParts(event.end.dateTime);
  const reminder =
    event.reminders?.useDefault !== false
      ? "default"
      : (event.reminders.overrides?.find((item) => item.method === "popup")
          ?.minutes ?? "none");
  return {
    title: event.summary || "",
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    allDay,
    description: event.description || "",
    location: event.location || "",
    reminder: String(reminder),
  };
}
export function calendarEventBody(draft) {
  const summary = String(draft.title || "").trim();
  if (!summary || summary.length > 500)
    throw new Error("Add an event name of up to 500 characters.");
  if (!validDate(draft.startDate) || !validDate(draft.endDate))
    throw new Error("Choose valid start and end dates.");
  let start, end;
  if (draft.allDay) {
    if (draft.endDate < draft.startDate)
      throw new Error("The end date must be on or after the start date.");
    start = { date: draft.startDate };
    end = { date: shiftDate(draft.endDate, 1) };
  } else {
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.startTime || "") ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.endTime || "")
    )
      throw new Error("Choose valid start and end times.");
    const starts = new Date(`${draft.startDate}T${draft.startTime}:00+05:30`),
      ends = new Date(`${draft.endDate}T${draft.endTime}:00+05:30`);
    if (ends <= starts) throw new Error("The event must end after it starts.");
    start = { dateTime: starts.toISOString(), timeZone: CALENDAR_ZONE };
    end = { dateTime: ends.toISOString(), timeZone: CALENDAR_ZONE };
  }
  if (
    !["default", "none", "0", "5", "10", "15", "30", "60"].includes(
      String(draft.reminder),
    )
  )
    throw new Error("Choose a valid reminder time.");
  const reminders =
    draft.reminder === "default"
      ? { useDefault: true }
      : {
          useDefault: false,
          overrides:
            draft.reminder === "none"
              ? []
              : [{ method: "popup", minutes: Number(draft.reminder) }],
        };
  return {
    summary,
    start,
    end,
    description: String(draft.description || "").slice(0, 8000),
    location: String(draft.location || "").slice(0, 1000),
    reminders,
  };
}
export async function saveCalendarEvent(token, body, event = null) {
  const url = event ? `${API}/${encodeURIComponent(event.id)}` : API;
  return googleCalendarRequest(token, url, {
    method: event ? "PATCH" : "POST",
    body: JSON.stringify(body),
    headers: event?.etag ? { "If-Match": event.etag } : {},
  });
}
export function safeCalendarLink(link) {
  try {
    const url = new URL(link);
    return url.protocol === "https:" &&
      ["calendar.google.com", "www.google.com"].includes(url.hostname)
      ? url.href
      : "https://calendar.google.com/";
  } catch {
    return "https://calendar.google.com/";
  }
}
