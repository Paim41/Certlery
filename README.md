# Certlery

Certlery is a responsive certificate-management workspace and public credential
portfolio built with Next.js, TypeScript, Tailwind CSS, Supabase, and Lucide.

## Run locally

Requirements:

- Node.js 22
- npm

```bash
npm install
copy .env.example .env.local
npm run dev
```

The landing page, public profile, and interactive dashboard demo work without a
Supabase project. Real accounts, persistent certificate metadata, and private
file uploads activate when the Supabase environment values are configured.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_certlery.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Add the Project URL and Publishable Key from the Supabase Connect dialog.
5. Add the deployed `/auth/callback` URL to the Supabase Auth redirect allowlist.
6. Enable Google in Supabase Auth if Google sign-in is required.

The migration creates the certificate tables, private storage bucket, indexes,
and row-level security policies. Each authenticated user can only modify their
own records and files.

## Deploy to Vercel

Import the GitHub repository into Vercel or run:

```bash
npx vercel --prod
```

For the full authenticated application, set these environment variables in the
Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

The project uses the standard Next.js build output expected by Vercel.

## Useful commands

- `npm run dev` — start the local Next.js server
- `npm run build` — create a production Next.js build
- `npm run lint` — run ESLint
- `npm test` — run the production build check
