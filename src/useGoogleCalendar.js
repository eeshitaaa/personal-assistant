import { useCallback, useEffect, useRef, useState } from "react";
import {
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_CLIENT_ID_KEY,
  isGoogleClientId,
  loadGoogleIdentity,
  listCalendarEvents,
  saveCalendarEvent,
} from "./googleCalendar";

export default function useGoogleCalendar() {
  const [clientId, setClientId] = useState(
    () =>
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem(GOOGLE_CLIENT_ID_KEY) ||
      "",
  );
  const [ready, setReady] = useState(false);
  const [identityVersion, setIdentityVersion] = useState(0);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const session = useRef(null);
  const tokenClient = useRef(null);
  const generation = useRef(0);
  const expiryTimer = useRef(null);
  const signingIn = useRef(false);

  const refresh = useCallback(async () => {
    const current = session.current;
    if (!current || Date.now() >= current.expiresAt) {
      setError("Reconnect Google Calendar to refresh events.");
      return;
    }
    const requestGeneration = generation.current;
    setLoading(true);
    try {
      const result = await listCalendarEvents(current.token);
      if (requestGeneration !== generation.current) return;
      setEvents(result.events);
      setTruncated(result.truncated);
      setLastRefreshed(Date.now());
      setError("");
    } catch (err) {
      if (requestGeneration !== generation.current) return;
      setError(err.message);
      if (err.status === 401) {
        session.current = null;
        setConnected(false);
        setEvents([]);
        clearTimeout(expiryTimer.current);
      }
    } finally {
      if (requestGeneration === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!clientId || !isGoogleClientId(clientId)) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then((oauth) => {
        if (cancelled) return;
        tokenClient.current = oauth.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_CALENDAR_SCOPE,
          include_granted_scopes: false,
          callback: (response) => {
            if (cancelled) return;
            signingIn.current = false;
            setBusy(false);
            if (
              response.error ||
              !response.access_token ||
              !oauth.hasGrantedAllScopes(response, GOOGLE_CALENDAR_SCOPE)
            ) {
              setError(
                "Calendar access was not granted. Try connecting again and allow the requested Calendar permission.",
              );
              return;
            }
            generation.current += 1;
            const expiresIn = Number(response.expires_in) || 3600;
            session.current = {
              token: response.access_token,
              expiresAt: Date.now() + expiresIn * 1000,
            };
            setConnected(true);
            setError("");
            clearTimeout(expiryTimer.current);
            expiryTimer.current = setTimeout(
              () => {
                generation.current += 1;
                session.current = null;
                setConnected(false);
                setEvents([]);
                setError("Your Google session expired. Reconnect to continue.");
              },
              Math.max(1000, expiresIn * 1000 - 30000),
            );
            void refresh();
          },
          error_callback: (response) => {
            if (!cancelled) {
              signingIn.current = false;
              setBusy(false);
              setError(
                response.type === "popup_closed"
                  ? "Google sign-in was closed. You can connect again anytime."
                  : "Google sign-in could not open. Allow pop-ups for this site and try again.",
              );
            }
          },
        });
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
      tokenClient.current = null;
      clearTimeout(expiryTimer.current);
    };
  }, [clientId, identityVersion, refresh]);
  useEffect(() => {
    if (!connected) return;
    const timer = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [connected, refresh]);
  function saveClientId(value) {
    const trimmed = value.trim();
    if (!isGoogleClientId(trimmed)) {
      setError(
        "Use the OAuth web client ID ending in .apps.googleusercontent.com.",
      );
      return false;
    }
    generation.current += 1;
    session.current = null;
    setConnected(false);
    setEvents([]);
    setReady(false);
    setError("");
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, trimmed);
    setClientId(trimmed);
    setIdentityVersion((version) => version + 1);
    return true;
  }
  function connect() {
    setError("");
    if (!tokenClient.current || !ready) {
      setError("Google sign-in is not ready yet. Check setup and try again.");
      return;
    }
    if (signingIn.current) return;
    signingIn.current = true;
    setBusy(true);
    try {
      tokenClient.current.requestAccessToken({
        prompt: connected ? "" : "consent",
      });
    } catch {
      signingIn.current = false;
      setBusy(false);
      setError("Google sign-in could not open. Try again.");
    }
  }
  async function disconnect() {
    const current = session.current;
    generation.current += 1;
    session.current = null;
    clearTimeout(expiryTimer.current);
    setConnected(false);
    setEvents([]);
    setLastRefreshed(null);
    setLoading(false);
    setError("");
    if (current && window.google?.accounts?.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(current.token, () => {});
      } catch {
        /* The local session is already cleared. */
      }
    }
  }
  async function saveEvent(body, event = null) {
    if (!session.current || Date.now() >= session.current.expiresAt)
      throw new Error("Reconnect Google Calendar before saving.");
    const result = await saveCalendarEvent(session.current.token, body, event);
    await refresh();
    return result;
  }
  return {
    clientId,
    ready,
    connected,
    events,
    error,
    busy,
    loading,
    truncated,
    lastRefreshed,
    saveClientId,
    connect,
    disconnect,
    refresh,
    saveEvent,
  };
}
