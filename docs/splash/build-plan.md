# Phase 1 Splash — Build Plan

## Goal

Ship the splash page at rebuild.us, replacing the current WordPress/Pantheon site. Targets the founding-member audience for the July 15 welcome call and beyond.

## What we build

| Item | Notes |
|---|---|
| pnpm monorepo scaffold | `apps/web` (Astro), `apps/studio` (Sanity) |
| Tailwind CSS v4 config | Brand tokens: colors, font stacks. Font files already in `apps/web/public/fonts/`. |
| Sanity Studio | Two Phase 1 singletons: `siteSettings` (nav/footer flags) and `splashPage` (all copy + images). Studio deployed to Sanity hosting. |
| `index.astro` splash page | All sections below, in order |
| `/privacy` route | Stub with placeholder text; no existing page to pull from |
| Vercel deploy | Static. Rebuilt on Sanity publish via webhook → Vercel deploy hook. |

## Splash page sections (build order)

Build in this order. Resources is last because design is still in progress.

1. **Nav** — centered REBUILD wordmark; JOIN + GIVE buttons; RESOURCES/ABOUT/NEWS links. All links/buttons hidden at launch via `siteSettings` visibility flags.
2. **Hero** — full-width photo (Sanity image field), yellow accent block, split headline, REBUILD badge stamp.
3. **About** — two-column copy block. Both text blocks editable via `splashPage`.
4. **Founding Member CTA** — headline + sub-copy (Sanity) + Solidarity Tech iframe embed (founding member form, configured by Paul).
5. **Why Join Rebuild Today?** — three-column (Build Community, Get Advice, Free Trainings). Photos + copy editable via `splashPage`.
6. **Coming Soon** — two-column: left copy + right copy with `claimreadyapp.com` link. Copy editable via `splashPage`. Can be hidden or removed later via `siteSettings` flag.
7. **Get Involved** — Solidarity Tech iframe embed at `https://act.rebuild.us/join-rebuild`. Prompt: "Not ready to become a founding member but want to stay in the loop?" Appears twice (matching Figma). Social icons (Instagram, Facebook, YouTube) with placeholder URLs until client provides.
8. **Footer** — dark bg, large REBUILD wordmark, two link columns. All links visibility-controlled via `siteSettings`.
9. **Resources** — **Build last.** Design still in progress. Scope: at minimum a teaser section; may include 3 resource thumbnails + "Want more?" copy. Implement whatever design is locked when reached.

## Sanity `splashPage` fields (minimum)

| Field | Type | Used by |
|---|---|---|
| `heroImage` | image | Hero section |
| `heroHeadline` | string | Hero display text |
| `aboutLeft` | rich text | About left column |
| `aboutRight` | rich text | About right column |
| `foundingCtaHeadline` | string | Founding Member CTA |
| `foundingCtaSubcopy` | string | Founding Member CTA |
| `whyJoinColumns` | array (3 items: title, body, image) | Why Join section |
| `comingSoonLeft` | rich text | Coming Soon left column |
| `comingSoonRight` | rich text | Coming Soon right column |
| `resourcesSection` | rich text / TBD | Resources (design pending) |
| `getInvolvedHeadline` | string | Get Involved section |

## `siteSettings` visibility flags (Phase 1)

All `false` at launch:

- `showNavResources`, `showNavAbout`, `showNavNews`
- `showNavJoin`, `showNavGive`
- `showComingSoon` (allows hiding the Coming Soon section without a deploy)
- Footer link flags (Donate, Privacy Policy, Contact, Case Studies, Member Portal, More Information)

## External dependencies (not our job)

| Item | Owner |
|---|---|
| Solidarity Tech founding member form (Stripe, conditional logic, email/text triggers) | Paul |
| Test ST form flow end-to-end | Paul |
| Social media account URLs (Instagram, Facebook, YouTube) | Client |
| `rebuild.us/foundingmember` shortlink | Client (newworld.inc) |
| Privacy policy copy | Client |

## Launch gates

The site cannot go live until all of these are green:

- [ ] Sanity Studio deployed + initial `siteSettings` and `splashPage` documents published
- [ ] Solidarity Tech founding member form tested and embed URL confirmed
- [ ] Hero and Why Join photos confirmed (using Figma/Unsplash originals until client provides replacements)
- [ ] Resources section design locked (or section hidden pending design)

## Out of scope

See `docs/splash/scope.md` for the full out-of-scope list. Key items: user auth, Neon, ClaimReady integration, CMS content pages, `/resources` route.
