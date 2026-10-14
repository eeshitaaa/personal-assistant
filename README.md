# Personal Assistant

A burgundy personal workspace with a daily checklist, editable planner pages, notes, a project board, affirmations, and an optional AI thinking partner.

## Run locally

```sh
npm ci
npm run dev
```

The workspace uses browser storage on both localhost and deployed sites. Existing data under `personal-assistant-static-v1` is preserved. Data is specific to the device, browser, and site origin. Affirmations and mood preferences are stored separately. No account or cloud sync is configured.

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
- Planner pages save explicitly; switching Daily/Weekly saves the current draft first.
- Notes save edits on blur. Projects move between active, paused, and completed columns.
- Affirmations can be rotated, saved, and written in your own words.
- Focus sessions last 25 minutes and catch up after backgrounding the tab.
- Water nudges appear in the open app between 8am and 10pm IST; they are not push notifications.

## Visual references

The original burgundy and cream palette is retained. Compact cards and controls were informed by [Inspora's project card](https://www.inspora.design/posts/project-card-component) and [workspace picker](https://www.inspora.design/posts/soft-glass-workspace-picker). The character artwork and animations are original SVG/CSS implementations with reduced-motion support.
