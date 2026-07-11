# ScopeGuard — AGENTS.md

## What this repo is

**ScopeGuard** — a freelancer scope-creep management tool (MVP phase).  
Next.js 14 + Supabase + Tailwind CSS + TypeScript.  
Single-user app: track contract deliverables vs out-of-scope requests.

## Current state

- **Phase**: MVP code complete, open-sourced as technical portfolio
- **All features free** — no payment, no Pro/Free tier, no project limits
- See `docs/product-decision.md` for the rationale on why this is not a paid product

## Architecture

```
app/           — Next.js App Router pages + API routes
components/    — React components (project-form, deliverable-list, etc.)
lib/
  actions/     — Server Actions (projects, deliverables, scope-requests, change-orders)
  supabase/    — Supabase client (server + browser)
types/         — TypeScript interfaces for all DB entities
contexts/      — AuthContext (user, profile, session)
```

## Key conventions

- **Chinese-first UI** — all copy is Simplified Chinese
- **Mobile-first responsive** — max-w-lg, touch-friendly
- **Writes via Server Actions, reads via direct supabase client** — all data mutations use `lib/actions/` Server Actions with Zod validation; data reads (`useEffect` + `supabase.from()`) happen directly in Client Components (no Server Components exist)
- **All pages are `'use client'`** — zero Server Components in the app

## Known issues (read before modifying)

- **`package.json` `next: ^14.2.0`** (NOT 15) — don't add Next.js 15 syntax (e.g. `params` as Promise).
- **`react: ^18.3.0`** (NOT 19).
- See `docs/review-report.md` for all known code quality issues.

## What NOT to do

- No package.json scripts to run (no dev/test/build until npm install)
- No Prisma, tRPC, Docker — not used
- No team features, no collaboration, no multi-role

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

## Middleware

- Protects `/dashboard/*` and `/projects/*` only — new private routes must be added to `middleware.ts` `config.matcher`
