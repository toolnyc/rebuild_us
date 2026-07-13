# Phase 1 Splash — Build Plan

> **Design in progress.** The client rejected the current Figma. Section layout and visual details below are provisional until a new Figma is approved. Infrastructure, content model, and Sanity schema decisions remain valid.

## Goal

Ship the splash page at rebuild.us, replacing the current WordPress/Pantheon site. Targets the founding-member audience for the July 15 welcome call and beyond.

## What we build

| Item | Notes |
|---|---|
| pnpm monorepo scaffold | `apps/web` (Astro), `apps/studio` (Sanity). Sanity project is provisioned during scaffolding (not deferred to launch). Dev runs against a live Sanity dataset from day one. |
| Tailwind CSS v4 config | Brand tokens: colors, font stacks. Font files already in `apps/web/public/fonts/`. |
| Sanity Studio | Studio deployed to Sanity hosting. Sidebar organized via structure builder into two groups: **Settings** (`siteSettings`) and **Pages** (all page documents). Astro dev server uses `perspective: "previewDrafts"` so Studio edits are visible immediately without publishing. |
| `index.astro` splash page | All sections below, in order |
| `/privacy` route | Sanity `privacyPage` singleton (rich text body). Placeholder copy at launch; client fills in real legal copy via Studio without a deploy. |
| `/api/preview` + `/api/disable-preview` | SSR routes (Vercel adapter). Enable Sanity draft-preview mode via a signed secret cookie. Used by Sanity Studio's Presentation tool. |
| Vercel deploy | Hybrid mode (SSG default + SSR preview routes). Rebuilt on Sanity publish via webhook → Vercel deploy hook. Net new project — must be created before deploy. See setup steps below. |

## Splash page sections (build order)

Build in this order. Resources is last to keep momentum on higher-traffic sections first.

1. **Nav** — centered `Wordmark_1A.svg`; RESOURCES link (visible at launch — scrolls to `#resources` section); JOIN button (orange border, hidden at launch via `showJoin`); ABOUT/NEWS links (hidden via page visibility); GIVE button (hidden via `showGive`). `resourcesDestination` and `joinDestination` in `siteSettings` let editors upgrade scroll targets to full-page URLs without a deploy.
2. **Hero** — full-width photo (Sanity image field), yellow accent block, split headline, `Group 92.svg` badge/stamp overlay.
3. **About** — two-column copy block. Both text blocks editable via `splashPage`.
4. **Founding Member CTA** — headline + sub-copy (Sanity) + Solidarity Tech iframe embed (`act.rebuild.us/founding-member/embed`).
5. **Why Join Rebuild Today?** — three columns, order and background color editor-controlled. Photos + copy editable via `splashPage`.
6. **Resources** — yellow (`#ecf278`) background. White card with resource list. See Resources section in splashPage fields. `resourcesPage.visible` controls the "visit rebuild.us/resources" link.
7. **Get Involved** — two-column layout: left column is custom (copy + social icons, editable via `splashPage`); right column is the Solidarity Tech iframe (`act.rebuild.us/join-form/embed`), which renders its own email/phone/subscribe form UI. Appears once, immediately above the footer.
8. **Footer** — dark (`#1c1b19`) background, `Wordmark_1A.svg` (large), two link columns visibility-controlled via page documents.

## Sanity content editing principle

**All visible copy is Sanity-editable by default.** Only hardcode text when explicitly noted (e.g. fixed structural labels, button attributes). When in doubt, add a field.

## Sanity `splashPage` fields (minimum)

| Field | Type | Used by |
|---|---|---|
| `heroImage` | image | Hero section |
| `heroHeadline` | string | Hero display text |
| `aboutLeft` | rich text | About left column |
| `aboutRight` | rich text | About right column |
| `foundingCtaHeadline` | string | Founding Member CTA |
| `foundingCtaSubcopy` | string | Founding Member CTA |
| `whyJoinColumns` | array (items: title, body, image, backgroundColor enum). Reorderable. backgroundColor enum: `#fffffc`, `#ecf278`, `#b7c1ad`, `#fd683e`, `#1c1b19`. Column headline badge background is always `#ecf278` (hardcoded, not editor-controlled). | Why Join section |
| `resourcesHeadline` | string | Resources section heading |
| `resourcesSubcopy` | string | Resources section centered subheading |
| `resourcesLeftCopy` | string | Resources card left column intro text |
| `resourceItems` | array (items: `title` string only). Document icon is a fixed asset. | Resources card right column list |
| `getInvolvedCopy` | string | Get Involved section left copy |

## `siteSettings` fields (Phase 1)

### Page visibility

Each page document has a `visible: boolean` field. When `false`, the page is suppressed and every nav, footer, and in-section link to it is hidden automatically. No separate per-link flags in `siteSettings`.

Phase 1 page documents and launch defaults:

| Sanity document | Route | `visible` at launch | Notes |
|---|---|---|---|
| `privacyPage` | `/privacy` | `true` | Full content Phase 1 |
| `resourcesPage` | `/resources` | `false` | Stub only (Phase 2 content). Controls the `/resources` route and the "visit rebuild.us/resources" inline link in the Resources section. Does NOT control the RESOURCES nav link (that links to the `#resources` scroll target and is always visible). |
| `aboutPage` | `/about` | `false` | Stub only |
| `newsPage` | `/news` | `false` | Stub only |
| `contactPage` | `/contact` | `false` | Stub only |
| `caseStudiesPage` | `/case-studies` | `false` | Stub only |
| `memberPortalPage` | `/member-portal` | `false` | Stub only |
| `joinPage` | `/join` | `false` | Stub only — JOIN nav button links here when `showJoin: true` |

Stub documents contain only `title` and `visible` in Phase 1. Full content fields are added in Phase 2.

### `siteSettings` flags (non-page sections and buttons)

| Field | Controls | Default |
|---|---|---|
| `showJoin` | "JOIN" nav button | `false` |
| `showGive` | "GIVE" nav button + "Donate" footer link | `false` |
| `joinDestination` | URL/hash the JOIN button links to | `#founding-member` |
| `resourcesDestination` | URL/hash the RESOURCES nav link scrolls to | `#resources` |

### Form embed URLs

- `foundingMemberFormSrc` — default `https://act.rebuild.us/founding-member/embed`
- `getInvolvedFormSrc` — default `https://act.rebuild.us/join-form/embed`

### Social media URLs (optional)

- `instagramUrl`, `facebookUrl`, `youtubeUrl` — optional string fields. Icon is suppressed when field is blank. Client provides values post-launch via Studio; no deploy required.

The `<script src="https://act.rebuild.us/embed/v1.js" async></script>` tag is hardcoded once in the base layout `<body>` end. Only the `src` is Sanity-editable; all other iframe attributes (`allow`, `style`, `title`) are structural and live in the Astro component.

## Static design assets (exported from Figma)

These are fixed brand elements — not Sanity fields. They live in `apps/web/public/images/` and are hardcoded in their components.

| Asset | Source | Used by |
|---|---|---|
| `Group 92.svg` (REBUILD badge/stamp) | `rebuild-brand-assets/` | Hero overlay |
| `Wordmark_1A.svg` (REBUILD wordmark) | `rebuild-brand-assets/` | Nav, Footer |
| Instagram, Facebook, YouTube icons | `astro-icon` + `@iconify-json/simple-icons` | Footer, Get Involved |

Both SVG files copy to `apps/web/public/images/`. Social icons are rendered via the `astro-icon` component (no separate SVG files needed).

## Sanity seed content

Initial copy for the `splashPage` document comes from `docs/claimready/../splash/../` — source: `~/Downloads/Rebuild Landing Page Review.pdf`. Use this verbatim; the Rebuild team will edit in Studio post-launch.

| Field | Seed value |
|---|---|
| `heroHeadline` | "When things fall apart, we come together." |
| `aboutLeft` | "Rebuild is a national membership association built by and for survivors of hurricanes, floods, wildfires, tornadoes, and more." |
| `aboutRight` | "We come together to share wisdom, advocate for our interests, and build a national network with the strength in numbers to eventually make full recovery for every survivor a reality.\n\nWe know what it takes to get back on your feet, and we're here to help. Rebuild exists so that no survivor has to go through this alone." |
| `foundingCtaHeadline` | "Join today to become one of the 500 Founding Members of Rebuild." |
| `foundingCtaSubcopy` | "Get first-look access to advice, training, news, and community benefits coming online later this year." |
| `whyJoinColumns[0].title` | "Build Community" |
| `whyJoinColumns[0].body` | "A growing network of survivors, leaders, and subject matter experts nationwide, so wherever disaster hits next, you're connected to people who've been there." |
| `whyJoinColumns[1].title` | "Get Advice" |
| `whyJoinColumns[1].body` | "A growing library of tools and resources to help you take on insurance claims, FEMA denials, and everything between, built by and for survivors. We also share hard to find news like detailed weather forecasts and updates on changes at FEMA." |
| `whyJoinColumns[2].title` | "Free Trainings" |
| `whyJoinColumns[2].body` | "Skills that put power back in your hands. Workshops on preparedness, response, leadership, and advocacy, led by survivors and experts who stick around after the cameras leave." |
| `resourcesHeadline` | "Resources" |
| `resourcesSubcopy` | "We know from direct experience just how broken the recovery system is — and how hard it is on survivors." |
| `resourcesLeftCopy` | "Our resource guides are a starting point to help make the process easier" |
| `resourceItems` | "Applying for FEMA Assistance", "The Survivor's Guide to Mental Health", "Advocating for Yourself in an Insurance Dispute" |
| `getInvolvedCopy` | "Not ready to become a founding member but want to stay in the loop? Sign up here:" |

## One-time setup (before first deploy)

These must be completed before the site can go live. They are not part of the code build but are required infrastructure.

1. **Sanity project** — create under Pete's account; invite client (newworld.inc) as editors. Studio deployed to Sanity hosting.
2. **Vercel project** — create net new under Pete's Vercel account, connect to the monorepo (`apps/web` as the root), add `rebuild.us` custom domain.
3. **Vercel deploy hook** — generate in Vercel project settings; paste URL into Sanity webhook config.
4. **Sanity webhook** — in the Sanity project dashboard, add a webhook that fires on document publish and POSTs to the Vercel deploy hook URL.
5. **DNS cutover** — update `rebuild.us` A/CNAME records in GoDaddy to point to Vercel (replaces WordPress/Pantheon). Pete has GoDaddy access.
6. **Environment variables** — added to Vercel project settings:
   - `SANITY_PROJECT_ID`, `SANITY_DATASET`
   - `SANITY_API_TOKEN` — viewer-role token for fetching draft content in preview mode
   - `SANITY_PREVIEW_SECRET` — random string shared between Studio and the `/api/preview` route

## External dependencies (not our job)

| Item | Owner |
|---|---|
| Solidarity Tech founding member form (Stripe, conditional logic, email/text triggers) | Paul — embed URL confirmed (`act.rebuild.us/founding-member/embed`) |
| Test ST form flow end-to-end | Paul |
| Social media account URLs (Instagram, Facebook, YouTube) | Client — added to `siteSettings`; icons suppressed until populated |
| `rebuild.us/foundingmember` shortlink | Client (newworld.inc) |
| `donate.rebuild.us` URL | TBD — confirm it is live before launch; GIVE button in nav links to it (currently hidden via `showGive` flag, so not a hard blocker) |
| Privacy policy copy | Client |

## Launch gates

The site cannot go live until all of these are green:

- [ ] Sanity Studio deployed + initial `siteSettings` and `splashPage` documents published
- [ ] Solidarity Tech founding member form tested and embed URL confirmed
- [ ] Hero and Why Join photos uploaded to Sanity dataset (Figma/Unsplash stand-ins acceptable at launch; client replaces via Studio)
- [ ] Resources section copy and resource item titles entered in Sanity `splashPage` document

## Out of scope

See `docs/splash/scope.md` for the full out-of-scope list. Key items: user auth, Neon, ClaimReady integration, CMS content pages, `/resources` route.
