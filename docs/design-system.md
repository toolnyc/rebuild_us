# Rebuild Design System

The canonical, reusable design system for rebuild.us. This is the single source of
truth for brand fonts, color tokens, radius, the type scale, and the shared
component layer. Rationale and the decisions behind the overhaul live in
[ADR-0004](./adr/0004-design-system-overhaul.md); this file is the living catalog.

> **Status:** specification. The tokens, `@font-face` rules, component specs, and the
> Solidarity Tech `<style>` block below are the approved target. They are documented
> here first; applying them to `apps/web/src/styles/global.css`, the components, and
> the live ST HTML is a separate implementation task.

Design source: Figma — Rebuild Splash
([palette](https://www.figma.com/design/LC4ZJUQYVgnoGltxEuElHN/Rebuild-Splash?node-id=34-167),
[typography](https://www.figma.com/design/LC4ZJUQYVgnoGltxEuElHN/Rebuild-Splash?node-id=34-146),
[splash](https://www.figma.com/design/LC4ZJUQYVgnoGltxEuElHN/Rebuild-Splash?node-id=34-174)).

---

## 1. Fonts

Three brand typefaces. New Burns Trial, Armand Grotesk, and Helvetica Neue are
**retired** on the main site.

| Role | Family | Weights shipped |
| --- | --- | --- |
| Headlines / subheads | **Instrument Serif** | Regular (400), Italic (400) |
| Body + buttons/CTAs | **Basis Grotesque Pro** | Light (300), Regular (400), Medium (500), Bold (700), Italic (400) |
| Eyebrows / labels / meta | **Basis Grotesque Mono Pro** | **Bold (700) only** |

> **Constraint:** Basis Grotesque Mono Pro ships **Bold only** (no regular weight).
> The mono face is therefore used only where a heavy weight is correct — uppercase
> eyebrows/labels. Small meta captions use Basis Grotesque Pro Regular instead (see
> `ty-caption` below), so meta text is not forced bold.

### Font files

Place these in `apps/web/public/fonts/` (source files are in `~/Downloads`). Remove
the retired `ArmandGroteskTest-*.otf` and `NewBurnsTrial-Regular.otf`.

```
InstrumentSerif-Regular.ttf
InstrumentSerif-Italic.ttf
BasisGrotesquePro-Lt.otf        → Light 300
BasisGrotesquePro.otf           → Regular 400
BasisGrotesquePro-Italic.otf    → Regular 400 italic
BasisGrotesquePro-Md.otf        → Medium 500
BasisGrotesquePro-Bold.otf      → Bold 700
BasisGrotesqueMonoPro-Bd.otf    → Bold 700
```

### `@font-face`

```css
@font-face {
  font-family: "Instrument Serif";
  src: url("/fonts/InstrumentSerif-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Instrument Serif";
  src: url("/fonts/InstrumentSerif-Italic.ttf") format("truetype");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: "Basis Grotesque Pro";
  src: url("/fonts/BasisGrotesquePro-Lt.otf") format("opentype");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Basis Grotesque Pro";
  src: url("/fonts/BasisGrotesquePro.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Basis Grotesque Pro";
  src: url("/fonts/BasisGrotesquePro-Italic.otf") format("opentype");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: "Basis Grotesque Pro";
  src: url("/fonts/BasisGrotesquePro-Md.otf") format("opentype");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Basis Grotesque Pro";
  src: url("/fonts/BasisGrotesquePro-Bold.otf") format("opentype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Basis Grotesque Mono Pro";
  src: url("/fonts/BasisGrotesqueMonoPro-Bd.otf") format("opentype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

---

## 2. Color tokens

The palette frame (Figma node 34-167) is the source of truth. Splash-mock drifts
(`#B7C1AD`, `#FF5C29`, pure `#000000`, and the various near-blacks) are **not**
canonical and collapse into the tokens below. Cream `#F1E9DD` is retired.

| Token | Hex | Role |
| --- | --- | --- |
| `--color-white` | `#FFFFFC` | Page background; text on dark surfaces |
| `--color-ink` | `#1C1B19` | Body text **and** dark surfaces (nav/footer/dark sections) |
| `--color-muted` | `#6B655C` | Secondary / meta text (reads on white) |
| `--color-accent-yellow` | `#EAF261` | Highlight bands, marker fills |
| `--color-accent-sage` | `#B5C1AB` | Section bands, muted surfaces, stat labels on dark |
| `--color-accent-orange` | `#FD683E` | Primary action, focus ring, resource-card border, emphasis marks |
| `--color-accent-blue` | `#DBF1FE` | Insurance guide-section accent only |

Contrast notes: `--color-ink` on `--color-white` and `--color-white` on
`--color-ink` both clear WCAG AA. Orange `#FD683E` is an **action/decoration** color,
not a text color on white (fails AA for body text); use ink for text.

**Discard these Figma drifts** (appear in the Figma mock but are not canonical):
`#FF5C29` → use `--color-accent-orange #FD683E`; `#B7C1AD` → use `--color-accent-sage #B5C1AB`.

---

## 3. Radius

Single radius token. Reverses the previous strictly-square stance (see ADR-0004).

| Token | Value | Applies to |
| --- | --- | --- |
| `--radius` | `5px` | Buttons, cards, inputs, image frames |

Hairline dividers and full-width section bands stay square (no radius). The old
global `border-radius: 0 !important` reset is removed.

---

## 4. Type scale

Keep the eight existing `ty-*` utility names (components already consume them);
repoint them to the new fonts and sizes. Sizes use `clamp()` so one token is
responsive without `lg:` variants.

| Utility | Family | Size (clamp min → max) | Line-height | Notes |
| --- | --- | --- | --- | --- |
| `ty-display` | Instrument Serif | `clamp(2.5rem, 6vw + 1rem, 5.625rem)` (40 → 90px) | 1.02 | Hero headline |
| `ty-h1` | Instrument Serif | `clamp(2rem, 4vw + 1rem, 4.375rem)` (32 → 70px) | 1.05 | Major section headline |
| `ty-h2` | Instrument Serif | `clamp(1.75rem, 3vw + 1rem, 3.4375rem)` (28 → 55px) | 1.1 | Section heading |
| `ty-h3` | Basis Grotesque Pro **Bold** | `clamp(1.375rem, 1.5vw + 0.75rem, 1.875rem)` (22 → 30px) | 1.15 | Card / sub titles — **sans, not serif** |
| `ty-lead` | Basis Grotesque Pro | `clamp(1.125rem, 1vw + 0.5rem, 1.375rem)` (18 → 22px) | 1.36 | Intro / lead paragraph |
| `ty-body` | Basis Grotesque Pro | `1.125rem` (18px) | 1.55 | Default body |
| `ty-eyebrow` | Basis Grotesque Mono Pro Bold | `0.875rem` (14px) | 1.4 | UPPERCASE label, `letter-spacing: 0.04em` |
| `ty-caption` | Basis Grotesque Pro | `0.9375rem` (15px) | 1.45 | Meta / caption (Pro, not mono — see font constraint) |

### Emphasis convention

Inline emphasis in serif headings is **Instrument Serif italic only** — same ink
color, no orange. The previous italic + orange treatment is dropped.

```html
<h1 class="ty-display">When things fall apart, we come <em>together.</em></h1>
```

`em` inside a serif heading inherits Instrument Serif and renders italic; do not add
a color class.

---

## 5. `global.css` token block (spec)

Copy-ready target for `apps/web/src/styles/global.css` (Tailwind v4). `@font-face`
rules from §1 go at the bottom of the file (omitted here for brevity).

```css
@import "tailwindcss";

@theme {
  --color-white: #fffffc;
  --color-ink: #1c1b19;
  --color-muted: #6b655c;
  --color-accent-yellow: #eaf261;
  --color-accent-sage: #b5c1ab;
  --color-accent-orange: #fd683e;
  --color-accent-blue: #dbf1fe;

  --radius: 5px;

  --font-display: "Instrument Serif", Georgia, serif;
  --font-body: "Basis Grotesque Pro", system-ui, sans-serif;
  --font-mono: "Basis Grotesque Mono Pro", ui-monospace, monospace;
}

body {
  background-color: var(--color-white);
  color: var(--color-ink);
  font-family: var(--font-body);
}

@utility ty-display {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw + 1rem, 5.625rem);
  line-height: 1.02;
  letter-spacing: -0.01em;
}
@utility ty-h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw + 1rem, 4.375rem);
  line-height: 1.05;
}
@utility ty-h2 {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw + 1rem, 3.4375rem);
  line-height: 1.1;
}
@utility ty-h3 {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(1.375rem, 1.5vw + 0.75rem, 1.875rem);
  line-height: 1.15;
}
@utility ty-lead {
  font-family: var(--font-body);
  font-size: clamp(1.125rem, 1vw + 0.5rem, 1.375rem);
  line-height: 1.36;
}
@utility ty-body {
  font-family: var(--font-body);
  font-size: 1.125rem;
  line-height: 1.55;
}
@utility ty-eyebrow {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
@utility ty-caption {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 0.9375rem;
  line-height: 1.45;
}

/* Links: one main (orange, underlined), one alt (inherits, orange on hover) */
.link-main {
  font-family: var(--font-body);
  font-weight: 700;
  color: var(--color-accent-orange);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.2s;
}
.link-main:hover { opacity: 0.7; }
.link-alt { font-family: var(--font-body); transition: color 0.2s; }
.link-alt:hover { color: var(--color-accent-orange); }
```

> Note: the previous global `*{ border-radius: 0 !important }` reset is **removed**.
> Apply `--radius` per component instead.

---

## 6. Components

Canonical primitives. Page sections (`Hero`, `WhyJoin`, `Resources`, …) are
**compositions** of these; they should not restyle elements ad hoc.

### Button

`5px` radius, Basis Grotesque Pro Bold, no rounded-pill. Variants:

| Variant | Fill | Border | Text |
| --- | --- | --- | --- |
| `primary` | `--color-accent-orange` | none | `--color-white` |
| `outline` | transparent | 1px `--color-ink` | `--color-ink`; hover → ink fill, white text |
| `dark` | `--color-ink` | none | `--color-white` |
| `small` | outline in `--color-accent-orange`, ~14px mono/sans label | 2px orange | orange (e.g. nav "Join", "Sign up", "Download") |

Sizes: `sm` / `base` / `lg` (padding scale). Primary is the default CTA
("Join Rebuild", "Continue").

### Card

`5px` radius. Two documented shapes:

- **Resource card** — 2px `--color-accent-orange` border, image top, `ty-h3` title,
  a "Download" action with icon. Used in the Resources grid.
- **Feature card** — white surface, icon/graphic, `ty-h3` title, `ty-body` copy
  (e.g. "Build Community", "Get Advice", "Free Trainings").

### Field

Label-above input for embedded/native forms. `ty-body`/`ty-caption` label in
`--color-ink`, 1px `--color-ink` border, `5px` radius, white fill, `--color-muted`
placeholder, orange focus ring (`0 0 0 3px rgba(244,85,42,0.2)`).

### Eyebrow / SectionMarker

`ty-eyebrow` (Basis Mono Bold, uppercase). Orange (`RESOURCES`) or ink depending on
surface. Used as section kickers and nav labels.

### Stat

Instrument Serif value (`ty-h2`-ish, ~35px) over a small label. On dark surfaces the
label uses `--color-accent-sage` (e.g. "500 / Founding Member Spots",
"Nationwide / Survivor-Built Network").

### Logo / Nav / Footer

- **Logo** — `REBUILD★` wordmark lockup ("Rebuild — The National Disaster Survivors
  Association"); black on light, white on dark. Hardcoded, not editor-controlled.
- **Nav** — centered logo; right-aligned outline "Join" button; left eyebrow label.
- **Footer** — dark `--color-ink` band, white text, link columns, wordmark.

### GuideSection card

Used on the Resources page to group guide rows within a sub-section. `5px` radius,
`2px solid --color-accent-sage` border, white fill. Contains a `ty-h2` sub-section
heading followed by a list of Guide rows. Laid out in a `2×2` grid
(`grid-cols-1 lg:grid-cols-2`); two rows render four sub-sections in document order
(Disaster Tipsheets → For Survivors → FEMA & Government → Insurance).

### Document icon

Inline SVG used as the leading icon in a Guide row. Proportions ~51×67px (scalable).
Structure: rounded-`5px` body in `--color-white` with a narrow colored top strip
(the section's accent color) and three simulated gray text lines below.
The accent color maps to the section:

| Section | Accent token |
| --- | --- |
| `disaster-tipsheets` | `--color-accent-orange` |
| `survivors-communities` | `--color-accent-yellow` |
| `fema-government` | `--color-accent-sage` |
| `insurance` | `--color-accent-blue` |

### Guide row

An `<a>` wrapping the entire row (Document icon + title). The anchor's `href` is
`fileUrl` from Sanity; it opens the PDF. Title uses `ty-h3` (Basis Grotesque Pro
Bold). No separate "Download" link.

### Decorative patterns (not components)

- **Section bands** — full-width square blocks in yellow / sage / orange separating
  sections.
- **Arrow / polygon accents** — directional marks pointing to CTAs and headings.

Document as reusable patterns/utilities, not as first-class components.

---

## 7. Solidarity Tech form parity

The two ST forms (`act.rebuild.us/founding-member/embed`, `/join-form/embed`) are
cross-origin iframes styled from ST's **Website → Settings → Site-wide HTML Head
Content**. See [`splash/solidarity-tech-form-styling.md`](./splash/solidarity-tech-form-styling.md)
for the full selector inventory; the current live block is
[`splash/solidarity-tech-form-styles.html`](./splash/solidarity-tech-form-styles.html).

**Changes for the overhaul:**

1. **Font → Basis Grotesque Pro** via `@font-face` (replaces Helvetica Neue). Because
   the embed is a different origin (`act.rebuild.us`), the font files must be served
   from a **public, CORS-enabled URL** under a web-font license that permits it.
   Confirm licensing + CORS before shipping — this is the one gate on this change.
2. **Single light theme.** White `#FFFFFC` surface, `#1C1B19` text, `#6B655C` hints,
   black-bordered white inputs, orange `#FD683E` primary/focus. **Remove** the dark
   `:has(.multipage)` founding-form treatment entirely (the new splash renders the
   donation stepper on a light surface).
3. **Radius 5px** everywhere (buttons, inputs, cards, step badges), replacing the
   `border-radius: 0 !important` square rule.
4. New hex values throughout (`--cream`/`--ink`/`--orange` vars in the block update to
   `#fffffc` / `#1c1b19` / `#fd683e`; `--yellow #eaf261`, `--sage #b5c1ab`).

**`@font-face` to prepend to the ST `<style>` block** (only if licensing/CORS clears;
otherwise keep Helvetica Neue as fallback):

```css
@font-face {
  font-family: "Basis Grotesque Pro";
  src: url("https://<cors-enabled-host>/fonts/BasisGrotesquePro.otf") format("opentype");
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: "Basis Grotesque Pro";
  src: url("https://<cors-enabled-host>/fonts/BasisGrotesquePro-Bold.otf") format("opentype");
  font-weight: 700; font-style: normal; font-display: swap;
}
```

Then the family declaration in the block becomes:

```css
body.embedded-iframe,
body.embedded-iframe input, body.embedded-iframe button,
body.embedded-iframe select, body.embedded-iframe textarea,
body.embedded-iframe label,  body.embedded-iframe legend,
body.embedded-iframe h1, body.embedded-iframe h2, body.embedded-iframe h3,
body.embedded-iframe h4, body.embedded-iframe p,
body.embedded-iframe span, body.embedded-iframe a {
  font-family: "Basis Grotesque Pro", "Helvetica Neue", system-ui, sans-serif !important;
  letter-spacing: -0.011em;
}
```

And the square + token setup changes to:

```css
body.embedded-iframe {
  --white: #fffffc;
  --ink:   #1c1b19;
  --muted: #6b655c;
  --orange:#fd683e;
  --yellow:#eaf261;
  --sage:  #b5c1ab;
  --radius: 5px;
  --error: #b3261e;
  background: var(--white) !important;
  color: var(--ink) !important;
}
/* 5px radius on controls (replaces the border-radius:0 reset) */
body.embedded-iframe .form-control,
body.embedded-iframe .btn,
body.embedded-iframe .btn-primary,
body.embedded-iframe .donation-amount-label,
body.embedded-iframe .donation-recurring-label,
body.embedded-iframe .round-tab,
body.embedded-iframe #card-element,
body.embedded-iframe .StripeElement {
  border-radius: 5px !important;
}
```

The dark-theme block (everything scoped under `body.embedded-iframe:has(.multipage)`)
is **deleted**; both forms share the single light treatment above. Re-run the
verification checklist in the HTML file after applying.

---

## Implementation checklist (later task)

- [ ] Add the 8 font files to `apps/web/public/fonts/`; delete Armand + New Burns.
- [ ] Replace the `@theme`, `@utility`, and `@font-face` blocks in `global.css` per §5 and §1; remove the global square reset.
- [ ] Update components (`Button`, `Logo`, `Hero`, sections) to consume the new tokens; drop orange-emphasis in headings.
- [ ] Rewrite `WrittenGuides.astro` — 4 locked sections, GuideSection card, Document icon SVG, Guide row anchor. Update Sanity `resourceGuide` schema: expand `section` enum to 4 values (`disaster-tipsheets`, `survivors-communities`, `fema-government`, `insurance`).
- [ ] Add Resources-page-specific vertical bar decorations (22px orange bars, left + right edges; left bar transitions to sage at mid-page).
- [ ] Rewrite the ST `<style>` block per §7 (gated on font licensing/CORS); re-verify on the live forms.
