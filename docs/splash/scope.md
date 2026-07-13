# Phase 1 — Splash Page Scope

> **Design approved (mid-fi).** Colors, layout, and section structure below reflect the approved mid-fidelity design (a direction, not a pixel spec). Content model and copy decisions remain valid. See `build-plan.md` for the authoritative section breakdown and Sanity fields.

- Deployment: replaces rebuild.us (WordPress/Pantheon retired on launch)
- Stack: static Astro + Vercel (see ADR-0001)

## Page structure

Single long-scroll page. One sub-route at launch: `/privacy` (Privacy Policy). No existing privacy policy found at rebuild.us; a stub with placeholder text ships at launch.

Each content section carries a `N°0X` marker eyebrow (number hardcoded, label editable). Full field-level detail lives in `build-plan.md`.

| Section | Notes |
|---|---|
| Announcement bar | Full-width orange bar above the nav. Toggleable + editable via `siteSettings`. Seed: "Founding membership is open — only 500 spots. Join today →". |
| Nav | Left-aligned `Wordmark_1A.svg` + hardcoded "The National Disaster Survivors Association" tagline lockup. Right side: "Why join" + "Resources" links + filled-orange **Join** button, all visible at launch. GIVE hidden via `showGive`. |
| Hero | Split serif headline "When things fall apart, we come *together*." + subcopy + "Join today" / "Why join Rebuild →" CTAs. Full-height photo with a yellow (`#ECF278`) accent block behind its lower-left corner and an editable caption. Marker: "Est. 2026 — National". |
| Stats bar | Three-item band (hardcoded): "500 / Founding member spots", "Nationwide / Survivor-built network", "By & for / Disaster survivors". |
| About | One large statement + one small supporting paragraph. Highlighted phrases use the yellow highlight mark. |
| Founding Member CTA | Dark (`#1F1B17`) section. "Join today to become one of the 500 Founding Members." headline + Solidarity Tech form embed (see below). The form's card is ST-rendered (branded via Custom HTML); Astro builds no wrapper. |
| Why Join Rebuild Today? | Three columns numbered 01/02/03, each with an image on top, title, and body. Column order and background color editor-controlled. Available background colors: `#F1E9DD` (cream), `#ECF278` (yellow), `#A7B795` (sage), `#F4552A` (orange), `#1F1B17` (ink). |
| Resources | Two-column layout on the cream background (no separate section color / card): left is heading + subcopy + intro copy with the `rebuild.us/resources` link (shown only when `resourcesPage.visible`); right is a list of 3 guide cards ("Guide 0X · PDF" + document icon + title + "Download ↓" when a file is attached). Build last. |
| Get Involved | Solidarity Tech iframe embed at `https://act.rebuild.us/join-form/embed`. Prompt: "Not ready to become a founding member but want to stay in the loop?" + fine print + "Follow along" social icons. Appears once on the page, immediately above the footer. Same embed pattern as the founding-member form. |
| Footer | Dark (`#1F1B17`) background, `Wordmark_1A.svg` (large) + tagline lockup + "Join today →" button. Two link columns (visibility Sanity-controlled): **Get involved** (Donate, Member Portal, Contact) and **Explore** (Case Studies, More Information, Privacy Policy). Bottom bar: copyright + "By & for survivors". |

## Nav and footer link visibility

All nav and footer links are controlled by boolean visibility flags in the Sanity
`siteSettings` document. At Phase 1 launch, all nav links and most footer links
are hidden. The Sanity Studio is scaffolded from Phase 1 for this reason.

## Solidarity Tech form embeds

Both forms are Solidarity Tech iframes hosted at `act.rebuild.us`. No server-side
handling required; each loads and submits entirely via Solidarity Tech's
infrastructure.

**Founding Member form** (Founding Member CTA section):

```html
<iframe data-st-embed src="https://act.rebuild.us/founding-member/embed" allow="payment *" style="width:100%;border:none;min-height:500px;" title="Become a Founding Member"></iframe>
<script src="https://act.rebuild.us/embed/v1.js" async></script>
```

**Get Involved form** (Get Involved section, appears once, above the footer):

```html
<iframe data-st-embed src="https://act.rebuild.us/join-form/embed" allow="payment *" style="width:100%;border:none;min-height:500px;" title="Join Form"></iframe>
<script src="https://act.rebuild.us/embed/v1.js" async></script>
```

Both use the same `embed/v1.js` script tag. If both appear on the same page,
include the `<script>` tag only once (e.g. in the page `<head>` or at the end of
`<body>`).

## Brand identity assets

All brand identity marks are rendered as exported SVG assets, never as font-rendered text. This applies to the wordmark and any other logo elements. SVG files live in `apps/web/public/images/`. (The old `Group 92.svg` badge/stamp is not used in the new design.)

## Fonts

| Role | Family | Files |
|---|---|---|
| Display / wordmark | New Burns Trial | `NewBurnsTrial-Regular.otf` |
| Body | Armand Grotesk Test | `ArmandGroteskTest-{Regular,Bold,SemiBold,SemiLight,Light}.otf` |
| UI (nav, buttons) | Helvetica Neue | System font; no file needed |

Font files live in `apps/web/public/fonts/`. CSS custom properties:
- `--font-display`: New Burns Trial, serif fallback
- `--font-body`: Armand Grotesk Test, sans-serif fallback
- `--font-ui`: Helvetica Neue, system-ui fallback

## Brand colors

Palette adopted from the approved mid-fi design (exact rendered values). The old `blue` and `maroon` tokens are dropped — they do not appear in the new design (the subscribe/CTA buttons are orange).

| Token | Hex | Usage |
|---|---|---|
| `--color-cream` | `#F1E9DD` | Page background |
| `--color-ink` | `#1F1B17` | Text, nav/footer + dark sections (single dark) |
| `--color-muted` | `#6B655C` | Secondary / supporting text |
| `--color-white` | `#FFFFFF` | Cards, reversed text on dark |
| `--color-accent-yellow` | `#ECF278` | Hero accent block, highlight mark, column backgrounds |
| `--color-accent-orange` | `#F4552A` | CTAs, announcement bar, column backgrounds |
| `--color-accent-sage` | `#A7B795` | Column backgrounds |

## Out of scope for Phase 1

- User auth (Clerk)
- Neon database
- ClaimReady integration (static link only)
- Action Network integration
- Solidarity Tech API sync
- CMS-driven content pages (News, Resources, About, etc.)
- `/resources` route — no separate resources page at launch; only the resources section on the splash page
- Separate route pages beyond Privacy Policy stub
