export const DAYS = [
  { value: 1, short: "Mon", name: "Monday" },
  { value: 2, short: "Tue", name: "Tuesday" },
  { value: 3, short: "Wed", name: "Wednesday" },
  { value: 4, short: "Thu", name: "Thursday" },
  { value: 5, short: "Fri", name: "Friday" },
  { value: 6, short: "Sat", name: "Saturday" },
  { value: 0, short: "Sun", name: "Sunday" },
];
export const COMMON_ACTIVITIES = [
  { title: "Morning walk", time: "07:00", duration: 30, icon: "sun" },
  { title: "Breakfast", time: "08:00", duration: 30, icon: "sun" },
  { title: "Workout", time: "18:00", duration: 45, icon: "heart" },
  { title: "Study", time: "10:00", duration: 60, icon: "note" },
  { title: "Work", time: "09:00", duration: 120, icon: "grid" },
  { title: "Lunch", time: "13:00", duration: 30, icon: "clock" },
  { title: "Reading", time: "21:00", duration: 20, icon: "note" },
  { title: "Skincare", time: "22:00", duration: 15, icon: "heart" },
];
export function getTodayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
export function getWeekDays(date = new Date()) {
  const key = getTodayKey(date);
  const today = new Date(`${key}T12:00:00Z`);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  return DAYS.map((day, index) => {
    const itemDate = new Date(today);
    itemDate.setUTCDate(today.getUTCDate() - mondayOffset + index);
    return {
      ...day,
      dateKey: itemDate.toISOString().slice(0, 10),
      dateNumber: itemDate.getUTCDate(),
      isToday: itemDate.toISOString().slice(0, 10) === key,
    };
  });
}
export function normalizeActivity(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 200)
    throw new Error("Add an activity name of up to 200 characters.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time || ""))
    throw new Error("Choose a valid start time.");
  if (
    !Array.isArray(body.days) ||
    !body.days.length ||
    body.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  )
    throw new Error("Choose at least one weekday.");
  const duration =
    body.duration === "" || body.duration == null
      ? null
      : Number(body.duration);
  if (
    duration !== null &&
    (!Number.isInteger(duration) || duration < 5 || duration > 1440)
  )
    throw new Error("Duration must be between 5 and 1,440 minutes.");
  return {
    title,
    time: body.time,
    days: DAYS.map((d) => d.value).filter((day) => body.days.includes(day)),
    duration,
    detail:
      typeof body.detail === "string" ? body.detail.trim().slice(0, 1000) : "",
  };
}
export function activitiesForDay(activities, day) {
  return activities
    .filter((activity) => activity.days.includes(day))
    .sort(
      (a, b) => a.time.localeCompare(b.time) || a.title.localeCompare(b.title),
    );
}
export function repeatLabel(days) {
  if (days.length === 7) return "Every day";
  if (days.length === 5 && [1, 2, 3, 4, 5].every((day) => days.includes(day)))
    return "Weekdays";
  if (days.length === 2 && [0, 6].every((day) => days.includes(day)))
    return "Weekends";
  return DAYS.filter((day) => days.includes(day.value))
    .map((day) => day.short)
    .join(", ");
}
export function formatPlanTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}
export function activityEndTime(activity) {
  if (!activity.duration) return "";
  const [hour, minute] = activity.time.split(":").map(Number);
  const end = hour * 60 + minute + activity.duration;
  return `${formatPlanTime(`${String(Math.floor(end / 60) % 24).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`)}${end >= 1440 ? " (+1 day)" : ""}`;
}
