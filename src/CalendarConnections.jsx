import { useState } from "react";
import {
  blankCalendarDraft,
  calendarEventBody,
  eventToDraft,
  safeCalendarLink,
  CALENDAR_ZONE,
} from "./googleCalendar";
import { getTodayKey } from "./schedule";

function dateLabel(event) {
  if (event.start.date)
    return new Date(`${event.start.date}T12:00:00Z`).toLocaleDateString(
      "en-IN",
      { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" },
    );
  return new Date(event.start.dateTime).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: CALENDAR_ZONE,
  });
}
function eventTime(event) {
  if (event.start.date) return "All day";
  const options = {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CALENDAR_ZONE,
  };
  return `${new Date(event.start.dateTime).toLocaleTimeString("en-IN", options)} – ${new Date(event.end.dateTime).toLocaleTimeString("en-IN", options)}`;
}
export default function CalendarConnections(props) {
  const { calendar, notifications, Icon, onToast } = props;
  const [clientDraft, setClientDraft] = useState(calendar.clientId);
  const [setupOpen, setSetupOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [review, setReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [savedEventLink, setSavedEventLink] = useState("");
  const today = getTodayKey();
  const notificationOn =
    notifications.permission === "granted" && notifications.settings.enabled;
  const visibleEvents = calendar.events.filter((event) => {
    const day = event.start.date || getTodayKey(new Date(event.start.dateTime));
    return (
      (filter !== "today" || day === today) &&
      (event.summary || "").toLowerCase().includes(search.toLowerCase())
    );
  });
  function startEvent(event = null) {
    setEditingEvent(event);
    setEventDraft(event ? eventToDraft(event) : blankCalendarDraft());
    setReview(null);
    setFormError("");
    setSavedEventLink("");
  }
  function updateDraft(changes) {
    setEventDraft((old) => ({ ...old, ...changes }));
    setReview(null);
    setFormError("");
  }
  function reviewEvent(event) {
    event.preventDefault();
    setFormError("");
    try {
      setReview(calendarEventBody(eventDraft));
    } catch (err) {
      setFormError(err.message);
    }
  }
  async function saveEvent() {
    if (!review || saving) return;
    setSaving(true);
    setFormError("");
    try {
      const saved = await calendar.saveEvent(review, editingEvent);
      setSavedEventLink(safeCalendarLink(saved.htmlLink));
      setEventDraft(null);
      setReview(null);
      setEditingEvent(null);
      onToast("Saved to Google Calendar.");
    } catch (err) {
      setFormError(err.message || "Could not save your event.");
    } finally {
      setSaving(false);
    }
  }
  const notificationOptions = [
    {
      key: "reminders",
      label: "Saved reminders",
      detail: "At the date and time you chose.",
    },
    {
      key: "activities",
      label: "Daily plan",
      detail: "When a scheduled activity starts.",
    },
    {
      key: "checkins",
      label: "Daily check-ins",
      detail: "Only for tasks you haven’t completed.",
    },
    {
      key: "calendar",
      label: "Google Calendar events",
      detail: "For timed events while Calendar is connected.",
    },
    {
      key: "water",
      label: "Water breaks",
      detail: "Uses your water reminder interval.",
    },
  ];
  return (
    <div className="connections-layout">
      <section className="card calendar-console">
        <div className="card-top">
          <div className="card-title">
            <span className="tile-icon google-mark" aria-hidden="true">
              G
            </span>
            <div>
              <h2>Google Calendar</h2>
              <p>
                {calendar.connected
                  ? "Your primary calendar · times in IST"
                  : "Your plans, in one place."}
              </p>
            </div>
          </div>
          <span
            className={`connection-status ${calendar.connected ? "connected" : ""}`}
          >
            <i />
            {calendar.connected ? "Connected" : "Not connected"}
          </span>
        </div>
        {!calendar.connected ? (
          <div className="calendar-connect">
            <span className="connect-art">
              <Icon name="calendar" />
            </span>
            <h3>Bring your calendar here.</h3>
            <p>
              See your next two weeks, add events, and change plans without
              switching tabs.
            </p>
            <button
              className="button primary"
              onClick={calendar.connect}
              disabled={!calendar.ready || calendar.busy}
            >
              {calendar.busy
                ? "Waiting for Google…"
                : calendar.clientId && !calendar.ready
                  ? "Loading Google sign-in…"
                  : "Connect Google Calendar"}
              <Icon name="arrow" />
            </button>
            <span className="connection-footnote">
              You choose your account and approve access in Google. Your events
              and access token stay in this tab.
            </span>
            {!calendar.clientId && (
              <button
                className="text-button setup-toggle"
                onClick={() => setSetupOpen((value) => !value)}
              >
                {setupOpen
                  ? "Hide one-time setup"
                  : "Set up the Google connection"}
                <Icon name="arrow" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="calendar-toolbar">
              <div className="segmented">
                <button
                  className={filter === "upcoming" ? "selected" : ""}
                  aria-pressed={filter === "upcoming"}
                  onClick={() => setFilter("upcoming")}
                >
                  Next 2 weeks
                </button>
                <button
                  className={filter === "today" ? "selected" : ""}
                  aria-pressed={filter === "today"}
                  onClick={() => setFilter("today")}
                >
                  Today
                </button>
              </div>
              <div>
                <button
                  className="icon-button"
                  aria-label="Refresh calendar"
                  disabled={calendar.loading}
                  onClick={calendar.refresh}
                >
                  <Icon name="refresh" />
                </button>
                <button
                  className="button secondary"
                  onClick={() => startEvent()}
                >
                  <Icon name="plus" />
                  New event
                </button>
              </div>
            </div>
            <label className="filter-input calendar-search">
              <Icon name="search" />
              <input
                aria-label="Search calendar events"
                placeholder="Find an event…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            {calendar.loading && (
              <p className="calendar-loading" role="status">
                Refreshing your calendar…
              </p>
            )}
            {calendar.truncated && (
              <p className="connection-footnote">
                Showing the first 1,000 events. Open Google Calendar for the
                rest.
              </p>
            )}
            <div className="calendar-event-list">
              {visibleEvents.length
                ? visibleEvents.map((event) => (
                    <article className="calendar-event" key={event.id}>
                      <div className="event-date">
                        <Icon name="calendar" />
                        <span>{dateLabel(event)}</span>
                      </div>
                      <div className="event-info">
                        <h3>{event.summary || "Untitled event"}</h3>
                        <span>
                          {eventTime(event)}
                          {event.start.date ? "" : " IST"}
                        </span>
                        {event.location && <p>{event.location}</p>}
                        {event.recurringEventId && (
                          <small>
                            Recurring event · editing changes this occurrence
                          </small>
                        )}
                      </div>
                      <div className="event-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit calendar event ${event.summary || "Untitled event"}`}
                          onClick={() => startEvent(event)}
                        >
                          <Icon name="note" />
                        </button>
                        <a
                          className="icon-button"
                          aria-label={`Open ${event.summary || "event"} in Google Calendar`}
                          href={safeCalendarLink(event.htmlLink)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icon name="arrow" />
                        </a>
                      </div>
                    </article>
                  ))
                : !calendar.loading && (
                    <div className="empty">
                      <Icon name="calendar" />
                      <p>
                        {search
                          ? "No events match that search."
                          : filter === "today"
                            ? "No events today."
                            : "Your next two weeks are clear."}
                      </p>
                      <span>
                        {search
                          ? "Try a different title."
                          : "Add an event when you need one."}
                      </span>
                    </div>
                  )}
            </div>
            <div className="calendar-session-footer">
              <span>
                {calendar.lastRefreshed
                  ? `Updated ${new Date(calendar.lastRefreshed).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`
                  : ""}
              </span>
              <button className="text-button" onClick={calendar.disconnect}>
                Disconnect Google Calendar
              </button>
            </div>
          </>
        )}
        {calendar.error && (
          <p className="connection-error" role="alert">
            {calendar.error}
          </p>
        )}
        {savedEventLink && (
          <p className="calendar-save-success" role="status">
            Event saved.{" "}
            <a href={savedEventLink} target="_blank" rel="noreferrer">
              Open in Google Calendar ↗
            </a>
          </p>
        )}
        {(setupOpen || (!calendar.clientId && calendar.error)) && (
          <section className="google-setup">
            <h3>One-time Google setup</h3>
            <p>
              You need an OAuth web client for this app. If Google Cloud asks
              for two-step verification, complete that in your Google account
              first.
            </p>
            <ol>
              <li>
                In{" "}
                <a
                  href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Cloud
                </a>
                , enable Google Calendar API.
              </li>
              <li>
                Set up the consent screen. For a personal test app, add your
                Google account as a test user.
              </li>
              <li>
                Create a Web application OAuth client. Add this exact authorized
                JavaScript origin:<code>{window.location.origin}</code>
              </li>
              <li>
                Paste the public client ID below. No client secret is needed.
              </li>
            </ol>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (calendar.saveClientId(clientDraft)) {
                  setSetupOpen(false);
                  onToast("Google connection configured. You can sign in now.");
                }
              }}
            >
              <label className="form-label">
                Google OAuth client ID
                <input
                  value={clientDraft}
                  onChange={(event) => setClientDraft(event.target.value)}
                  placeholder="…apps.googleusercontent.com"
                  autoComplete="off"
                  required
                />
              </label>
              <button className="button secondary">
                Save connection settings
                <Icon name="check" />
              </button>
            </form>
            <span className="connection-footnote">
              Use one stable app address; a different preview address needs its
              own authorized origin.
            </span>
          </section>
        )}
        {calendar.clientId && !calendar.connected && (
          <button
            className="text-button edit-google-setup"
            onClick={() => setSetupOpen((value) => !value)}
          >
            {setupOpen ? "Hide settings" : "Edit connection settings"}
          </button>
        )}
        {eventDraft && (
          <section className="calendar-editor">
            <div className="activity-form-top">
              <h3>{editingEvent ? "Edit event" : "New event"}</h3>
              <button
                className="icon-button"
                aria-label="Close event editor"
                disabled={saving}
                onClick={() => {
                  setEventDraft(null);
                  setReview(null);
                  setFormError("");
                }}
              >
                <Icon name="close" />
              </button>
            </div>
            {editingEvent?.recurringEventId && (
              <p className="connection-footnote">
                You’re changing this occurrence, not the whole recurring series.
              </p>
            )}
            {!review ? (
              <form onSubmit={reviewEvent}>
                <label className="form-label">
                  Event name
                  <input
                    required
                    maxLength="500"
                    value={eventDraft.title}
                    onChange={(event) =>
                      updateDraft({ title: event.target.value })
                    }
                    placeholder="What’s happening?"
                  />
                </label>
                <label className="calendar-checkbox">
                  <input
                    type="checkbox"
                    checked={eventDraft.allDay}
                    onChange={(event) =>
                      updateDraft({ allDay: event.target.checked })
                    }
                  />
                  All day
                </label>
                <div className="event-date-fields">
                  <label className="form-label">
                    Start date
                    <input
                      type="date"
                      required
                      value={eventDraft.startDate}
                      onChange={(event) =>
                        updateDraft({ startDate: event.target.value })
                      }
                    />
                  </label>
                  {!eventDraft.allDay && (
                    <label className="form-label">
                      Start time <span>IST</span>
                      <input
                        type="time"
                        required
                        value={eventDraft.startTime}
                        onChange={(event) =>
                          updateDraft({ startTime: event.target.value })
                        }
                      />
                    </label>
                  )}
                  <label className="form-label">
                    End date
                    <input
                      type="date"
                      required
                      value={eventDraft.endDate}
                      onChange={(event) =>
                        updateDraft({ endDate: event.target.value })
                      }
                    />
                  </label>
                  {!eventDraft.allDay && (
                    <label className="form-label">
                      End time <span>IST</span>
                      <input
                        type="time"
                        required
                        value={eventDraft.endTime}
                        onChange={(event) =>
                          updateDraft({ endTime: event.target.value })
                        }
                      />
                    </label>
                  )}
                </div>
                <label className="form-label">
                  Location <span>(optional)</span>
                  <input
                    value={eventDraft.location}
                    onChange={(event) =>
                      updateDraft({ location: event.target.value })
                    }
                    placeholder="Where?"
                  />
                </label>
                <label className="form-label">
                  Notes <span>(optional)</span>
                  <textarea
                    value={eventDraft.description}
                    onChange={(event) =>
                      updateDraft({ description: event.target.value })
                    }
                    placeholder="Anything to remember."
                  />
                </label>
                <label className="form-label">
                  Google Calendar reminder
                  <select
                    value={eventDraft.reminder}
                    onChange={(event) =>
                      updateDraft({ reminder: event.target.value })
                    }
                  >
                    <option value="default">Use my calendar’s defaults</option>
                    <option value="none">No reminder</option>
                    <option value="0">At event start</option>
                    <option value="5">5 minutes before</option>
                    <option value="10">10 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                  </select>
                </label>
                <button className="button primary review-event">
                  Review event
                  <Icon name="arrow" />
                </button>
              </form>
            ) : (
              <div className="event-review">
                <span className="eyebrow">REVIEW BEFORE SAVING</span>
                <h3>{review.summary}</h3>
                <p>
                  {eventDraft.startDate}
                  {!eventDraft.allDay && `, ${eventDraft.startTime} IST`} →{" "}
                  {eventDraft.endDate}
                  {!eventDraft.allDay && `, ${eventDraft.endTime} IST`}
                  {eventDraft.allDay ? " · All day" : ""}
                </p>
                {review.location && <p>{review.location}</p>}
                {review.description && (
                  <p className="review-description">{review.description}</p>
                )}
                <span>
                  Saving updates your primary Google Calendar
                  {editingEvent?.recurringEventId
                    ? " for this occurrence only"
                    : ""}
                  .
                </span>
                <div>
                  <button
                    className="button secondary"
                    disabled={saving}
                    onClick={() => setReview(null)}
                  >
                    Back to edit
                  </button>
                  <button
                    className="button primary"
                    disabled={saving || !calendar.connected}
                    onClick={saveEvent}
                  >
                    {saving ? "Saving…" : "Save to Google Calendar"}
                    <Icon name="check" />
                  </button>
                </div>
              </div>
            )}
            {formError && (
              <p className="connection-error" role="alert">
                {formError}
              </p>
            )}
          </section>
        )}
      </section>
      <aside className="connection-side">
        <section className="card notification-card">
          <div className="card-top">
            <div className="card-title">
              <span className="tile-icon">
                <Icon name="bell" />
              </span>
              <h2>Notifications</h2>
            </div>
            <span
              className={`connection-status ${notificationOn ? "connected" : ""}`}
            >
              <i />
              {notificationOn
                ? "On"
                : notifications.permission === "denied"
                  ? "Blocked"
                  : "Off"}
            </span>
          </div>
          <p className="notification-description">
            Get reminders from this assistant on your device.
          </p>
          <div className="notification-permission-actions">
            {notificationOn ? (
              <>
                <button
                  className="button secondary"
                  onClick={notifications.test}
                  disabled={notifications.testing}
                >
                  {notifications.testing ? "Sending…" : "Send a test"}
                  <Icon name="bell" />
                </button>
                <button
                  className="text-button"
                  onClick={() => notifications.update({ enabled: false })}
                >
                  Turn off
                </button>
              </>
            ) : (
              <button
                className="button primary"
                onClick={notifications.enable}
                disabled={
                  notifications.permission === "unsupported" ||
                  notifications.requesting
                }
              >
                {notifications.requesting
                  ? "Allow in your browser…"
                  : notifications.permission === "denied"
                    ? "Check notification permission"
                    : "Enable notifications"}
                <Icon name="bell" />
              </button>
            )}
          </div>
          {notifications.requesting && (
            <p className="connection-footnote" role="status">
              Choose Allow in the browser’s notification prompt. Bring this tab
              to the front if you don’t see it.
            </p>
          )}
          {notifications.error && (
            <p className="connection-error" role="alert">
              {notifications.error}
            </p>
          )}
          {notifications.permission === "unsupported" && (
            <p className="connection-footnote">
              Use a supported desktop browser. On iPhone or iPad, web
              notifications require an installed Home Screen app.
            </p>
          )}
          <div className="notification-options">
            {notificationOptions.map((option) => (
              <label key={option.key}>
                <span>
                  {option.label}
                  <small>{option.detail}</small>
                </span>
                <input
                  type="checkbox"
                  checked={notifications.settings[option.key]}
                  onChange={(event) =>
                    notifications.update({ [option.key]: event.target.checked })
                  }
                />
                <span className="toggle-track" aria-hidden="true" />
              </label>
            ))}
          </div>
          <label className="form-label">
            Calendar notification timing
            <select
              value={notifications.settings.calendarLeadMinutes}
              onChange={(event) =>
                notifications.update({
                  calendarLeadMinutes: Number(event.target.value),
                })
              }
            >
              <option value="0">At event start</option>
              <option value="5">5 minutes before</option>
              <option value="10">10 minutes before</option>
              <option value="15">15 minutes before</option>
            </select>
          </label>
          <div className="notification-limit">
            <Icon name="clock" />
            <p>
              <strong>Keep the app open for reminders.</strong> A background tab
              is fine, but closing the app stops its reminders. Browser sleep
              can delay them. Google Calendar’s own event reminders follow your
              Google settings.
            </p>
          </div>
        </section>
        <section className="card calendar-access-note">
          <span className="tile-icon">
            <Icon name="calendar" />
          </span>
          <h2>You’re in control.</h2>
          <p>
            Google asks for permission to view and edit events on calendars you
            own. This app uses your primary calendar.
          </p>
          <p>
            You can disconnect here or remove access in your{" "}
            <a
              href="https://myaccount.google.com/connections"
              target="_blank"
              rel="noreferrer"
            >
              Google account
            </a>
            . Google events are not included in AI requests.
          </p>
        </section>
      </aside>
    </div>
  );
}
