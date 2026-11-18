# Full site build (V2)

Working brief for the current development phase. The splash site (Phase 1) is
live; this phase builds the full site described by the V2 sitemap and wireframes.
The decision record is [ADR-0012](./adr/0012-static-full-site.md).

- **Launch:** week of 2026-12-02.
- **Scope:** new pages laid out per the V2 wireframes, styled with the existing
  design system ([`design-system.md`](./design-system.md)). Fully static, same
  stack as today. No login, backend, or database.
- **Status of this doc:** written 2026-11-18 from the Figma file as it stood that
  day. Figma is the source of truth for layout; re-fetch a node before building it.

## Design sources

Figma file: Rebuild - V2 (`EmtlSAPCMoFBiEl5noWHWZ`).

| What | Node | Link |
| --- | --- | --- |
| Sitemap | `1:11` | <https://www.figma.com/design/EmtlSAPCMoFBiEl5noWHWZ/Rebuild---V2?node-id=1-11> |
| Components (layout blocks) | `1:60` | <https://www.figma.com/design/EmtlSAPCMoFBiEl5noWHWZ/Rebuild---V2?node-id=1-60> |
| Wireframes (pages) | `1:480` | <https://www.figma.com/design/EmtlSAPCMoFBiEl5noWHWZ/Rebuild---V2?node-id=1-480> |

The wireframes are grayscale and set in a placeholder sans. They define page
structure, block order, and draft copy only. Color, type, radius, buttons, and
decorative patterns come from `design-system.md`, not from the wireframes.

## Sitemap

From the sitemap frame (`1:12`):

- **Homepage**
- **Rebuild Ready Network**
- **Get Help** (nav dropdown, no landing page): Resources, Membership Hub
- **Get Involved** (nav dropdown): Membership, Volunteer, Chapters & Partnerships, Donate
- **Newsroom**: Blog, Social Feed, Press
- **Footer links**: Privacy Policy, Terms & Conditions, Donor Policy & Disclosures,
  Accessibility, Merch Store

Navigation as drawn in the wireframes:

- **Nav bar:** "Rebuild" wordmark at left; Rebuild Ready Network, Get Help,
  Get Involved, Newsroom at right; a filled "Donate" button.
- **Footer:** dark band. Wordmark and social icons (Instagram, Facebook, X) at
  left. Link columns: *About Us* (Home, Rebuild Ready Network, Resources,
  Newsroom), *Get Involved* (Membership, Volunteer, Chapters & Partnerships,
  Donate), *For Members* (Membership Hub). Legal row: Privacy Policy, Terms &
  Conditions, Donor Policy & Disclosures, Accessibility, then a legal-entity
  paragraph and copyright line (both still placeholder copy).

## Pages

Routes for new pages are **proposed**, not final. Existing routes keep their URLs.

| # | Page | Wireframe node | Route | State today |
| --- | --- | --- | --- | --- |
| 01 | Home | `1:481` | `/` | Splash page lives here; to be replaced |
| 02 | The Rebuild Ready Network | `1:494` | `/network` (proposed) | New |
| 03 | Resources | `1:532` | `/resources` | Exists; restyle to wireframe |
| 04 | Membership Hub | `1:571` | `/membership-hub` (proposed) | New |
| 05 | Get Involved | `1:614` | `/get-involved` (proposed) | New |
| 06 | Newsroom | `1:580` | `/newsroom` (proposed) | New; frame is flagged "TO BE UPDATED" |
| 07 | News Archive | `1:710` | `/newsroom/archive` (proposed) | New |
| 07.1 | News Story | `1:746` | `/newsroom/<slug>` (proposed) | New |
| 8 | Privacy Policy | `1:633` | `/privacy` | Exists; move to utility-page layout |
| 9 | Terms of Use | `1:654` | `/terms` (proposed) | New |
| 10 | Donor Policy & Disclosures | `1:679` | `/donor-policy` (proposed) | New |
| 11 | Accessibility Statement | `1:699` | `/accessibility` (proposed) | New |

Unchanged: `/share/<slug>` (ADR-0011), `/404`, `/sitemap.xml`, `robots.txt`.

### Block order per page

Every page starts with the announcement bar and nav bar and ends with an Email
Signup block and the footer. Those four are omitted below.

- **Home:** Full-bleed Hero (6-6) → Currently Watching marquee → Headline with
  larger text block → 3-Up Photo Cards → Fundraising (6-6) → Resources Block →
  Full-bleed image → 3-Up Block.
- **Rebuild Ready Network:** Full-bleed image → Tagline marquee → Lockup (4-8)
  intro → Full-bleed image → 3-column stat lockup → Headline → Lockup (4-8)
  "Our Partners" → Partners list (Partner Cards grouped by category) → Lockup
  (4-8) "Join our network" → Full-bleed image.
- **Resources:** Secondary Page Hero → Tagline marquee → Resources Block (four
  guide sections of Resources Cards) → Full-bleed image.
- **Membership Hub:** Secondary Page Hero → Tagline marquee → three Membership
  Hub Cards (chapter membership, email preferences, recurring donations) →
  Full-bleed image.
- **Get Involved:** Full-bleed image → Tagline marquee → Secondary Page Hero →
  4-Up Photo Cards (Membership, Volunteer, Chapters & Partnerships, Donate) →
  then one Lockup (4-8) per topic, each followed by its own Email Signup,
  carousel, or image: Membership, Volunteer, Chapters & Partnerships (with a
  "Selected Partners" scrolling photo carousel), Donate.
- **Newsroom:** Secondary Page Hero → Tagline marquee → three rows of News
  Article Cards ("The Latest from Rebuild", "From Our Social Feed", "Press") →
  Full-bleed image.
- **News Archive:** Secondary Page Hero → Tagline marquee → paginated grid of
  News Article Cards (nine per page) with a "Back to the Newsroom" button →
  Full-bleed image.
- **News Story:** Full-bleed image → Currently Watching marquee → story header
  (title, category tag, date, byline) → rich body (headings, paragraphs, inline
  images, share links).
- **Utility pages** (Privacy, Terms, Donor Policy, Accessibility): Secondary
  Page Hero → Tagline marquee → stack of Utility Text Blocks (4-8: section title
  left, body right) → Lockup (4-8) "Contact Us" with a button → Full-bleed image.

## Layout blocks

The Figma "components" section is a set of grid-based layout blocks. Names below
are the Figma names; use them when naming new Astro components.

| Figma block | Node | Existing code to start from |
| --- | --- | --- |
| navigation bar | `1:61` | `components/Nav.astro` (needs new structure: left wordmark, dropdowns, Donate) |
| scrolling marquee (announcement bar and tagline band) | `1:395` | `components/sections/Announcement.astro` covers the announcement line and is wired to `siteSettings` fields, but no page renders it today. Tagline band is new |
| currently watching marquee | `1:72` | New |
| footer | `1:328` | `components/sections/Footer.astro` (needs link columns and legal row) |
| Button | `1:414` | `components/Button.astro` |
| 2x Column (6-6) - Full-bleed Hero | `1:81` | `components/sections/Hero.astro` is the closest |
| 1x Column (8-4) - Secondary Page Hero | `1:368` | Inline hero in `pages/resources.astro`; extract |
| 1x Column (12) - Full-bleed img | `1:365` | New |
| 2x Column (4-8) Lockup | `1:102` | New |
| 2x Column (4-8) Lockup - Stacked Small | `1:428` | New; not used in any wireframe yet |
| 2x Column (4-8) Lockup - Utility Pages | `1:301` | New |
| 2x Column (4-8) - Utility Text Block | `1:307` | `pages/privacy.astro` renders the same content as one rich-text column |
| 3x Column (4-4-4) Lockup | `1:312` | `components/sections/Stats.astro` is the closest |
| 1x Column (1-10-1) - Headline | `1:322` | `components/sections/About.astro` is the closest |
| 1x Column (1-10-1) - Headline Larger Text Block | `1:325` | Same |
| 3-Up Block | `1:110` | New |
| 3-Up Block - Photo Cards | `1:130` | New |
| 4-Up Block - Photo Cards | `1:153` | New |
| 3-Up Block - Scrolling Photo Carousel | `1:182` | New |
| 2-Column (6-6) - What We Stand For | `1:208` | New; not used in any wireframe yet |
| 2-Column (6-6) - Fundraising | `1:260` | New |
| 2x Column (6-1-5) - Email Signup | `1:371` | `components/sections/GetInvolved.astro` (Solidarity Tech iframe embed) |
| Resources Block / Resources Card | `1:439` / `1:387` | `components/sections/WrittenGuides.astro` already renders this card grid |
| 3x Column (4-4-4) - Membership Hub / Membership Hub Card | `1:399` / `1:406` | New |
| News Article Card | `1:416` | New |
| Partner Card | `1:472` | New |

## Constraints that carry over

- **Static only** (ADR-0012). Forms stay Solidarity Tech embeds; payments stay
  Fundraise Up. Membership Hub cards are links to those systems.
- **Design system** (ADR-0004, `design-system.md`). Tokens, `ty-*` type scale,
  5px radius, and the Button variants are unchanged.
- **Canonical origin** is `https://www.rebuild.us` (ADR-0010). New routes need
  canonical tags and entries in `pages/sitemap.xml.ts`.
- **UTM pass-through** (ADR-0009) works for any page that uses `BaseLayout.astro`
  and marks Solidarity Tech iframes with `data-st-embed`.
- **Spanish** (ADR-0008). Existing pages have `/es/` twins fed by `*Es` fields.
  `test/spanish-routes.test.mjs` asserts the route pairs and must be extended when
  routes are added.
- **Schema changes** need a Studio redeploy (see `AGENTS.md`).

## Sanity content today

Production holds `siteSettings`, the `splashPage`, `privacyPage`, and
`resourcesPage` singletons, 16 guides, 3 videos, and 7 share pages. It also holds
five placeholder singletons from the earlier information architecture, all with
`visible: false` and only a title: `aboutPage`, `newsPage`, `contactPage`,
`caseStudiesPage`, `memberPortalPage`. None of them matches a page in the V2
sitemap by name. Decide per type whether to repurpose or retire it when building
the page that replaces it.

New content the wireframes imply, not yet modeled: partners (logo, name, state,
category), news articles (title, category tag, date, byline, hero image, rich
body), the "currently watching" list, three more utility pages, and page copy for
Home, Network, Get Involved, Membership Hub, and Newsroom. Record each modeling
decision as an ADR.

## Open questions

1. **Spanish for new pages.** The wireframes are English only. Does every new
   page launch with an `/es/` twin, and is the language switch kept in the nav
   and footer (neither wireframe shows it)?
2. **Founding-member flow.** The Home wireframe replaces the splash. Does the
   founding-member signup with the Fundraise Up handoff (ADR-0005) survive, and
   where? Where does the nav "Donate" button go?
3. **Which Solidarity Tech form backs each Email Signup block.** The wireframes
   draw native Email / phone / ZIP fields under different headings (membership,
   volunteer newsletter, "Stay up to date"). Today there are two embeds.
4. **Get Involved structure.** The sitemap lists Membership, Volunteer, Chapters
   & Partnerships, and Donate as dropdown children; the wireframe is one page with
   four sections. Anchors on one page, or separate pages?
5. **Newsroom.** The frame is flagged "TO BE UPDATED". The sitemap says Blog,
   Social Feed, Press; the wireframe says Latest, Social Feed, Press. The source of
   the social feed is undefined.
6. **Resources videos.** The Resources wireframe has no Video Library. The live
   page has one, with 3 videos.
7. **Membership Hub link targets.** Exact Solidarity Tech and Fundraise Up URLs
   for the three cards.
8. **Footer legal copy and organization name.** The wireframe footer reads
   "© Organizing Resilience, 2026" with bracketed placeholders and "pending
   counsel review". The live footer reads "© 2026 Rebuild — The National Disaster
   Survivors Association".
9. **Merch Store.** In the sitemap's footer links, absent from the wireframe
   footer.
10. **Terms naming.** "Terms & Conditions" in the sitemap and footer, "Terms of
    Use" on the wireframe page.
11. **Photography.** Every image in the wireframes is a placeholder.
