# Phase 1 — Splash Page Scope

> **Design in progress.** The client rejected the current Figma. Visual design decisions in this document (colors, layout, section structure) are provisional until a new Figma is approved. Content model and copy decisions remain valid.

- Figma: https://www.figma.com/design/LC4ZJUQYVgnoGltxEuElHN/Rebuild-Splash?node-id=4-2
- Deployment: replaces rebuild.us (WordPress/Pantheon retired on launch)
- Stack: static Astro + Vercel (see ADR-0001)

## Page structure

Single long-scroll page. One sub-route at launch: `/privacy` (Privacy Policy). No existing privacy policy found at rebuild.us; a stub with placeholder text ships at launch.

| Section | Notes |
|---|---|
| Nav | Centered `Wordmark_1A.svg` asset. All links (RESOURCES, ABOUT, NEWS) and buttons (JOIN, GIVE) hidden via Sanity `siteSettings` visibility flags. |
| Hero | Full-width photo, yellow (`#ecf278`) accent block — Figma shows `#eaf261`, use the canonical token. "When things fall apart, we come together." display text, `Group 92.svg` badge/stamp overlay. |
| About | Two-column body copy introducing the association. |
| Founding Member CTA | "Join today to become one of the 500 Founding Members." headline + Solidarity Tech form embed (see below). |
| Why Join Rebuild Today? | Three columns, each with a circular photo, yellow badge headline, and body copy. Column order and background color are editor-controlled in Sanity. Available background colors: `#fffffc` (white), `#ecf278` (yellow), `#b7c1ad` (sage), `#fd683e` (orange), `#1c1b19` (black). |
| Resources | Yellow (`#ecf278`) background. Centered heading + subheading. White card with two columns: left is intro copy + `rebuild.us/resources` link (link hidden at launch via `showResourcesPageLink` flag); right is a list of 3 resource items, each with a fixed document icon and a title. Resource item titles are Sanity-editable. Figma node `4:167`. Build last. |
| Get Involved | Solidarity Tech iframe embed at `https://act.rebuild.us/join-form/embed`. Prompt: "Not ready to become a founding member but want to stay in the loop?" Appears once on the page, immediately above the footer. Same embed pattern as the founding-member form. |
| Footer | Dark (`#1c1b19`) background, `Wordmark_1A.svg` asset (large), two columns of footer links (visibility Sanity-controlled). |

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

**Get Involved form** (Get Involved section, appears twice):

```html
<iframe data-st-embed src="https://act.rebuild.us/join-form/embed" allow="payment *" style="width:100%;border:none;min-height:500px;" title="Join Form"></iframe>
<script src="https://act.rebuild.us/embed/v1.js" async></script>
```

Both use the same `embed/v1.js` script tag. If both appear on the same page,
include the `<script>` tag only once (e.g. in the page `<head>` or at the end of
`<body>`).

## Brand identity assets

All brand identity marks are rendered as exported SVG assets, never as font-rendered text. This applies to the wordmark, badge/stamp, and any other logo elements. SVG files live in `apps/web/public/images/`.

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

| Token | Hex | Usage |
|---|---|---|
| `--color-background` | `#fffffc` | Page background |
| `--color-black` | `#1c1b19` | Nav/footer background, dark sections |
| `--color-text` | `#18191b` | Body text |
| `--color-accent-yellow` | `#ecf278` | Hero block, badge backgrounds |
| `--color-accent-orange` | `#fd683e` | CTAs, column backgrounds |
| `--color-accent-sage` | `#b7c1ad` | Column backgrounds |
| `--color-accent-blue` | `#dbf1fe` | Column backgrounds |
| `--color-accent-maroon` | `#3c222d` | Subscribe button |

## Out of scope for Phase 1

- User auth (Clerk)
- Neon database
- ClaimReady integration (static link only)
- Action Network integration
- Solidarity Tech API sync
- CMS-driven content pages (News, Resources, About, etc.)
- `/resources` route — no separate resources page at launch; only the resources section on the splash page
- Separate route pages beyond Privacy Policy stub
