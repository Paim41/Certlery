# Certlery

Certlery is a responsive certificate portfolio built with Next.js and TypeScript.
It includes an animated public gallery, env-backed admin authentication, and a
Telegram Bot API integration for live messages, sign-in alerts, and webhook commands.

## Run locally

Requirements:

- Node.js 22
- npm

```bash
npm install
copy .env.example .env.local
npm run dev
```

The landing page and public gallery work without external services. Admin access
requires the three `ADMIN_*` variables below. Telegram contact and bot controls
activate after the three `TELEGRAM_*` variables are configured.

## Admin authentication

Admin sessions are signed on the server and stored in an HTTP-only, SameSite cookie.
No username, password, or signing secret is sent to the browser bundle.

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` — use at least 12 characters
- `ADMIN_SESSION_SECRET` — use at least 32 random characters

The admin workspace is available at `/admin/login`. The retired `/demo`, `/signin`,
and `/dashboard` URLs now redirect into this protected flow.

## Telegram Bot API

Create a bot with BotFather, then configure:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`

Available endpoints:

- `GET /api/telegram` — safe connection status
- `POST /api/telegram` — validated website contact messages
- `POST /api/telegram/webhook` — secret-verified Telegram webhook
- `GET|POST /api/admin/telegram` — protected status, test, and webhook setup

After signing in, use **Connect webhook** in the admin toolbar. Supported bot
commands are `/status`, `/site`, and `/help`.

## Deploy to Vercel

Import the GitHub repository into Vercel or run:

```bash
npx vercel --prod
```

Set the environment variables above for the Production environment, then create a
new production deployment. `NEXT_PUBLIC_SITE_URL=https://certlery.vercel.app` is
recommended for canonical site behavior.

Optional Supabase variables can still be used by the existing certificate storage
routes:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Useful commands

- `npm run dev` — start the local Next.js server
- `npm run build` — create a production Next.js build
- `npm run lint` — run ESLint
- `npm test` — run the production build check
