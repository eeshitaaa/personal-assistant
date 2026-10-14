import { useEffect, useRef, useState } from "react";
import {
  loadStaticState,
  staticDelete,
  staticPatch,
  staticPost,
} from "./staticAssistant";
import "./App.css";

const pages = [
  { id: "today", name: "My day", icon: "sun" },
  { id: "planner", name: "Planner", icon: "calendar" },
  { id: "notes", name: "Notes & thoughts", icon: "note" },
  { id: "projects", name: "Projects", icon: "grid" },
  { id: "assistant", name: "Ask assistant", icon: "spark" },
  { id: "affirmations", name: "Affirmations", icon: "heart" },
];
const affirmations = [
  "I can do meaningful things at my own pace.",
  "I am allowed to begin again, as often as I need.",
  "Small steps still take me somewhere good.",
  "My worth is bigger than my to-do list.",
  "I can be a work in progress and still be proud.",
  "Today, I choose curiosity over perfection.",
  "I make room for good things, including rest.",
  "I trust myself to figure out the next step.",
];
const paths = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="3" />
      <path d="M8 3v4m8-4v4M4 11h16m-11 4h.01M12 15h.01M15 15h.01" />
    </>
  ),
  note: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8m-8 4h5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5zM20 2v4m-2-2h4" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3" />
    </>
  ),
  play: <path d="m9 5 11 7-11 7z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  drop: <path d="M12 2c-2 4-7 8-7 13a7 7 0 0 0 14 0c0-5-5-9-7-13Z" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  trash: (
    <>
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
    </>
  ),
};
function Icon({ name, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.spark}
    </svg>
  );
}
function readPreference(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function Blossom({ happy = false }) {
  return (
    <div className={`blossom ${happy ? "happy" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 180 180">
        <defs>
          <radialGradient id="petal">
            <stop stopColor="#eccab0" />
            <stop offset="1" stopColor="#b96571" />
          </radialGradient>
        </defs>
        <g className="petals">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx="90"
              cy="49"
              rx="24"
              ry="43"
              fill="url(#petal)"
              transform={`rotate(${i * 45} 90 90)`}
            />
          ))}
        </g>
        <circle cx="90" cy="90" r="36" fill="#f2d7bf" />
        <path
          d="M77 84v3m26-3v3"
          stroke="#6e2633"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M78 99q12 13 24 0"
          stroke="#6e2633"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="floating-spark one">✦</span>
      <span className="floating-spark two">✧</span>
    </div>
  );
}
function Empty({ icon = "note", title, detail }) {
  return (
    <div className="empty">
      <Icon name={icon} />
      <p>{title}</p>
      <span>{detail}</span>
    </div>
  );
}
function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("today");
  const [mobileNav, setMobileNav] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [quick, setQuick] = useState(null);
  const [query, setQuery] = useState("");
  const [command, setCommand] = useState(false);
  const [form, setForm] = useState({
    text: "",
    detail: "",
    date: "",
    time: "09:00",
  });
  const [noteDraft, setNoteDraft] = useState("");
  const [period, setPeriod] = useState("daily");
  const [plan, setPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [planDirty, setPlanDirty] = useState(false);
  const [affirmationIndex, setAffirmationIndex] = useState(() =>
    readPreference("assistant-affirmation-index", 0),
  );
  const [favorites, setFavorites] = useState(() =>
    readPreference("assistant-affirmation-favorites", []),
  );
  const [customAffirmation, setCustomAffirmation] = useState("");
  const [mood, setMood] = useState(() =>
    readPreference(`assistant-mood-${new Date().toDateString()}`, ""),
  );
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const focusEnd = useRef(0);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [chat, setChat] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [useContext, setUseContext] = useState(false);
  const [aiSetup, setAiSetup] = useState(false);
  const [notesFilter, setNotesFilter] = useState("");
  const waterNudgeAt = useRef(Date.now());
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  async function refresh() {
    const next = await loadStaticState();
    setData(next);
    return next;
  }
  useEffect(() => {
    loadStaticState()
      .then((next) => {
        setData(next);
        setPlan(next.routines.daily.content);
      })
      .catch(() =>
        setError(
          "Your workspace could not load. Check that browser storage is available, then refresh.",
        ),
      );
    fetch("/api/chat")
      .then((r) => r.json())
      .then((r) => setAiConfigured(Boolean(r.configured)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3400);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommand((v) => !v);
      }
      if (event.key === "Escape") {
        setCommand(false);
        setQuick(null);
        setAiSetup(false);
        setMobileNav(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!focusRunning) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((focusEnd.current - Date.now()) / 1000),
      );
      setFocusSeconds(remaining);
      if (!remaining) {
        setFocusRunning(false);
        setToast("Focus session complete. Take a little break. ✦");
      }
    }, 250);
    return () => clearInterval(interval);
  }, [focusRunning]);
  useEffect(() => {
    if (!quick && !command && !aiSetup) return;
    previousFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    (
      dialog?.querySelector("input, textarea") ||
      dialog?.querySelector("button")
    )?.focus();
    function trap(event) {
      if (event.key !== "Tab" || !dialog) return;
      const elements = [
        ...dialog.querySelectorAll(
          "button:not(:disabled), input, textarea, select, a[href]",
        ),
      ];
      const first = elements[0],
        last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previousFocus.current?.focus();
    };
  }, [quick, command, aiSetup]);

  const waterPaused = data?.waterSettings.paused;
  const waterInterval = data?.waterSettings.intervalMinutes;
  useEffect(() => {
    if (waterPaused || !waterInterval) return;
    const timer = setInterval(() => {
      const hour = Number(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          hour12: false,
        }),
      );
      if (
        hour >= 8 &&
        hour < 22 &&
        Date.now() - waterNudgeAt.current >= waterInterval * 60000
      ) {
        setToast("A little water break? A sip, a stretch, a reset.");
        waterNudgeAt.current = Date.now();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [waterPaused, waterInterval]);

  async function mutate(action, notice) {
    try {
      await action();
      await refresh();
      setToast(notice);
    } catch {
      setToast("Could not save. Please try again.");
    }
  }
  function navigate(id) {
    setView(id);
    setMobileNav(false);
    setCommand(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openQuick(kind, projectStatus = "active") {
    setForm({ text: "", detail: "", date: "", time: "09:00", projectStatus });
    setQuick(kind);
    setCommand(false);
  }
  async function submitQuick(event) {
    event.preventDefault();
    const text = form.text.trim();
    if (!text) return;
    const kind = quick;
    try {
      if (
        kind === "reminder" &&
        (!form.date || !Number.isFinite(new Date(form.date).getTime()))
      )
        return;
      const body =
        kind === "task"
          ? { text, timeOfDay: form.time }
          : kind === "project"
            ? {
                name: text,
                detail: form.detail,
                status: form.projectStatus || "active",
              }
            : kind === "reminder"
              ? { text, remindAt: form.date }
              : { text };
      await staticPost(
        {
          task: "/checkins",
          project: "/projects",
          reminder: "/reminders",
          note: "/notes",
        }[kind],
        body,
      );
      await refresh();
      setQuick(null);
      setToast(
        `${kind === "task" ? "Task" : kind[0].toUpperCase() + kind.slice(1)} saved. One less thing to hold in your head.`,
      );
    } catch {
      setToast("Could not save. Please try again.");
    }
  }
  async function addNote(event) {
    event.preventDefault();
    if (!noteDraft.trim()) return;
    try {
      await staticPost("/notes", { text: noteDraft.trim() });
      await refresh();
      setNoteDraft("");
      setToast("Thought captured. ✦");
    } catch {
      setToast("Could not save your note.");
    }
  }
  async function savePlan() {
    setSaving(true);
    try {
      await staticPost(`/routines/${period}`, { content: plan });
      await refresh();
      setPlanDirty(false);
      setToast("Planner saved.");
    } catch {
      setToast("Could not save your plan.");
    } finally {
      setSaving(false);
    }
  }
  async function switchPeriod(next) {
    if (next === period) return;
    if (planDirty) {
      try {
        await staticPost(`/routines/${period}`, { content: plan });
        await refresh();
      } catch {
        setToast("Save your current plan before switching.");
        return;
      }
    }
    const nextData = await loadStaticState();
    setData(nextData);
    setPeriod(next);
    setPlan(nextData.routines[next].content);
    setPlanDirty(false);
  }
  function anotherAffirmation() {
    const next = (affirmationIndex + 1) % affirmations.length;
    setAffirmationIndex(next);
    localStorage.setItem("assistant-affirmation-index", JSON.stringify(next));
  }
  const affirmation = affirmations[affirmationIndex % affirmations.length];
  function toggleFavorite(text) {
    const next = favorites.includes(text)
      ? favorites.filter((v) => v !== text)
      : [...favorites, text];
    setFavorites(next);
    localStorage.setItem(
      "assistant-affirmation-favorites",
      JSON.stringify(next),
    );
    setToast(
      next.includes(text)
        ? "A little kindness, saved."
        : "Removed from saved affirmations.",
    );
  }
  function chooseMood(value) {
    setMood(value);
    localStorage.setItem(
      `assistant-mood-${new Date().toDateString()}`,
      JSON.stringify(value),
    );
  }
  function toggleFocus() {
    if (focusRunning) setFocusRunning(false);
    else {
      const duration = focusSeconds || 1500;
      setFocusSeconds(duration);
      focusEnd.current = Date.now() + duration * 1000;
      setFocusRunning(true);
    }
  }
  function promptAssistant(prompt) {
    setAiPrompt(prompt);
    navigate("assistant");
  }
  async function sendPrompt(event) {
    event.preventDefault();
    if (!aiPrompt.trim() || aiBusy) return;
    if (!aiConfigured || !accessToken) {
      setAiSetup(true);
      return;
    }
    const text = aiPrompt.trim(),
      nextChat = [...chat, { role: "user", content: text }];
    setChat(nextChat);
    setAiPrompt("");
    setAiBusy(true);
    setAiError("");
    try {
      const context = useContext
        ? {
            dailyPlan: data.routines.daily.content,
            tasks: data.checkins.map((t) => ({
              text: t.text,
              done: t.isDoneToday,
            })),
            notes: data.notes.map((n) => n.text),
            projects: data.projects.map((p) => ({
              name: p.name,
              status: p.status,
            })),
          }
        : null;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ messages: nextChat.slice(-10), context }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "The assistant could not respond. Try again.",
        );
      setChat([...nextChat, { role: "assistant", content: result.text }]);
    } catch (err) {
      setAiError(err.message);
      setAiPrompt(text);
      setChat(chat);
    } finally {
      setAiBusy(false);
    }
  }

  if (!data)
    return (
      <main className="loading-screen">
        <span className="brand-mark">a.</span>
        <p>{error || "A little space for your day…"}</p>
      </main>
    );
  const currentPage = pages.find((p) => p.id === view);
  const tasks = data.checkins.filter((t) => t.status === "active");
  const completed = tasks.filter((t) => t.isDoneToday).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const activeProjects = data.projects.filter((p) => p.status !== "completed");
  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const filteredNotes = data.notes.filter((n) =>
    n.text.toLowerCase().includes(notesFilter.toLowerCase()),
  );
  const taskList = (
    <div className="task-list">
      {tasks.length ? (
        tasks.map((task) => (
          <div
            className={`task-row ${task.isDoneToday ? "is-done" : ""}`}
            key={task.id}
          >
            <button
              className="task-check"
              aria-label={`${task.isDoneToday ? "Reopen" : "Complete"} ${task.text}`}
              aria-pressed={task.isDoneToday}
              onClick={() =>
                mutate(
                  () =>
                    staticPatch(`/checkins/${task.id}`, {
                      markDone: !task.isDoneToday,
                    }),
                  task.isDoneToday
                    ? "Task reopened."
                    : "A small win. It counts. ✦",
                )
              }
            >
              {task.isDoneToday && <Icon name="check" />}
            </button>
            <span className="task-text">{task.text}</span>
            <span className="task-time">{task.time_of_day}</span>
            <button
              className="icon-button subtle"
              aria-label={`Delete task ${task.text}`}
              onClick={() =>
                mutate(
                  () => staticDelete(`/checkins/${task.id}`),
                  "Task removed.",
                )
              }
            >
              <Icon name="close" />
            </button>
          </div>
        ))
      ) : (
        <Empty
          icon="check"
          title="A fresh page. A little possibility."
          detail="Add one thing you want to make room for today."
        />
      )}
    </div>
  );
  const affirmationCard = (
    <section className="card affirmation-card">
      <div className="card-top">
        <span className="eyebrow">
          <Icon name="spark" /> A little reminder
        </span>
        <span className="small-pill">FOR YOU</span>
      </div>
      <div className="affirmation-content">
        <div>
          <p className="affirmation-quote" key={affirmation}>
            {affirmation}
          </p>
          <span className="affirmation-caption">
            Read it slowly. Let it land.
          </span>
        </div>
        <Blossom happy={completed > 0} />
      </div>
      <div className="affirmation-footer">
        <button className="text-button" onClick={anotherAffirmation}>
          <Icon name="refresh" /> Another thought
        </button>
        <button
          className={`icon-button favorite ${favorites.includes(affirmation) ? "selected" : ""}`}
          aria-label="Save affirmation"
          aria-pressed={favorites.includes(affirmation)}
          onClick={() => toggleFavorite(affirmation)}
        >
          <Icon name="heart" />
        </button>
      </div>
    </section>
  );
  const notesGrid = (
    <div className="notes-grid">
      {filteredNotes.map((note, index) => (
        <article className={`note-tile shade-${index % 3}`} key={note.id}>
          <div className="note-top">
            <Icon name="note" />
            <button
              className="icon-button"
              aria-label={`Remove note ${note.text.slice(0, 30)}`}
              onClick={() =>
                mutate(() => staticDelete(`/notes/${note.id}`), "Note removed.")
              }
            >
              <Icon name="trash" />
            </button>
          </div>
          <textarea
            aria-label="Edit note"
            defaultValue={note.text}
            onBlur={(e) => {
              if (e.target.value !== note.text)
                mutate(
                  () =>
                    staticPatch(`/notes/${note.id}`, { text: e.target.value }),
                  "Note updated.",
                );
            }}
          />
          <span className="note-date">
            {new Date(note.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </article>
      ))}
    </div>
  );

  return (
    <div className="app-layout">
      <aside
        className={`sidebar ${mobileNav ? "mobile-open" : ""}`}
        inert={isMobile && !mobileNav ? true : undefined}
      >
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("today");
          }}
        >
          <span className="brand-mark">a.</span>
          <span>
            personal assistant<small>YOUR LITTLE UNIVERSE</small>
          </span>
        </a>
        <button className="sidebar-search" onClick={() => setCommand(true)}>
          <Icon name="search" />
          <span>Find anything</span>
          <kbd>⌘ K</kbd>
        </button>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Workspace">
          {pages.map((page) => (
            <button
              key={page.id}
              className={`nav-item ${view === page.id ? "active" : ""}`}
              aria-current={view === page.id ? "page" : undefined}
              onClick={() => navigate(page.id)}
            >
              <Icon name={page.icon} />
              <span>{page.name}</span>
              {page.id === "assistant" && <span className="nav-badge">AI</span>}
              {page.id === "notes" && data.notes.length > 0 && (
                <span className="nav-count">{data.notes.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-nudge">
            <span>✦</span>
            <p>
              Less in your head.
              <br />
              More room for you.
            </p>
          </div>
          <button className="user-switch" onClick={() => setAiSetup(true)}>
            <span className="avatar">E</span>
            <span>
              My workspace<small>Saved on this device</small>
            </span>
            <span className="user-dots">···</span>
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileNav((v) => !v)}
            >
              <Icon name="menu" />
            </button>
            <span>My workspace</span>
            <span className="breadcrumb-slash">/</span>
            <Icon name={currentPage.icon} />
            <strong>{currentPage.name}</strong>
          </div>
          <div className="topbar-actions">
            <span className="saved-status">
              <i />{" "}
              {planDirty || noteDraft.trim()
                ? "Draft in progress"
                : "Saved on this device"}
            </span>
            <button
              className="button primary small"
              onClick={() =>
                openQuick(
                  view === "notes"
                    ? "note"
                    : view === "projects"
                      ? "project"
                      : "task",
                )
              }
            >
              <Icon name="plus" /> Add new
            </button>
          </div>
        </header>
        <main className="page" key={view}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {view === "today" ? todayDate : "MY WORKSPACE"}
              </p>
              <h1>
                {view === "today" ? (
                  <>
                    {greeting}
                    <span className="title-dot">.</span>
                    <span className="heading-star">✳</span>
                  </>
                ) : (
                  <>
                    {currentPage.name}
                    <span className="title-dot">.</span>
                  </>
                )}
              </h1>
              <p className="page-subtitle">
                {
                  {
                    today:
                      "A little structure. A little kindness. A day that feels like you.",
                    planner:
                      "Make a little room for what matters. Edit your page, your way.",
                    notes:
                      "Messy thoughts welcome. Catch them here, make sense of them later.",
                    projects:
                      "Big ideas, broken into things you can actually do.",
                    assistant:
                      "A space to think out loud, find clarity, and get a little help.",
                    affirmations:
                      "A softer voice in your day. Keep the words that feel like yours.",
                  }[view]
                }
              </p>
            </div>
            {view === "today" && (
              <div className="mood-picker">
                <span>How’s your headspace?</span>
                <div>
                  {[
                    { icon: "☀", name: "Bright" },
                    { icon: "☁", name: "Slow" },
                    { icon: "☾", name: "Quiet" },
                  ].map((item) => (
                    <button
                      key={item.name}
                      title={item.name}
                      aria-label={`Mood: ${item.name}`}
                      aria-pressed={mood === item.name}
                      className={mood === item.name ? "chosen" : ""}
                      onClick={() => chooseMood(item.name)}
                    >
                      {item.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {view === "today" && (
            <>
              <div className="intro-grid">
                {affirmationCard}
                <section className="card assistant-launcher">
                  <div className="card-top">
                    <span className="eyebrow">
                      <Icon name="spark" /> Your second brain
                    </span>
                    <span className="ai-pill">AI</span>
                  </div>
                  <h2>
                    A little help.
                    <br />A lot more headspace.
                  </h2>
                  <p>Turn a tangled thought into a next step.</p>
                  <button
                    className="assistant-input"
                    onClick={() => navigate("assistant")}
                  >
                    <span>What’s on your mind?</span>
                    <span className="round-arrow">
                      <Icon name="arrow" />
                    </span>
                  </button>
                  <div className="prompt-chips">
                    <button
                      onClick={() =>
                        promptAssistant("Help me plan a realistic day.")
                      }
                    >
                      Plan my day ↗
                    </button>
                    <button
                      onClick={() =>
                        promptAssistant(
                          "Help me untangle my thoughts. Ask me one question at a time.",
                        )
                      }
                    >
                      Untangle a thought ↗
                    </button>
                  </div>
                </section>
              </div>
              <div className="workspace-grid">
                <section className="card tasks-card">
                  <div className="card-top">
                    <div className="card-title">
                      <span className="tile-icon">
                        <Icon name="check" />
                      </span>
                      <div>
                        <h2>Today’s little wins</h2>
                        <p>
                          {completed} of {tasks.length} done · one step at a
                          time
                        </p>
                      </div>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Add task"
                      onClick={() => openQuick("task")}
                    >
                      <Icon name="plus" />
                    </button>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  {taskList}
                  <button className="add-row" onClick={() => openQuick("task")}>
                    <Icon name="plus" /> Add a little win
                  </button>
                </section>
                <section className="card scratch-card">
                  <div className="card-top">
                    <div className="card-title">
                      <span className="tile-icon">
                        <Icon name="note" />
                      </span>
                      <div>
                        <h2>Brain dump</h2>
                        <p>No need to make it pretty.</p>
                      </div>
                    </div>
                    <span className="handwritten">just let it out ↙</span>
                  </div>
                  <form onSubmit={addNote}>
                    <textarea
                      aria-label="Brain dump"
                      placeholder="An idea, a grocery list, that thing you keep forgetting…"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                    />
                    <div className="scratch-footer">
                      <span>Thoughts become notes.</span>
                      <button
                        className="button secondary"
                        disabled={!noteDraft.trim()}
                      >
                        <Icon name="plus" /> Keep this thought
                      </button>
                    </div>
                  </form>
                </section>
                <section className="card pages-card">
                  <div className="card-top">
                    <div className="card-title">
                      <span className="tile-icon">
                        <Icon name="note" />
                      </span>
                      <div>
                        <h2>Your pages</h2>
                        <p>A home for everything in motion.</p>
                      </div>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("planner")}
                    >
                      Open planner <Icon name="arrow" />
                    </button>
                  </div>
                  <div className="page-links">
                    <button onClick={() => navigate("planner")}>
                      <span className="page-link-icon">
                        <Icon name="calendar" />
                      </span>
                      <span>
                        Daily rhythm<small>Your day, in your own words</small>
                      </span>
                      <Icon name="arrow" />
                    </button>
                    <button onClick={() => navigate("projects")}>
                      <span className="page-link-icon rose">
                        <Icon name="grid" />
                      </span>
                      <span>
                        Things in motion
                        <small>
                          {activeProjects.length} active project
                          {activeProjects.length === 1 ? "" : "s"}
                        </small>
                      </span>
                      <Icon name="arrow" />
                    </button>
                    <button onClick={() => navigate("notes")}>
                      <span className="page-link-icon amber">
                        <Icon name="note" />
                      </span>
                      <span>
                        Collected thoughts
                        <small>
                          {data.notes.length} saved note
                          {data.notes.length === 1 ? "" : "s"}
                        </small>
                      </span>
                      <Icon name="arrow" />
                    </button>
                  </div>
                </section>
                <section className="card focus-card">
                  <div className="card-top">
                    <span className="eyebrow">
                      <Icon name="clock" /> A pocket of focus
                    </span>
                    <button
                      className="icon-button"
                      aria-label="Reset focus timer"
                      onClick={() => {
                        setFocusRunning(false);
                        setFocusSeconds(1500);
                      }}
                    >
                      <Icon name="refresh" />
                    </button>
                  </div>
                  <div
                    className={`focus-display ${focusRunning ? "running" : ""}`}
                  >
                    <span>
                      {String(Math.floor(focusSeconds / 60)).padStart(2, "0")}
                      <span className="timer-colon">:</span>
                      {String(focusSeconds % 60).padStart(2, "0")}
                    </span>
                    <span className="focus-orbit" />
                  </div>
                  <div className="focus-bottom">
                    <span>
                      {focusRunning
                        ? "One thing. Right now."
                        : focusSeconds === 0
                          ? "You showed up. Take a breath."
                          : "One thing at a time is enough."}
                    </span>
                    <button className="button secondary" onClick={toggleFocus}>
                      <Icon name={focusRunning ? "pause" : "play"} />
                      {focusRunning
                        ? "Pause"
                        : focusSeconds === 0
                          ? "Again?"
                          : "Let’s focus"}
                    </button>
                  </div>
                </section>
              </div>
              <section className="reminders-strip">
                <div>
                  <Icon name="clock" />
                  <span>Coming up</span>
                </div>
                {data.reminders.length ? (
                  <div className="reminder-pills">
                    {data.reminders.slice(0, 3).map((r) => (
                      <span key={r.id}>
                        {r.text}
                        <small>{r.displayTime}</small>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>A clear horizon. Add a reminder for your future self.</p>
                )}
                <button
                  className="text-button"
                  onClick={() => openQuick("reminder")}
                >
                  <Icon name="plus" /> Reminder
                </button>
              </section>
            </>
          )}
          {view === "planner" && (
            <div className="planner-layout">
              <section className="card editor-card">
                <div className="card-top">
                  <div className="segmented" aria-label="Planner period">
                    <button
                      aria-pressed={period === "daily"}
                      className={period === "daily" ? "selected" : ""}
                      onClick={() => switchPeriod("daily")}
                    >
                      Daily
                    </button>
                    <button
                      aria-pressed={period === "weekly"}
                      className={period === "weekly" ? "selected" : ""}
                      onClick={() => switchPeriod("weekly")}
                    >
                      Weekly
                    </button>
                  </div>
                  <span className="editor-status">
                    {planDirty ? "Unsaved changes" : "Saved to your workspace"}
                  </span>
                </div>
                <div className="editor-heading">
                  <span>{period === "daily" ? "☀" : "▦"}</span>
                  <h2>
                    {period === "daily" ? "My daily rhythm" : "The week ahead"}
                  </h2>
                  <p>A living page. Make it yours.</p>
                </div>
                <textarea
                  aria-label={`${period} planner`}
                  className="page-editor"
                  value={plan}
                  onChange={(e) => {
                    setPlan(e.target.value);
                    setPlanDirty(true);
                  }}
                  spellCheck
                  placeholder="Start with one thing…"
                />
                <div className="editor-footer">
                  <span>
                    Tip: use • for lists, or leave room for a little
                    spontaneity.
                  </span>
                  <button
                    className="button primary"
                    onClick={savePlan}
                    disabled={saving || !planDirty}
                  >
                    {saving ? "Saving…" : "Save page"}
                    <Icon name="check" />
                  </button>
                </div>
              </section>
              <aside className="planner-side">
                <section className="card tasks-card">
                  <div className="card-top">
                    <h2>Daily check-ins</h2>
                    <button
                      className="icon-button"
                      aria-label="Add check-in"
                      onClick={() => openQuick("task")}
                    >
                      <Icon name="plus" />
                    </button>
                  </div>
                  {taskList}
                </section>
                <section className="card reminders-card">
                  <div className="card-top">
                    <h2>Reminders</h2>
                    <button
                      className="icon-button"
                      aria-label="Add reminder"
                      onClick={() => openQuick("reminder")}
                    >
                      <Icon name="plus" />
                    </button>
                  </div>
                  {data.reminders.length ? (
                    data.reminders.map((r) => (
                      <div className="saved-reminder" key={r.id}>
                        <div>
                          <strong>{r.text}</strong>
                          <span>{r.displayTime}</span>
                        </div>
                        <button
                          className="icon-button"
                          aria-label={`Delete reminder ${r.text}`}
                          onClick={() =>
                            mutate(
                              () => staticDelete(`/reminders/${r.id}`),
                              "Reminder removed.",
                            )
                          }
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <Empty
                      icon="clock"
                      title="Nothing waiting in the wings."
                      detail="Save something for later."
                    />
                  )}
                </section>
                <section className="card hydration-card">
                  <Icon name="drop" />
                  <h2>A sip, a stretch, a reset.</h2>
                  <p>
                    Water nudges every {data.waterSettings.intervalMinutes}{" "}
                    minutes, 8am–10pm IST.
                  </p>
                  <button
                    className="button secondary"
                    onClick={() =>
                      mutate(
                        () =>
                          staticPost("/water-settings", {
                            ...data.waterSettings,
                            paused: !data.waterSettings.paused,
                          }),
                        data.waterSettings.paused
                          ? "Water nudges resumed."
                          : "Water nudges paused.",
                      )
                    }
                  >
                    {data.waterSettings.paused
                      ? "Resume nudges"
                      : "Pause nudges"}
                  </button>
                </section>
              </aside>
            </div>
          )}
          {view === "notes" && (
            <>
              <div className="view-toolbar">
                <label className="filter-input">
                  <Icon name="search" />
                  <input
                    aria-label="Search notes"
                    placeholder="Find a thought…"
                    value={notesFilter}
                    onChange={(e) => setNotesFilter(e.target.value)}
                  />
                </label>
                <button
                  className="button secondary"
                  onClick={() => openQuick("note")}
                >
                  <Icon name="plus" /> New note
                </button>
              </div>
              {filteredNotes.length ? (
                notesGrid
              ) : (
                <section className="card roomy-empty">
                  <Empty
                    icon="note"
                    title={
                      notesFilter
                        ? "No thoughts match that search."
                        : "Your thoughts deserve a little space."
                    }
                    detail={
                      notesFilter
                        ? "Try a different word."
                        : "Create a note. Write freely. Edit whenever you like."
                    }
                  />
                  {!notesFilter && (
                    <button
                      className="button primary"
                      onClick={() => openQuick("note")}
                    >
                      <Icon name="plus" /> Capture a thought
                    </button>
                  )}
                </section>
              )}
            </>
          )}
          {view === "projects" && (
            <>
              <div className="view-toolbar">
                <span className="muted">
                  {activeProjects.length} in motion ·{" "}
                  {data.projects.length - activeProjects.length} completed
                </span>
                <button
                  className="button secondary"
                  onClick={() => openQuick("project")}
                >
                  <Icon name="plus" /> New project
                </button>
              </div>
              <div className="project-board">
                {["active", "paused", "completed"].map((status) => (
                  <section className="project-column" key={status}>
                    <div className="column-heading">
                      <i className={status} />
                      <h2>
                        {
                          {
                            active: "In motion",
                            paused: "On the back burner",
                            completed: "Look what you did",
                          }[status]
                        }
                      </h2>
                      <span>
                        {
                          data.projects.filter((p) => p.status === status)
                            .length
                        }
                      </span>
                    </div>
                    {data.projects
                      .filter((p) => p.status === status)
                      .map((project) => (
                        <article className="card project-tile" key={project.id}>
                          <Icon name="grid" />
                          <h3>{project.name}</h3>
                          <p>
                            {project.detail ||
                              "A little idea with room to grow."}
                          </p>
                          <div className="project-tile-footer">
                            <span className={`status-tag ${status}`}>
                              {status}
                            </span>
                            <label>
                              <span className="sr-only">
                                Status for {project.name}
                              </span>
                              <select
                                aria-label={`Status for ${project.name}`}
                                value={status}
                                onChange={(e) =>
                                  mutate(
                                    () =>
                                      staticPatch(`/projects/${project.id}`, {
                                        status: e.target.value,
                                      }),
                                    "Project moved.",
                                  )
                                }
                              >
                                <option value="active">In motion</option>
                                <option value="paused">Pause</option>
                                <option value="completed">Complete</option>
                              </select>
                            </label>
                            <button
                              className="icon-button"
                              aria-label={`Delete project ${project.name}`}
                              onClick={() =>
                                mutate(
                                  () => staticDelete(`/projects/${project.id}`),
                                  "Project removed.",
                                )
                              }
                            >
                              <Icon name="trash" />
                            </button>
                          </div>
                        </article>
                      ))}
                    <button
                      className="column-add"
                      onClick={() => openQuick("project", status)}
                    >
                      <Icon name="plus" /> New project
                    </button>
                  </section>
                ))}
              </div>
            </>
          )}
          {view === "affirmations" && (
            <div className="affirmation-page">
              <div>
                {affirmationCard}
                <section className="card custom-affirmation">
                  <h2>In your own words.</h2>
                  <p>Sometimes you know exactly what you need to hear.</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (
                        customAffirmation.trim() &&
                        !favorites.includes(customAffirmation.trim())
                      ) {
                        toggleFavorite(customAffirmation.trim());
                        setCustomAffirmation("");
                      }
                    }}
                  >
                    <input
                      aria-label="Your own affirmation"
                      placeholder="I am… I can… I deserve…"
                      value={customAffirmation}
                      onChange={(e) => setCustomAffirmation(e.target.value)}
                    />
                    <button
                      className="button primary"
                      disabled={!customAffirmation.trim()}
                    >
                      Keep it <Icon name="heart" />
                    </button>
                  </form>
                </section>
              </div>
              <section className="card saved-affirmations">
                <div className="card-top">
                  <h2>Words worth keeping</h2>
                  <span className="small-pill">{favorites.length} SAVED</span>
                </div>
                {favorites.length ? (
                  favorites.map((text) => (
                    <div className="saved-affirmation" key={text}>
                      <span>“{text}”</span>
                      <button
                        className="icon-button selected"
                        aria-label={`Unsave ${text}`}
                        onClick={() => toggleFavorite(text)}
                      >
                        <Icon name="heart" />
                      </button>
                    </div>
                  ))
                ) : (
                  <Empty
                    icon="heart"
                    title="Keep a little kindness here."
                    detail="Tap the heart on a thought that speaks to you."
                  />
                )}
              </section>
            </div>
          )}
          {view === "assistant" && (
            <section className="card chat-card">
              <div className="chat-header">
                <span className="assistant-avatar">
                  <Icon name="spark" />
                </span>
                <div>
                  <h2>Your thinking partner</h2>
                  <p>
                    {aiConfigured && accessToken
                      ? "Ready when you are"
                      : "Live AI needs a connection"}
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => setAiSetup(true)}
                >
                  {aiConfigured && accessToken ? "Connection" : "Connect AI"}
                </button>
              </div>
              <div className="chat-messages" aria-live="polite">
                {chat.length ? (
                  chat.map((entry, i) => (
                    <div className={`chat-message ${entry.role}`} key={i}>
                      <span>{entry.role === "user" ? "You" : "Assistant"}</span>
                      <p>{entry.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="chat-welcome">
                    <span className="welcome-spark">
                      <Icon name="spark" />
                    </span>
                    <h2>
                      Hey. What’s taking up
                      <br />
                      space in your head?
                    </h2>
                    <p>
                      A plan, a half-formed idea, a day that needs a reset.
                      <br />
                      Start anywhere.
                    </p>
                    <div className="chat-suggestions">
                      {[
                        "Help me plan a realistic day.",
                        "Help me turn an idea into a project.",
                        "Write me a gentle affirmation.",
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setAiPrompt(prompt)}
                        >
                          {prompt}
                          <Icon name="arrow" />
                        </button>
                      ))}
                    </div>
                    {!aiConfigured && (
                      <span className="connection-note">
                        AI chat is ready to connect. Your planner and notes
                        already work.
                      </span>
                    )}
                  </div>
                )}
                {aiBusy && (
                  <div className="thinking">
                    <span />
                    <span />
                    <span /> Thinking it through…
                  </div>
                )}
              </div>
              {aiError && (
                <p className="inline-error" role="alert">
                  {aiError}
                </p>
              )}
              <form className="chat-composer" onSubmit={sendPrompt}>
                <textarea
                  aria-label="Message assistant"
                  rows="2"
                  placeholder="Let’s make a little sense of it…"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form.requestSubmit();
                    }
                  }}
                />
                <div className="composer-bottom">
                  <label>
                    <input
                      type="checkbox"
                      checked={useContext}
                      onChange={(e) => setUseContext(e.target.checked)}
                    />{" "}
                    Include my workspace{" "}
                    <span title="When selected, your plans, tasks, notes, and project names are shared with OpenAI for this response.">
                      ⓘ
                    </span>
                  </label>
                  <button
                    className="button primary"
                    disabled={!aiPrompt.trim() || aiBusy}
                  >
                    {aiBusy
                      ? "Thinking…"
                      : !aiConfigured || !accessToken
                        ? "Connect to send"
                        : "Send"}
                    <Icon name="arrow" />
                  </button>
                </div>
              </form>
              <p className="chat-footnote">
                Messages go to OpenAI when you send. Workspace context is shared
                only when selected.
              </p>
            </section>
          )}
          <footer className="page-footer">
            <span>
              <i /> A little space for everything.
            </span>
            <span>Made for real days. Not perfect ones. ✦</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" />
          {toast}
        </div>
      )}
      {(quick || command || aiSetup) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setQuick(null);
            setCommand(false);
            setAiSetup(false);
          }}
        >
          <section
            className={`modal ${command ? "command-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={
              command
                ? "Find anything"
                : aiSetup
                  ? "AI connection"
                  : `New ${quick}`
            }
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="Close dialog"
              onClick={() => {
                setQuick(null);
                setCommand(false);
                setAiSetup(false);
              }}
            >
              <Icon name="close" />
            </button>
            {command ? (
              <>
                <div className="command-search">
                  <Icon name="search" />
                  <input
                    placeholder="Go somewhere. Start something."
                    aria-label="Search workspace"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <p className="nav-label">PAGES</p>
                {pages
                  .filter((p) =>
                    p.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((p) => (
                    <button
                      className="command-result"
                      key={p.id}
                      onClick={() => navigate(p.id)}
                    >
                      <Icon name={p.icon} />
                      {p.name}
                      <Icon name="arrow" />
                    </button>
                  ))}
                <p className="nav-label">QUICK CAPTURE</p>
                {["task", "note", "project", "reminder"]
                  .filter((kind) => kind.includes(query.toLowerCase()))
                  .map((kind) => (
                    <button
                      className="command-result"
                      key={kind}
                      onClick={() => openQuick(kind)}
                    >
                      <Icon name="plus" />
                      New {kind}
                      <Icon name="arrow" />
                    </button>
                  ))}
              </>
            ) : aiSetup ? (
              <>
                <span className="modal-emblem">
                  <Icon name="spark" />
                </span>
                <h2>
                  A little intelligence.
                  <br />
                  Your own connection.
                </h2>
                <p>
                  {aiConfigured
                    ? "Your AI service is connected. Enter your workspace access code to start chatting."
                    : "The assistant is ready for a live AI connection. Add the server settings below in Vercel, then redeploy."}
                </p>
                {!aiConfigured && (
                  <div className="setup-list">
                    <code>OPENAI_API_KEY</code>
                    <span>Your OpenAI API key</span>
                    <code>ASSISTANT_ACCESS_TOKEN</code>
                    <span>A private access code for this workspace</span>
                    <code>
                      OPENAI_MODEL <small>(optional)</small>
                    </code>
                    <span>Defaults to gpt-4.1-mini</span>
                  </div>
                )}
                <label className="form-label">
                  Workspace access code
                  <input
                    type="password"
                    autoComplete="off"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Your private access code"
                  />
                </label>
                <p className="small-print">
                  The access code stays in this tab. Your API key stays on the
                  server.
                </p>
                <button
                  className="button primary"
                  onClick={() => {
                    setAiSetup(false);
                    navigate("assistant");
                  }}
                >
                  Back to assistant
                  <Icon name="arrow" />
                </button>
              </>
            ) : (
              <>
                <span className="modal-emblem">
                  <Icon
                    name={
                      {
                        task: "check",
                        note: "note",
                        project: "grid",
                        reminder: "clock",
                      }[quick]
                    }
                  />
                </span>
                <h2>
                  {
                    {
                      task: "A little win to work toward.",
                      note: "Catch that thought.",
                      project: "Give an idea a home.",
                      reminder: "For your future self.",
                    }[quick]
                  }
                </h2>
                <p>Less to hold in your head. More room to think.</p>
                <div className="capture-tabs">
                  {["task", "note", "project", "reminder"].map((kind) => (
                    <button
                      className={quick === kind ? "selected" : ""}
                      key={kind}
                      onClick={() => setQuick(kind)}
                    >
                      {kind}
                    </button>
                  ))}
                </div>
                <form onSubmit={submitQuick}>
                  <label className="form-label">
                    {quick === "project"
                      ? "Project name"
                      : quick === "note"
                        ? "Your thought"
                        : "What is it?"}
                    {quick === "note" ? (
                      <textarea
                        required
                        value={form.text}
                        onChange={(e) =>
                          setForm({ ...form, text: e.target.value })
                        }
                        placeholder="It can be a little messy."
                      />
                    ) : (
                      <input
                        required
                        value={form.text}
                        onChange={(e) =>
                          setForm({ ...form, text: e.target.value })
                        }
                        placeholder={
                          quick === "task"
                            ? "One small thing…"
                            : quick === "project"
                              ? "That thing you’ve been thinking about…"
                              : "Something to come back to…"
                        }
                      />
                    )}
                  </label>
                  {quick === "project" && (
                    <label className="form-label">
                      A little context <span>(optional)</span>
                      <textarea
                        value={form.detail}
                        onChange={(e) =>
                          setForm({ ...form, detail: e.target.value })
                        }
                        placeholder="An idea, a next step, a reason why."
                      />
                    </label>
                  )}
                  {quick === "task" && (
                    <label className="form-label">
                      Daily check-in time
                      <input
                        type="time"
                        required
                        value={form.time}
                        onChange={(e) =>
                          setForm({ ...form, time: e.target.value })
                        }
                      />
                    </label>
                  )}
                  {quick === "reminder" && (
                    <label className="form-label">
                      When should it come back?
                      <input
                        type="datetime-local"
                        required
                        value={form.date}
                        onChange={(e) =>
                          setForm({ ...form, date: e.target.value })
                        }
                      />
                    </label>
                  )}
                  <button className="button primary modal-submit">
                    Save {quick}
                    <Icon name="check" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
export default App;
