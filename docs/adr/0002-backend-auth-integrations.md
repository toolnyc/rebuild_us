# 0002 - Backend, Auth, Database, and Integration Architecture

- Status: Accepted
- Date: 2026-07-13

## Context

The ClaimReady meeting (2026-06-30) confirmed that Phase 2 of rebuild.us requires
authenticated users, a server-side API proxy, and a relational database. This
supersedes the "fully static, no backend" summary from ADR-0001 for everything
beyond the Phase 1 splash page. The questions blocking this ADR were recorded in
`docs/claimready/meeting-questions.md`; the answers are captured below.

## ClaimReady meeting outcomes

- **Auth required:** ClaimReady requires the partner to authenticate members
  before initiating a scan. rebuild.us must have real user accounts.
- **Scan pricing:** rebuild.us has a wholesale agreement covering 1,000 free
  scans. After that, users pay directly through ClaimReady's Stripe-hosted flow.
- **Post-loss use:** The scan is usable both pre-loss and post-loss, making it
  relevant to rebuild.us's core audience.
- **ClaimReady as "Coming Soon":** The integration ships in a later phase. The
  Phase 1 splash page references ClaimReady only as a static link.

## Decisions

### Auth — Clerk

- **Provider:** Clerk (phone/email OTP as the primary sign-in method).
- **Plan:** Hobby (free) covers up to 50,000 monthly retained users. Pro ($25/mo)
  adds MFA and passkeys when production hardening is needed.
- **MRU model:** Clerk bills monthly retained users (not MAU), so bounce traffic
  is free. At 60% retention, 100K sign-ups cost ~$225/mo on Pro.
- **SMS OTP:** Metered at $0.01/SMS on all plans including Hobby.
- **Data portability:** Full user-data export (including password hashes) is
  available on every plan; no lock-in.

### Database — Neon Postgres

- **Provider:** Neon, via Vercel's native Postgres integration.
- **Rationale:** Serverless Postgres with scales-to-zero pricing; zero-config
  connection string injection from Vercel; no persistent connection overhead for
  serverless functions.
- **Scope:** Relational user/membership data, ClaimReady scan quota tracking,
  Solidarity Tech CRM sync records, and any association-owned data not suited to
  Sanity's document model.
- **Sanity is not a substitute:** Sanity is the content/document store for
  editorial data. Neon holds transactional and relational data.

### ORM — Drizzle

- **Library:** Drizzle ORM with the Neon serverless driver (`@neondatabase/serverless`).
- **Rationale:** TypeScript-first schema (no separate `.prisma` file), SQL-like
  query builder, no connection-pooler config required for serverless environments.
  Schema lives in `apps/web/src/db/schema.ts`.

### Backend runtime — Astro hybrid mode + Vercel adapter

- **Mode:** Astro hybrid (SSG default, per-route SSR opt-in via
  `export const prerender = false`).
- **Adapter:** `@astrojs/vercel`.
- **Server routes:** Only `/api/*` Astro endpoints run server-side. All content
  pages remain static.
- **ClaimReady proxy:** `/api/claimready/*` holds the Bearer API key
  server-side, accepts/temporarily stores the policy PDF, and runs the
  submit-and-poll flow. The PDF is stored in Vercel Blob and deleted immediately
  after the scan completes (~60s).

### Solidarity Tech — CRM and forms

- **Role:** Primary CRM for member data and the founding-member signup form.
- **Phase 1 (splash):** Iframe embed from `act.rebuild.us` (no server-side
  handling; fully static).
- **Phase 2:** API integration for bidirectional member data sync between
  Solidarity Tech and Neon.
- **Custom domain:** `act.rebuild.us` is the Solidarity Tech instance domain.

### Action Network

- **Status:** TBD — likely used for email/SMS broadcast. Confirm before Phase 2
  scaffolding. Not required for Phase 1.

## Consequences

- The site transitions from fully static to hybrid at Phase 2, but the CDN
  advantage is preserved for all content pages.
- Clerk + Neon + Solidarity Tech creates three sources of member truth; a sync
  strategy (Clerk as identity anchor, Neon as relational store, ST as CRM) must
  be designed before Phase 2 member-facing features are built.
- PDF PII handling requires a deletion-after-scan policy enforced in the
  ClaimReady proxy route and tested explicitly.
- The 1,000 free scan quota must be tracked in Neon; enforce server-side before
  calling the ClaimReady API.
