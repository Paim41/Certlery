<div align="center">

<img width="1231" height="409" alt="image" src="https://github.com/user-attachments/assets/35cf0165-0f71-4ead-a0f8-ec8921a356ab" />


# 🏆 Certlery
**A certificate management and portfolio showcase platform — admin-isolated certificates, profile management, and a public gallery.**

Manage certificates under your own admin account and present them in a polished, shareable portfolio gallery. Built with Next.js, TypeScript, and Supabase.

[![Live Demo](https://img.shields.io/badge/OPEN%20APP-Live%20Demo-1B2A4A?style=for-the-badge)](https://certlery.vercel.app/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-C9A227?style=for-the-badge)](https://certlery.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Next.js-0F1729?style=for-the-badge)](https://certlery.vercel.app/)
[![Type](https://img.shields.io/badge/Type-Certificate%20Portfolio-1A1A1D?style=for-the-badge)](https://certlery.vercel.app/)

</div>

---

## About

Certlery is a **certificate management and portfolio platform** built to let an admin manage their own certificates and present them publicly in a clean, showcase-ready gallery.

Certificates are scoped to the admin account that owns them, so management stays isolated and private, while an admin profile and gallery view presents the finished credentials to visitors. It's built on Next.js and TypeScript on the front end, with Supabase handling data and migrations on the back end.

> **Heads up:** this repo is a **fully functional template**, not a hosted product. The certificate management workflow, admin isolation, and Supabase schema are complete and working, you just need to connect your own Supabase project (via `.env.example`) before you can create a real admin account and manage your own certificates.

---

## App Flow

```
Admin Sign-In            →  Authenticated, admin-scoped session
    ↓
Manage Certificates        →  Add, edit, and organize certificates under your account
    ↓
Admin-Isolated Data          →  Certificates and profile data scoped to the owning admin
    ↓
Public Gallery                 →  Certificates presented in a showcase-style portfolio view
    ↓
Supabase Backend                 →  PostgreSQL storage, migrations, and auth
```

---

## Features

- **Certificate Management Workflow** — Add, organize, and maintain certificates from an admin dashboard
- **Admin-Isolated Certificates** — Each admin account manages and sees only its own certificates
- **Admin Profile & Gallery Management** — A dedicated profile view alongside a public-facing certificate gallery
- **Showcase Branding** — A polished, portfolio-style presentation layer for displaying certificates publicly
- **Supabase-Backed Data Layer** — PostgreSQL storage with tracked migrations under `supabase/migrations`
- **Type-Safe Throughout** — Built with TypeScript across the app, lib, and types layers

---

## Built For

```
Purpose  → Personal certificate management and public credential showcase
Backend  → Supabase (PostgreSQL, Auth)
Frontend → Next.js, TypeScript
Status   → Full-function template — bring your own Supabase project
Not For  → Multi-tenant SaaS certificate issuance or verification services
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js, TypeScript |
| Database & Backend | Supabase (PostgreSQL) |
| Styling | CSS |
| Linting | ESLint |
| Deployment | Vercel |

---

## Project Structure

```
Certlery/
├── app/                    Application routes and pages
├── lib/                    Shared logic and Supabase client utilities
├── public/                 Static assets
├── supabase/migrations/    Database schema and migrations
├── types/                  TypeScript type definitions
├── .env.example            Environment variable template
├── proxy.ts
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── package.json
└── README.md
```

---

## Setup Guide

**This is where you turn the template into your own working app.**

1. Clone the repo and install dependencies:
   ```
   git clone https://github.com/Paim41/Certlery.git
   cd Certlery
   npm install
   ```
2. Create a free project at [supabase.com](https://supabase.com)
3. Copy `.env.example` to `.env.local` and fill in your project's values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Apply the SQL migrations under `supabase/migrations/` via the Supabase CLI or the SQL editor to create the required tables
5. Start the dev server:
   ```
   npm run dev
   ```
6. Open `http://localhost:3000`, create your admin account, and start managing certificates

---

## Development

```
npm install
npm run dev
```

## Production Build

```
npm run build
npm run start
```

## Deploy

```
1. Push this repo to your own Git provider
2. Import it into Vercel
3. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as environment variables
4. Deploy
```

---

## Roadmap / Ideas

- [ ] Shareable public certificate links per admin
- [ ] Certificate expiry tracking and reminders
- [ ] Multiple gallery themes/layouts
- [ ] PDF export of the full certificate portfolio
- [ ] Multi-admin roles beyond single-owner isolation

---

<div align="center">

*Certlery — manage your certificates, showcase your credentials.*

[certlery.vercel.app](https://certlery.vercel.app/)

</div>
