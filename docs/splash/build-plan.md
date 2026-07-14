# Phase 1 Splash — Build Plan

> **Design approved (mid-fi).** Section layout, palette, and copy below reflect the approved mid-fidelity design. It is a direction, not a pixel spec — standardize spacing/type and improve details during build. Infrastructure, content model, and Sanity schema decisions remain valid.

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

## Rendering & dev tooling (decided)

- **Rich text:** `astro-portabletext` renders block fields (`aboutStatement`, `aboutSupport`, `resourcesSubcopy`). The yellow **highlight** is a `highlight` mark on those block fields, rendered via a custom mark component (`<mark>` with `--color-accent-yellow`).
- **Images:** `@sanity/image-url` builds `heroImage` / `whyJoinColumns[].image` URLs. Figma/Unsplash stand-ins are acceptable at launch (see launch gates).
- **Icons:** `astro-icon` + `@iconify-json/simple-icons` for the footer / Get Involved social icons.
- **Dev drafts:** dev fetches use a read token + `perspective: 'previewDrafts'` so Studio edits appear without publishing. The signed-cookie preview routes (`/api/preview`, `/api/disable-preview`) and Sanity Presentation tool are deferred to a later session (not part of this tracer bullet).
- **Seeding:** an idempotent `apps/studio` seed script (`@sanity/client`, `createOrReplace`, fixed IDs `splashPage` + `siteSettings`) writes the seed copy below; re-runnable and version-controlled.

## Splash page sections (build order)

Build in this order. Resources is last to keep momentum on higher-traffic sections first.

Each content section carries a hardcoded editorial **section marker** eyebrow: a `N°0X` number (structural, hardcoded) + an editable label (e.g. "Founding membership", "Why we exist", "Join", "Membership benefits", "Resources"). The hero also shows a hardcoded "Est. 2026 — National" marker.

0. **Announcement bar** — full-width orange bar above the nav. Toggleable + editable via `siteSettings` (`showAnnouncement`, `announcementText`, `announcementCtaLabel`, `announcementDestination`). Seed: "Founding membership is open — only 500 spots. Join today →".
1. **Nav** — left-aligned `Wordmark_1A.svg` + hardcoded tagline lockup "The National Disaster Survivors Association". Right side: "Why join" link (scrolls to `#membership-benefits`), "Resources" link (scrolls to `#resources`), and a filled-orange **Join** button. All three are visible at launch; the Join button scrolls to the on-page founding-member section (`joinDestination`, default `#join`). GIVE stays hidden via `showGive`. `resourcesDestination` / `joinDestination` in `siteSettings` let editors upgrade scroll targets to full-page URLs without a deploy.
2. **Hero** (`#join` targets section 4; hero id `#top`) — split serif headline: `heroHeadline` ("When things fall apart, we come") followed by `heroHeadlineAccent` ("together.") rendered orange italic, `heroSubcopy`, "Join today" (primary, → `joinDestination`) + "Why join Rebuild →" (secondary text link, → `#membership-benefits`). Full-height photo (Sanity image) with a yellow accent block behind its lower-left corner and an editable caption (`heroImageCaption`, default "Community, in action").
3. **Stats bar** — three-item band: value + label per item. Hardcoded for launch: "500 / Founding member spots", "Nationwide / Survivor-built network", "By & for / Disaster survivors". Keep "500" consistent with the announcement bar and founding CTA copy.
4. **About** (`#membership-benefits` is section 5; about id `#about`) — one large statement (`aboutStatement`, rich text) + one small supporting paragraph (`aboutSupport`). Highlighted phrases (e.g. "strength in numbers") use the yellow **highlight** mark.
5. **Founding Member CTA** (`#join`) — dark (`#1F1B17`) section. Editable headline (`foundingCtaHeadline`) + sub-copy (`foundingCtaSubcopy`) in the left column; the right column is the Solidarity Tech iframe (`act.rebuild.us/founding-member/embed`). The bordered card around the form in the design is the **ST-rendered** form (branded via the pasted Custom HTML brand CSS) — Astro builds **no** wrapper around the iframe.
6. **Why Join Rebuild Today?** (`#membership-benefits`) — three columns numbered `01`/`02`/`03` (numbers hardcoded by index), each with an image on top, title, and body. Column order and background color editor-controlled via `splashPage`.
7. **Resources** (`#resources`) — two-column layout on the cream (`#F1E9DD`) background (no separate section color / white card): left is heading + subcopy + intro copy with the "visit rebuild.us/resources" link (shown only when `resourcesPage.visible`); right is the guide list. Each guide card shows "Guide 0X · PDF" (number + `format`), a document icon (top-bar color rotates orange/sage/yellow by index, hardcoded), the title, and a "Download ↓" link shown only when a `file` is attached.
8. **Get Involved** — two-column layout: left column is custom (copy `getInvolvedCopy` + editable fine print + "Follow along" social icons). Right column is the Solidarity Tech iframe (`act.rebuild.us/join-form/embed`), which renders its own email/phone/subscribe form UI. Appears once, immediately above the footer.
9. **Footer** — dark (`#1F1B17`) background, `Wordmark_1A.svg` (large) + tagline lockup + "Join today →" button. Two link columns (visibility-controlled): **Get involved** (Donate → gated by `showGive`; Member Portal → `memberPortalPage`; Contact → `contactPage`) and **Explore** (Case Studies → `caseStudiesPage`; More Information → `aboutPage`; Privacy Policy → `privacyPage`). Bottom bar: "© 2026 Rebuild — The National Disaster Survivors Association" + "By & for survivors".

## Sanity content editing principle

**All visible copy is Sanity-editable by default.** Only hardcode text when explicitly noted (e.g. fixed structural labels, button attributes). When in doubt, add a field.

## Sanity `splashPage` fields (minimum)

Section eyebrow labels are editable strings (numbers are hardcoded). Add one string per section as needed, e.g. `foundingLabel`, `aboutLabel`, `joinLabel`, `benefitsLabel`, `resourcesLabel`.

| Field | Type | Used by |
|---|---|---|
| `heroImage` | image (+ alt) | Hero section |
| `heroHeadline` | string | Hero display text (leading, non-accent portion) |
| `heroHeadlineAccent` | string | Trailing accent phrase appended to the headline, rendered orange italic in the component (e.g. "together.") |
| `heroSubcopy` | string | Hero supporting line under the headline |
| `heroImageCaption` | string | Hero photo caption overlay (default "Community, in action") |
| `aboutStatement` | rich text | About section large statement (supports the yellow **highlight** mark) |
| `aboutSupport` | string / rich text | About section small supporting paragraph |
| `foundingCtaHeadline` | string | Founding Member CTA |
| `foundingCtaSubcopy` | string | Founding Member CTA |
| `whyJoinColumns` | array (items: title, body, image, backgroundColor enum). Reorderable; rendered as numbered 01/02/03 by index (numbers hardcoded). backgroundColor enum: `#F1E9DD` (cream), `#ECF278` (yellow), `#A7B795` (sage), `#F4552A` (orange), `#1F1B17` (ink). | Why Join section |
| `resourcesHeadline` | string | Resources section heading |
| `resourcesSubcopy` | string | Resources section subheading (supports the yellow **highlight** mark) |
| `resourcesLeftCopy` | string | Resources left column intro text (contains the "visit rebuild.us/resources" link) |
| `resourceItems` | array (items: `title` string, `format` string default "PDF", `file` optional Sanity file upload). "Guide 0X" number and rotating icon color are hardcoded by index; "Download ↓" renders only when a `file` is attached. | Resources right column guide list |
| `getInvolvedCopy` | string | Get Involved section left copy |
| `getInvolvedFinePrint` | string | Get Involved fine print (default "No spam — just resources and updates from the network."); "Follow along" label is hardcoded |

## `siteSettings` fields (Phase 1)

### Page visibility

Each page document has a `visible: boolean` field. When `false`, the page is suppressed and every nav, footer, and in-section link to it is hidden automatically. No separate per-link flags in `siteSettings`.

Phase 1 page documents and launch defaults:

| Sanity document | Route | `visible` at launch | Notes |
|---|---|---|---|
| `privacyPage` | `/privacy` | `true` | Full content Phase 1 |
| `resourcesPage` | `/resources` | `false` | Stub only (Phase 2 content). Controls the `/resources` route and the "visit rebuild.us/resources" inline link in the Resources section. Does NOT control the RESOURCES nav link (that links to the `#resources` scroll target and is always visible). |
| `aboutPage` | `/about` | `false` | Stub only. Controls the "More Information" footer link (maps to the About page). |
| `newsPage` | `/news` | `false` | Stub only. Not linked from the splash. |
| `contactPage` | `/contact` | `false` | Stub only. Controls the "Contact" footer link. |
| `caseStudiesPage` | `/case-studies` | `false` | Stub only. Controls the "Case Studies" footer link. |
| `memberPortalPage` | `/member-portal` | `false` | Stub only. Controls the "Member Portal" footer link. |

Stub documents contain only `title` and `visible` in Phase 1. Full content fields are added in Phase 2.

### `siteSettings` flags (non-page sections and buttons)

| Field | Controls | Default |
|---|---|---|
| `showAnnouncement` | Top announcement bar visibility | `true` |
| `announcementText` | Announcement bar message | "Founding membership is open — only 500 spots." |
| `announcementCtaLabel` | Announcement bar link label | "Join today →" |
| `announcementDestination` | Announcement bar link target | `#join` |
| `showGive` | "GIVE" nav button + "Donate" footer link | `false` |
| `joinDestination` | URL/hash the Join buttons (nav, hero, footer, announcement) link to | `#join` |
| `resourcesDestination` | URL/hash the Resources nav link scrolls to | `#resources` |

The nav **Join** button is visible at launch (it is the primary CTA and points to the on-page founding-member section via `joinDestination`). The old `showJoin` flag is retired — the Join button no longer targets a separate hidden `/join` page.

### Form embed URLs

- `foundingMemberFormSrc` — default `https://act.rebuild.us/founding-member/embed`
- `getInvolvedFormSrc` — default `https://act.rebuild.us/join-form/embed`

### Social media URLs (optional)

- `instagramUrl`, `facebookUrl`, `youtubeUrl` — optional string fields. Icon is suppressed when field is blank. Client provides values post-launch via Studio; no deploy required.

The `<script src="https://act.rebuild.us/embed/v1.js" async></script>` tag is hardcoded once in the base layout `<body>` end. Only the `src` is Sanity-editable; all other iframe attributes (`allow`, `style`, `title`) are structural and live in the Astro component.

### Form styling (ST-side only)

The ST embed is a **cross-origin iframe**; our Astro app cannot inject or override CSS inside it, and there is no theme URL parameter. All brand-matching of the form is done **on the Solidarity Tech side**, using the form builder's per-field `Style` (inline CSS), `Classes`, and `Label style` options, the `Custom HTML` field for arbitrary markup, and the ST website's global CSS/theme. Our Astro app does **not** build a decorative container/frame around the form — the iframe drops into the section flow and the ST-rendered form supplies its own branded appearance (background, padding, rounded card). The Figma "EMBEDDED FORM GOES HERE" rectangle (~916×468) marks the iframe slot, not a wrapper we build.

**Ownership split:** Pete owns the form's *visual styling* only. Form functionality (Stripe, conditional logic, email/text triggers, submission handling) is Paul's; broken form actions are out of scope for the styling work.

**Styling deliverable (copy-paste, not theme-builder):** rather than hand-editing the ST theme builder, we generate a single brand CSS stylesheet (brand tokens + fonts, targeting ST's rendered field classes) that Pete pastes into one `Custom HTML` field at the top of each form as a `<style>` block, plus a few per-field `Style` strings where needed. Prerequisite: the live ST form must exist so we can inspect its rendered DOM/class names before writing selectors. This generation happens in a later session.

## Static design assets (exported from Figma)

These are fixed brand elements — not Sanity fields. They live in `apps/web/public/images/` and are hardcoded in their components.

| Asset | Source | Used by |
|---|---|---|
| `Wordmark_1A.svg` (REBUILD wordmark) | `rebuild-brand-assets/` | Nav (left-aligned, with tagline lockup), Footer (large) |
| Instagram, Facebook, YouTube icons | `astro-icon` + `@iconify-json/simple-icons` | Footer, Get Involved |

The wordmark SVG copies to `apps/web/public/images/`. Social icons are rendered via the `astro-icon` component (no separate SVG files needed). The old `Group 92.svg` badge/stamp is **not used** in the new design — the hero uses a yellow accent block behind the photo instead of a stamp overlay.

## Sanity seed content

Initial copy for the `splashPage` document comes from `docs/claimready/../splash/../` — source: `~/Downloads/Rebuild Landing Page Review.pdf`. Use this verbatim; the Rebuild team will edit in Studio post-launch.

| Field | Seed value |
|---|---|
| `heroHeadline` | "When things fall apart, we come" |
| `heroHeadlineAccent` | "together." |
| `heroSubcopy` | "Rebuild is a national membership association built by and for survivors of hurricanes, floods, wildfires, tornadoes, and more." |
| `heroImageCaption` | "Community, in action" |
| `aboutStatement` | "We come together to share wisdom, advocate for our interests, and build a national network with the strength in numbers to eventually make full recovery for every survivor a reality." (highlight "strength in numbers") |
| `aboutSupport` | "We know what it takes to get back on your feet, and we're here to help. Rebuild exists so that no survivor has to go through this alone." |
| `foundingCtaHeadline` | "Join today to become one of the 500 Founding Members of Rebuild." |
| `foundingCtaSubcopy` | "Get first-look access to advice, training, news, and community benefits coming online later this year." |
| `whyJoinColumns[0].title` | "Build Community" |
| `whyJoinColumns[0].body` | "A growing network of survivors, leaders, and subject matter experts nationwide, so wherever disaster hits next, you're connected to people who've been there." |
| `whyJoinColumns[1].title` | "Get Advice" |
| `whyJoinColumns[1].body` | "A growing library of tools and resources to help you take on insurance claims, FEMA denials, and everything between, built by and for survivors. We also share hard to find news like detailed weather forecasts and updates on changes at FEMA." |
| `whyJoinColumns[2].title` | "Free Trainings" |
| `whyJoinColumns[2].body` | "Skills that put power back in your hands. Workshops on preparedness, response, leadership, and advocacy, led by survivors and experts who stick around after the cameras leave." |
| `resourcesHeadline` | "Resources" |
| `resourcesSubcopy` | "We know from direct experience just how broken the recovery system is — and how hard it is on survivors." (highlight "broken the recovery system") |
| `resourcesLeftCopy` | "Our resource guides are a starting point to help make the process easier. For more survivor resources, visit rebuild.us/resources." (the "rebuild.us/resources" link renders only when `resourcesPage.visible`) |
| `resourceItems` | "Applying for FEMA Assistance", "The Survivor's Guide to Mental Health", "Advocating for Yourself in an Insurance Dispute" (each `format` "PDF", `file` attached by client when ready) |
| `getInvolvedCopy` | "Not ready to become a founding member but want to stay in the loop?" |
| `getInvolvedFinePrint` | "No spam — just resources and updates from the network." |

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
| Solidarity Tech founding member form — build + functionality (Stripe, conditional logic, email/text triggers, submission handling) | Paul — embed URL confirmed (`act.rebuild.us/founding-member/embed`) |
| Test ST form flow end-to-end | Paul |
| Solidarity Tech form **visual styling** (brand CSS pasted into ST `Custom HTML` field) | Pete — requires Paul's live form to exist first so DOM/classes can be inspected |
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
