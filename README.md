# Personal Assistant

A burgundy personal workspace with a daily checklist, editable planner pages, notes, a project board, affirmations, and an optional AI thinking partner.

## Run locally

```sh
npm ci
npm run dev
```

The workspace uses browser storage on both localhost and deployed sites. Existing data under `personal-assistant-static-v1` is preserved. Data is specific to the device, browser, and site origin. Affirmations and mood preferences are stored separately. Workspace data is local. The optional Google Calendar connection uses your Google account directly, separately from workspace storage.

```sh
npm run build
npm run lint
```

## AI connection

Vercel runs `api/chat.js` as a server function. Add these environment variables to the desired Vercel deployment environment and redeploy:

- `OPENAI_API_KEY`: the server-side OpenAI key.
- `ASSISTANT_ACCESS_TOKEN`: a private workspace access code. The API stays disabled unless both settings exist.
- `OPENAI_MODEL` (optional): defaults to `gpt-4.1-mini`.

Choose **Ask assistant → Connect AI** and enter the workspace access code. It remains in memory for the current tab. Never put the OpenAI key in browser code or a `VITE_` variable. AI messages are sent to OpenAI only on submission; workspace context is excluded unless the user selects **Include my workspace**. The assistant offers text suggestions and does not claim to edit workspace items. Responses use `store: false` and are not persisted in the workspace.

The regular Vite development server does not run Vercel functions. Use a Vercel preview deployment or Vercel's development tooling to test the AI API. No AI credentials are committed, and live AI stays visibly disconnected until configured.

## Interactions

- Use the sidebar or `Cmd/Ctrl + K` to navigate and quickly create items.
- Daily tasks can be completed, reopened, and removed.
- The daily planner has timed activities with optional duration and notes. Choose every day or specific weekdays, with weekday/weekend shortcuts. Completion is tracked per calendar date in IST. Daily notes and weekly pages save explicitly; switching Daily/Weekly saves the current draft first. Untouched legacy time-only templates become a blank notes area; custom plans remain intact.
- Notes save edits on blur. Projects move between active, paused, and completed columns.
- Affirmations can be rotated, saved, and written in your own words.
- Focus sessions last 25 minutes and catch up after backgrounding the tab.
- Optional browser notifications cover saved reminders, scheduled activities, daily check-ins, timed Calendar events, focus completion, and water nudges. The app must remain open; background tabs may be throttled by the browser. Closing the app stops its reminder checks. This version does not have a server-side Web Push scheduler.

## Visual references

The original burgundy and cream palette is retained. Compact cards and controls were informed by [Inspora's project card](https://www.inspora.design/posts/project-card-component) and [workspace picker](https://www.inspora.design/posts/soft-glass-workspace-picker). The character artwork and animations are original SVG/CSS implementations with reduced-motion support.

## Google Calendar and notifications

Open **Calendar & reminders**. Google Calendar supports viewing the next two weeks on the primary calendar and creating or editing events. New events and edits have a review step. Recurring-event edits affect only the selected occurrence. Calendar event reminders can use Google’s defaults or a chosen popup time.

For Google setup:

1. Enable two-step verification if Google Cloud requires it before allowing console access.
2. Enable Google Calendar API in a Google Cloud project and configure the OAuth consent screen. For a personal test app, add your Google account as a test user.
3. Create a **Web application** OAuth client, with the exact stable app origin as an authorized JavaScript origin. Preview deployment origins change; use the stable Vercel branch address or the production address and authorize it explicitly.
4. Set the public `VITE_GOOGLE_CLIENT_ID` build environment variable and redeploy, or paste the public client ID into the app’s one-time connection settings. This is a public identifier, not an API key or client secret.
5. Choose **Connect Google Calendar** and approve the requested scope in Google.

The requested scope is `calendar.events.owned`. Google describes it as permission to view, create, change, and delete events on calendars the account owns; the app uses the primary calendar and provides create/edit controls. Calendar access tokens and event data remain in memory in the tab, are not stored in browser storage, and are not included in AI requests. Refreshing the page or token expiration requires reconnecting. Disconnect clears the local session and requests revocation from Google.

Notifications are opt-in per site origin. Choose **Enable notifications**, allow the browser prompt, and use **Send a test**. A small service worker displays notifications and returns users to the relevant workspace view. It does not cache calendar data or run scheduled tasks after the app closes. Google Calendar’s own reminders run through Google independently of this app. Reminder checks use a 15-minute catch-up window and remember delivered IDs per origin to avoid repeat alerts. Notification categories can be switched off separately.

References: [Google token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model), [Calendar scopes](https://developers.google.com/workspace/calendar/api/auth), [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API).

## Food & movement

A separate local food diary supports breakfast, lunch, dinner and snacks, with dated logs and editable ingredient weights. The recipe book starts with 12 recipes, permits custom recipes and labelled foods, and scales ingredient quantities and nutrients by recipe yield and chosen servings. Saved ingredient data can be reused in search. Totals include energy, protein, carbs, fat, fibre, sugar, sodium, calcium, iron, potassium and vitamin C. Missing values stay unknown and partial totals are marked. The starter catalog contains rounded generic estimates per 100 g; actual preparation, brands, salt and cooking oil matter. It does not claim to include every food or nutrient.

Profiles support age, height, weight, equation sex, activity, diet, exclusions, cooking time, and workout preferences. Maintenance-energy estimates use Mifflin–St Jeor × an explicitly heuristic activity factor; macro starting split is 20% protein / 50% carbohydrate / 30% fat and fibre 14 g/1,000 kcal. No weight-loss deficit is applied. Automatic targets are limited to the supported generally healthy adult range (19–78 years and 1,200–5,000 calculated kcal); special health circumstances disable them. These are not medical prescriptions. Plans are deterministic recipe-based suggestions, not live AI. Missing recipe matches remain explicit gaps. Text-based exclusions do not guarantee allergen safety. Injuries or special health circumstances pause workout suggestions. Plans are saved snapshots; regenerate after changing preferences.

Data lives under `assistant-nutrition-v1`, independently of the existing workspace. JSON export is available. Nothing from the food diary/profile is added to AI context. Food search is local by default. To enable broader USDA search, set `USDA_API_KEY` as a server environment variable and redeploy. `/api/foods` without a query returns only availability; queries are length-limited, fixed to USDA's endpoint, have a timeout, hide upstream credentials, and successful responses are cached for an hour. USDA quotas still apply. The ordinary Vite server does not execute this optional function.

Validation: `node --test tests/*.test.js`, `npm run lint`, `npm run build`.

Sources: [USDA FoodData Central](https://fdc.nal.usda.gov/), [energy equation](https://pubmed.ncbi.nlm.nih.gov/2305711/), [USDA DRI calculator](https://www.nal.usda.gov/human-nutrition-and-food-safety/dri-calculator), [activity guidance](https://www.cdc.gov/physical-activity-basics/adding-adults/).

## Before opening Calendar to everyone

The public OAuth client ID is now included for new browsers; `VITE_GOOGLE_CLIENT_ID` overrides it. A client ID is not a secret. Each user must approve their own Google access and notification permission; one person's connection is never shared with another user.

**Google Cloud currently remains in Testing.** The configured test account works, but arbitrary accounts will be blocked until production consent is enabled, exact production origins are authorized, and any Google verification requirements are completed. Google controls approval. Use the deployed `/privacy.html` as the privacy notice and review it for your operating practices. Do not advertise unrestricted public Calendar access while the project is in Testing. Register the stable branch URL for preview and the final production/custom domain for release. Do not use a new immutable deployment URL for ongoing notification permissions.

This remains a browser-local app: no account sync or closed-app reminder backend. Live AI is optional and protected by a shared workspace code; before a broad public AI launch, replace that code with per-user authentication, persistent quotas and abuse controls. Do not expose an unrestricted paid AI endpoint. Built-in food logging, recipes, charts and recipe-based plans do not need AI keys.
