# Phase 1 — Splash Page Scope

- Figma: https://www.figma.com/design/LC4ZJUQYVgnoGltxEuElHN/Rebuild-Splash?node-id=1-2
- Deployment: replaces rebuild.us (WordPress/Pantheon retired on launch)
- Stack: static Astro + Vercel (see ADR-0001)

## Page structure

Single long-scroll page. No sub-routes at launch except a Privacy Policy stub.

| Section | Notes |
|---|---|
| Nav | Centered REBUILD wordmark only. All links (RESOURCES, ABOUT, NEWS) and buttons (JOIN, GIVE) hidden via Sanity `siteSettings` visibility flags. |
| Hero | Full-width photo, yellow (#eaf261) accent block, "When things fall apart, we come together." display text, REBUILD badge/stamp overlay. |
| About | Two-column body copy introducing the association. |
| Founding Member CTA | "Join today to become one of the 500 Founding Members." headline + Solidarity Tech form embed (see below). |
| Why Join Rebuild Today? | Three-column: Build Community (orange bg), Get Advice (blue bg), Free Trainings. Each has a circular photo, yellow badge headline, body copy. |
| Resources teaser | Dark (#1c1b19) full-width section, "Resources" heading, one-paragraph description. |
| Coming Soon | Two-column: left is association mission copy; right describes upcoming member benefits with a static link to claimreadyapp.com. |
| Newsletter signup (x2) | Email input + SUBSCRIBE button. Integration TBD — stubbed as a static component for now. |
| Footer | Dark (#1c1b19) background, large REBUILD wordmark, two columns of footer links (visibility Sanity-controlled). |

## Nav and footer link visibility

All nav and footer links are controlled by boolean visibility flags in the Sanity
`siteSettings` document. At Phase 1 launch, all nav links and most footer links
are hidden. The Sanity Studio is scaffolded from Phase 1 for this reason.

## Solidarity Tech form embed

The founding-member signup form is a Solidarity Tech iframe hosted at
`act.rebuild.us`. Drop-in embed:

```html
<iframe
  data-st-embed
  src="https://act.rebuild.us/join-form/embed"
  allow="payment *"
  style="width:100%;border:none;min-height:500px;"
  title="Join Form"
></iframe>
<script src="https://act.rebuild.us/embed/v1.js" async></script>
```

No server-side handling required. The embed loads and submits entirely via
Solidarity Tech's infrastructure.

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
| `--color-accent-yellow` | `#eaf261` | Hero block, badge backgrounds |
| `--color-accent-orange` | `#fd683e` | CTAs, column backgrounds |
| `--color-accent-blue` | `#dbf1fe` | Column backgrounds |
| `--color-accent-maroon` | `#3c222d` | Subscribe button |

## Out of scope for Phase 1

- User auth (Clerk)
- Neon database
- ClaimReady integration (static link only)
- Action Network integration
- Solidarity Tech API sync
- CMS-driven content pages (News, Resources, About, etc.)
- Separate route pages beyond Privacy Policy stub
