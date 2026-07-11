# ScopeGuard — AGENTS.md

## What this repo is

**ScopeGuard** — a freelancer scope-creep management tool (MVP phase).  
Next.js 14 + Supabase + Tailwind CSS + TypeScript.  
Single-user SaaS: track contract deliverables vs out-of-scope requests.

## Current state

- **Phase**: MVP code complete → ready for deployment
- **45 source files** across app/, components/, lib/, types/
- **No npm install / build / test commands exist yet** — don't look for them
- **Pricing**: Free (2 projects) / Pro $4/mo or ¥19/mo
- **Payment**: Lemon Squeezy (MoR, handles global tax)

## Architecture

```
app/           — Next.js App Router pages + API routes
components/    — React components (project-form, deliverable-list, etc.)
lib/
  actions/     — Server Actions (projects, deliverables, scope-requests, change-orders)
  supabase/    — Supabase client (server + browser)
  lemonsqueezy.ts — Lemon Squeezy checkout helpers
types/         — TypeScript interfaces for all DB entities
contexts/      — AuthContext (user, profile, session)
```

## Key conventions

- **Chinese-first UI** — all copy is Simplified Chinese
- **Mobile-first responsive** — max-w-lg, touch-friendly
- **Writes via Server Actions, reads via direct supabase client** — all data mutations use `lib/actions/` Server Actions with Zod validation; data reads (`useEffect` + `supabase.from()`) happen directly in Client Components (no Server Components exist)
- **All pages are `'use client'`** — zero Server Components in the app
- **Freemium gate** enforced server-side in actions (free plan → 2 active project limit)
- **Payment** via Lemon Squeezy Checkout (URL redirect), webhook updates profile.plan
- **Customer 0.6% fee route** → needs WeChat mini-program (requires 个体工商户 registration)

## Known issues (read before modifying)

- **Dead dependency**: `@supabase/auth-helpers-nextjs` in package.json — no code imports it, only `@supabase/ssr` is used. Remove when convenient.
- **Stale Supabase package `auth-helpers-nextjs`**: see `docs/review-report.md` for all known code quality issues.
- **`package.json` `next: ^14.2.0`** (NOT 15) — don't add Next.js 15 syntax (e.g. `params` as Promise).
- **`react: ^18.3.0`** (NOT 19).

## What NOT to do

- No package.json scripts to run (no dev/test/build until npm install)
- No Prisma, tRPC, Docker — not used
- No team features, no collaboration, no multi-role

## Deployment

- **Platform**: Vercel (zero-config)
- **Middleware protects** `/dashboard/*` and `/projects/*` only — new private routes must be added to `middleware.ts` `config.matcher`
- **Required env vars**:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_LS_PRO_MONTHLY_VARIANT_ID`, `NEXT_PUBLIC_LS_PRO_YEARLY_VARIANT_ID`
