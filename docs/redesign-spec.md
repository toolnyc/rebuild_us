# Redesign implementation spec: splash + resources pages

Implements the new Figma design across the two live pages. Written to be executed
end-to-end by a fresh session with no prior context. Read this file top to bottom
before writing code.

**Design sources (Figma file `LC4ZJUQYVgnoGltxEuElHN`, "Rebuild Splash"):**

- Splash comp: node `34:174` — https://www.figma.com/design/LC4ZJUQYVgnoGltxEuElHN/Rebuild-Splash?node-id=34-174
- Resources comp: node `37:439` — https://www.figma.com/design/LC4ZJUQYVgnoGltxEuElHN/Rebuild-Splash?node-id=37-439
- Palette: node `34:167` · Typography: node `34:146`

**Companion docs (read these too):**

- `docs/design-system.md` — tokens, fonts, type scale, components. **Apply it as
  written; do not redesign it.** Copy-ready CSS lives in its §5 and §1.
- `docs/adr/0004-design-system-overhaul.md` — rationale; drift rules.
- `docs/adr/0003-resource-content-model.md` — guide/video content model.
- `CONTEXT.md` — canonical terms; the four locked guide sections.

**Cardinal drift rule (ADR-0004):** the comps contain non-canonical hex values.
Whenever the comp shows `#FF5C29` use `--color-accent-orange #FD683E`; `#B7C1AD` →
`--color-accent-sage #B5C1AB`; any near-black (`#1F1B17`, `#18191B`, `#201B16`,
`#0A0A0A`, `#000000`) → `--color-ink #1C1B19`; `#FDF8F1` (document-icon body) →
`--color-white #FFFFFC`. Never copy a hex from the comp into code; always map to a
token.

---

## Resolved decisions (do not re-litigate)

1. This spec covers **both** applying the design system and rebuilding the two
   pages, in one implementation.
2. The Resources page **keeps the Video Library** section below Written Guides,
   even though the comp omits it. Video cards get a minimal restyle (§E6): 5px
   radius on the facade, `ty-h3` titles, new tokens. No border treatment.
3. The yellow marker highlight (e.g. "strength in numbers") is sanctioned,
   **editor-controlled** via the existing rich-text `highlight` decorator, and
   **animated** as a left-to-right sweep (§F).
4. Both forms remain **Solidarity Tech iframes**. The comp's drawn form fields
   are the visual target for the ST re-theme (§G), not native forms.
5. Footer is the **orange band** with wordmark + a slim utility row: Privacy
   Policy (visibility-gated), Contact (visibility-gated), © line, and the "Edit"
   link to `https://rebuild-us.sanity.studio`. Dark link-column footer retired.
6. Photography is **Sanity-controlled**; comp photos are seeded content.
   Decorative artwork lives **in code** (inline SVG / clip-path / mask), per
   design-system.md §6 "Decorative patterns".
7. Comp copy is authoritative; it ships via `apps/studio/scripts/seed.mjs`,
   which may **replace documents wholesale** (site is not live).
8. Numbered section markers ("01", "02"…) are **retired**. Sanity `*Label`
   fields stay in the schema but are never rendered.
9. Motion language is preserved (Lenis + GSAP: hero cascade, stat count-up,
   scroll fade-ins) and re-wired onto explicit `data-animate` attributes (§F).
10. ST style block rewrite is in scope **repo-side only** (§G); a human pastes
    it into ST admin afterwards. ST keeps Helvetica Neue until the web-font
    license/CORS gate clears.

---

## Phase 0 — Assets

### 0.1 Fonts

Copy from `~/Downloads` into `apps/web/public/fonts/` (exact filenames, ignore
the `" (1)"` duplicates):

```
InstrumentSerif-Regular.ttf   InstrumentSerif-Italic.ttf
BasisGrotesquePro-Lt.otf      BasisGrotesquePro.otf
BasisGrotesquePro-Italic.otf  BasisGrotesquePro-Md.otf
BasisGrotesquePro-Bold.otf    BasisGrotesqueMonoPro-Bd.otf
```

Delete `apps/web/public/fonts/ArmandGroteskTest-*.otf` and
`NewBurnsTrial-Regular.otf`.

### 0.2 Figma assets

Use the Figma MCP (`get_design_context` on nodes `34:174` and `37:439`) to get
fresh asset URLs (URLs expire ~7 days after fetch).

- **Photos (content, → Sanity via seed):** hero photo (comp node `34:349`/
  `34:422` family, the crowd photo), and the three WhyJoin photos (`34:348`
  Build Community, `34:347` Get Advice, `34:349` Free Trainings). Download to
  `apps/studio/scripts/assets/` and upload in the seed script via
  `client.assets.upload('image', …)`.
- **Torn-edge band path (code, tier 2):** node `34:290` (splash resources band
  top edge) and `37:440` (resources hero yellow band) share the same ragged
  vector. Extract the SVG path once; embed inline as a `clip-path`/`mask` on
  the section (see §D5, §E2).
- **Halftone wordmark texture (tier 3):** the `6zZ7T4.tif` groups in both
  footers. Export once as PNG to `apps/web/public/images/`, applied as
  `mask-image` over token-colored fill (§D8). If extraction is unreliable, an
  acceptable fallback is the existing `logo-lockup-black.png` scaled large.
- Everything else (arrows/polygons, triangle notch, bands, document icon) is
  **drawn in code** — no exports.

---

## Phase 1 — Design system application

### 1.1 `apps/web/src/styles/global.css`

Replace wholesale with the target in `design-system.md` §5 (the `@theme`,
`body`, `@utility ty-*`, `.link-main`/`.link-alt` blocks) plus the eight
`@font-face` rules from §1. Notes:

- The old `--color-cream` token and the global `border-radius: 0 !important`
  reset are **removed**. `--font-ui` is removed; anything referencing `font-ui`
  in components switches to `font-body` (or `font-mono` for eyebrows).
- Add one utility not in §5 (used by the highlight sweep, §F):

```css
mark, .mark-highlight {
  background: linear-gradient(var(--color-accent-yellow), var(--color-accent-yellow))
    left center / 0% 100% no-repeat;
  color: var(--color-ink);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  padding-inline: 0.15em;
}
.no-js mark, mark.mark-static { background-size: 100% 100%; }
```

### 1.2 `apps/web/src/components/Button.astro`

Rewrite to the §6 Button spec. Keep the `href`/`size`/`class` prop API, rename
variants: `primary` (orange fill, white text), `outline` (1px ink border, ink
text, hover ink fill/white text), `dark` (ink fill, white text), `small`
(2px orange border, orange bold ~14px label — used for nav "Join" and ST-style
"Sign up"). Map the old names for compatibility: `main` → `primary`,
`alt` → `outline`. All buttons: `border-radius: var(--radius)` (5px),
`font-family: var(--font-body); font-weight: 700`.

### 1.3 `apps/web/src/components/Highlight.astro`

Keep; ensure it renders `<mark>` (the global `mark` rule now styles it). The
rich-text `highlight` decorator in `RichText.astro` must map to `<mark>` too —
verify and fix if it maps elsewhere.

### 1.4 `apps/web/src/components/SectionMarker.astro`

Keep the file (nav uses the eyebrow style) but **remove every usage in section
components** (About, FoundingCta, WhyJoin, Resources, WrittenGuides,
VideoLibrary). Section headings stand bare.

### 1.5 New shared components

- `DocumentIcon.astro` — props: `section` (one of the four enum values) or
  `accent` (token name). Inline SVG per design-system §6 "Document icon":
  ~51×67 white (`--color-white`) body, 5px top radius, colored top strip
  (accent by section: `disaster-tipsheets` → orange, `survivors-communities` →
  yellow, `fema-government` → sage, `insurance` → blue), three gray
  (`#D9D9D9`) rounded text lines.
- `TornEdge.astro` (or a CSS utility) — the extracted ragged path (§0.2)
  applied as a mask on a token-colored band.

---

## Phase 2 — Sanity schema (`apps/studio/schemaTypes/`)

### 2.1 `resources.ts`

Replace the two-value `SECTIONS` list with the four locked values (CONTEXT.md):

```ts
const SECTIONS = [
  { title: "Disaster Tipsheets", value: "disaster-tipsheets" },
  { title: "For Survivors & Our Communities", value: "survivors-communities" },
  { title: "FEMA & Government Programs", value: "fema-government" },
  { title: "Insurance", value: "insurance" },
];
```

No other schema changes to `resourceGuide`/`resourceVideo`.

### 2.2 `pages.ts` (`splashPage`)

- `heroHeadlineAccent`: change title to "Hero headline accent (italic)" —
  rendering is ink italic now, never orange.
- `whyJoinColumns`: the `backgroundColor` field is obsolete (cards are white
  with orange borders). Leave the field in place, unrendered.
- All `*Label` fields: leave in place, unrendered.

---

## Phase 3 — Splash page rebuild

Section order is unchanged: Nav → Hero → Stats → About → FoundingCta → WhyJoin
→ Resources → GetInvolved → Footer. All copy below is verbatim from the comp
and ships through the seed (§H). Mobile rules are in §I.

### D1 `Nav.astro`

- Header surface: `bg-white/95` (token white, not pure white), keep backdrop
  blur; drop `bg-cream`.
- Left slot: `RESOURCES` in `ty-eyebrow text-accent-orange`, linking to
  `resourcesDestination`. (Uppercase comes from `ty-eyebrow`.)
- Center: logo lockup as-is. Right: Join `Button` `variant="small"`.

### D2 `Hero.astro`

- Remove the "Est. 2026 — National" eyebrow entirely.
- Left column: `ty-display` headline `When things fall apart, we come` +
  `<em>together.</em>` — the accent is **italic ink** (`<em>` inherits; remove
  `text-accent-orange` from the accent span).
- Subcopy (`ty-lead`): "Rebuild is a national membership association built by
  and for survivors of hurricanes, floods, wildfires, tornadoes, and more."
- CTA: `Button variant="primary" size="lg"` → "Join Rebuild".
- Right column: Sanity hero photo, `rounded-[--radius]`, `object-cover`;
  remove the old yellow offset block and the caption overlay (comp has
  neither). The photo bleeds slightly down toward the stats band
  (`lg:-mb-16 relative z-10` or similar overlap per comp).
- **Yellow edge bars:** two fixed-width (`w-[22px]`) `bg-accent-yellow`
  absolute bars hugging the viewport's left and right edges, spanning from the
  top of the page through the bottom of the Stats band (implement as a
  wrapper around Hero+Stats with `relative` and two absolutely positioned
  bars, `hidden lg:block`).
- **Sage top strip:** full-width `h-[28px] bg-accent-sage` strip at the very
  top of `<body>` content, above the nav (both pages have it).

### D3 `Stats.astro`

Keep structure. Dark band `bg-ink text-white`; stat values in Instrument Serif
(~35px — use `ty-h2` sized down or a `text-[35px] font-display` utility);
labels `ty-caption text-accent-sage` (sage on dark, per design-system §6
"Stat"). Content unchanged (500 / Nationwide / By & for). Keep
`stat-value` class for the count-up.

### D4 `About.astro` + `FoundingCta.astro`

- About: centered `ty-h2` (55px scale) rich-text statement, max-w ~882px.
  Seeded statement: "We come together to share wisdom, advocate for our
  interests, and build a national network with the *strength in numbers*
  [em + highlight marks] to eventually make full recovery for every survivor a
  reality." Support paragraph (`ty-lead`, centered, max-w ~716px): "We know
  what it takes to get back on your feet, and we're here to help. Rebuild
  exists so that no survivor has to go through this alone." Remove the
  orange-border-left treatment on the support paragraph (comp: plain centered
  text).
- FoundingCta: full-width `bg-accent-sage` band. Left: `ty-h1` "Join today to
  become one of the 500 Founding Members of Rebuild." + `ty-lead` "Get
  first-look access to advice, training, news, and community benefits coming
  online later this year." Right: the ST founding-member iframe (unchanged
  embed markup). Section is light now — remove `bg-ink text-white`. Add the
  left-edge sideways arrow accent (code-drawn polygon, `hidden lg:block`).
- Bottom of the band: full-width `h-[30px] bg-accent-orange` divider strip.

### D5 `WhyJoin.astro`

- Centered `ty-h2` heading: "Why join Rebuild today?" (hardcode or reuse an
  existing field — heading text moves to seed if a field exists; there is no
  heading field today, the component hardcodes "Why Join Rebuild?" — update the
  hardcoded string to the comp text).
- Three cards on white: `border-2 border-accent-orange rounded-[--radius]
  overflow-hidden`, structure top-to-bottom: photo (`aspect-[391/230]
  object-cover`), hairline (`border-t border-ink`), title (`ty-h3`, 30px scale,
  left-aligned with padding), body (`ty-body`, centered per comp). Remove the
  numbered eyebrow and the `backgroundColor` logic entirely.
- Card copy (seed, verbatim):
  1. **Build Community** — "A growing network of survivors, leaders, and
     subject matter experts nationwide, so wherever disaster hits next, you're
     connected to people who've been there."
  2. **Get Advice** — "A growing library of tools and resources to help you
     take on insurance claims, FEMA denials, and everything between, built by
     and for survivors. We also share hard to find news like detailed weather
     forecasts and updates on changes at FEMA."
  3. **Free Trainings** — "Skills that put power back in your hands. Workshops
     on preparedness, response, leadership, and advocacy, led by survivors and
     experts who stick around after the cameras leave."

### D6 `Resources.astro` (splash section)

- Full-width `bg-accent-sage` band whose **top edge is the torn/ragged mask**
  (TornEdge, §1.5) so it tears into the white WhyJoin section above.
- Left column: `ty-h2` "Resources"; rich-text copy (`ty-lead`):
  "We know from direct experience just how *broken the recovery system*
  [highlight mark] is — and how hard it is on survivors." then "Our resource
  guides are a starting point to help make the process easier. For more
  survivor resources, visit rebuild.us/resources." — keep the existing
  `rebuild.us/resources` → `/resources` link substitution behavior, but the
  link renders as underlined ink (`link-alt` with underline), not orange.
- Right column: featured guide rows (from `featuredResources`), each row:
  `DocumentIcon` (accent by the guide's `section`) + title
  (`font-body font-medium text-[22px]`, ink) + right-aligned "Download ↓"
  (`font-bold text-[18px]` ink, the anchor to `fileUrl`). Hairline
  (`border-t border-ink`) separators between rows. Remove the old
  "Guide 0N · PDF" numbering entirely.

### D7 `GetInvolved.astro`

- Left: `ty-h1` (42px scale — use `ty-h2`) "Not ready to become a founding
  member but want to stay in the loop?" Keep the social icons block.
- Right: ST join-form iframe unchanged. On white.

### D8 `Footer.astro` — full rewrite

Orange band (`bg-accent-orange`), containing:

- A **triangle notch** at the band's top-left: code-drawn upward-pointing
  triangle in `--color-white` (the page background) via
  `clip-path: polygon(...)` sitting flush on the band's top edge (comp node
  `34:391`, ~158×83px, positioned ~10% from the left edge).
- A full-width hairline (`border-t border-ink`) inside the band.
- The large `REBUILD★` wordmark lockup centered, in ink, with the halftone
  texture treatment (§0.2 tier 3) — acceptable fallback: `Logo` component
  scaled up (`h-24 sm:h-32`).
- "The National Disaster Survivors Association" descriptor lockup beneath it
  (`ty-eyebrow` ink).
- Slim utility row (`ty-caption` ink): "© 2026 Rebuild — The National Disaster
  Survivors Association" · Privacy Policy (`visibility.privacyPage`) · Contact
  (`visibility.contactPage`) · Edit → `https://rebuild-us.sanity.studio`
  (target `_blank`). Delete the link-column code and its `getInvolved`/
  `explore` arrays; keep the `visibility` prop.

---

## Phase 4 — Resources page rebuild

Order: Nav → Hero (yellow band) → Written Guides → Video Library → GetInvolved
→ Footer. Shares Nav/GetInvolved/Footer from Phase 3.

### E1 Edge bars

`w-[22px]` vertical bars on both viewport edges, `hidden lg:block`:
right bar `bg-accent-orange` full page height; left bar `bg-accent-orange`
down to the top of the FEMA/Insurance card row, then `bg-accent-sage` for the
remainder (implement as two stacked divs in one absolute column; exact switch
point: top of the second GuideSection grid row).

### E2 Hero

Full-width `bg-accent-yellow` band with the torn-edge mask on its **bottom**
edge (same path as D6, flipped). Inside, left-aligned: `ty-display`
"Resources" (h1) + `ty-lead` "We know that facing a disaster — or even
preparing for one — can feel overwhelming. Rebuild is here to help."
Replace the current centered hero section in `resources.astro`.

### E3 Written Guides intro

Left-aligned `ty-h2` "Written Guides" + `ty-lead`: "Our guides provide
practical, step-by-step information to help you prepare and respond."

### E4 `WrittenGuides.astro` — full rewrite

Per design-system §6 "GuideSection card", "Document icon", "Guide row":

- Four sub-sections in locked order: Disaster Tipsheets →
  For Survivors & Our Communities → FEMA & Government Programs → Insurance.
  Group the fetched guides by their `section` value; render all four cards
  even if a section is empty (empty list, keep heading).
- Grid: `grid grid-cols-1 lg:grid-cols-2 gap-8` (2×2 on desktop).
- GuideSection card: `border-2 border-accent-sage rounded-[--radius] bg-white
  p-8`; heading `ty-h2` (42px scale); rows beneath.
- Guide row: one `<a href={fileUrl}>` wrapping `DocumentIcon` (accent by
  section) + title (`ty-h3`). **No separate Download link on this page.**
  Rows separated by vertical gap only (no hairlines here, per comp).

### E5 Seed guide inventory (verbatim from comp; PDFs to be attached by
editors later — seed titles/sections/order only, `file` left unset unless
existing PDFs match):

- `disaster-tipsheets`: Before, During, and After a Wildfire (1) · Before,
  During, and After a Hurricane (2) · Before, During, and After a Flood (3)
- `survivors-communities`: Disaster Mental Health Guide (1) · Evacuation
  Guide (2) · Guide to Protecting Key Documents (3)
- `fema-government`: Understanding the Federal Disaster Recovery System (1) ·
  Small Business Administration (SBA) Loans (2) · Federal Emergency Management
  Agency (FEMA) Assistance (3) · Other Government Disaster Relief Programs (4)
  — the comp shows a fifth row duplicating "Before, During, and After a
  Flood"; that is placeholder noise, skip it.
- `insurance`: Guide to Assisted Living Expense (ALE) Coverage (1) · How to
  Self-Advocate During an Insurance Dispute (2)
- Splash `featuredResources` (order matters): "Federal Emergency Management
  Agency (FEMA) Assistance" · "Disaster Mental Health Guide" · "How to
  Self-Advocate During an Insurance Dispute" — these are the closest existing
  documents to the comp's featured titles ("Applying for FEMA Assistance",
  "The Survivor's Guide to Mental Health", "Advocating for Yourself in an
  Insurance Dispute"). Use the guide documents; do NOT create duplicate
  guides with the comp's alternate titles.

### E6 `VideoLibrary.astro` — minimal restyle

Keep structure and the click-to-embed facade script. Changes only: facade gets
`rounded-[--radius] overflow-hidden`; play button chip gets
`rounded-[--radius]`; title under the card becomes `ty-h3`; heading stays
`ty-h2`, left-aligned to match Written Guides; remove the SectionMarker.
Section renders only when videos exist (unchanged).

---

## Phase 5 (§F) — Motion re-wiring

Refactor both pages' inline `<script>` blocks:

1. Keep Lenis smooth scroll + anchor handling as-is.
2. Replace all positional/style-based selectors (`.bg-ink`, `#about
   .section-marker`, `main section:last-of-type`, `.sticky`) with data
   attributes stamped in the markup:
   - `data-animate="fade"` — generic scroll-triggered fade-up (y:20, 0.9s,
     power2.out, once, start "top 95%"). Apply to: section headings, lead
     paragraphs, guide rows, GuideSection cards, WhyJoin cards (stagger 0.1 via
     shared parent `data-animate-group`), video cards, footer lockup.
   - `data-animate="hero"` — the load-time cascade (headline 1.1s delay 0.2,
     subcopy delay 0.5, CTA delay 0.35 with the existing clearProps safety
     net, photo delay 0.35).
   - `data-animate="stat"` — the count-up (unchanged logic, keyed to
     `.stat-value` inside it).
   - `data-animate="sweep"` — every `<mark>`: tween `background-size` from
     `0% 100%` to `100% 100%`, 0.8s power2.out, scroll-triggered once at
     "top 85%".
3. Extract the shared script into `apps/web/src/scripts/motion.ts` imported by
   both pages, so the selector map lives in one file.

---

## Phase 6 (§G) — Solidarity Tech style block

Rewrite `docs/splash/solidarity-tech-form-styles.html` per design-system §7:

- Single light theme; delete the entire `body.embedded-iframe:has(.multipage)`
  dark block.
- Token vars → `--white #fffffc`, `--ink #1c1b19`, `--muted #6b655c`,
  `--orange #fd683e`, `--yellow #eaf261`, `--sage #b5c1ab`, `--radius 5px`.
- 5px radius on `.form-control`, `.btn`, `.btn-primary`,
  `.donation-amount-label`, `.donation-recurring-label`, `.round-tab`,
  `#card-element`, `.StripeElement` (replaces the square reset).
- **Font stays Helvetica Neue** (the Basis Grotesque `@font-face` block from
  §7 is NOT added — licensing/CORS gate unresolved).
- Preserve the verification checklist comments in the file.
- Human step (list in the PR description / final report): paste the updated
  block into ST admin → Website → Settings → Site-wide HTML Head Content, then
  run the §7 verification checklist against both embeds.

---

## Phase 7 (§H) — Seed script

Update `apps/studio/scripts/seed.mjs` (wholesale document replacement is fine):

- `splashPage`: new hero copy (D2), about statement with `em` + `highlight`
  marks on "strength in numbers" (D4), founding CTA copy (D4), WhyJoin columns
  (D5, with uploaded images), resources rich text with highlight on "broken
  the recovery system" and the `rebuild.us/resources` sentence (D6),
  getInvolved copy "Not ready to become a founding member but want to stay in
  the loop?" (D7), `featuredResources` references (E5).
- `resourcesPage`: heroSubcopy and writtenGuidesSubcopy per E2/E3.
- `resourceGuide` documents per E5 (new section values; delete/replace any
  seeded guides carrying the old two-section values).
- Upload the four photos (§0.2) and set `heroImage` + WhyJoin `image` fields.
- Run: `node apps/studio/scripts/seed.mjs` (needs `SANITY_API_TOKEN` from
  `apps/web/.env`; script already wires env loading).

---

## §I — Responsive rules (comps are 1440px desktop-only; these are the agreed
mobile behaviors, not suggestions)

- Type: `clamp()` in the `ty-*` utilities only; no per-breakpoint font sizes.
- All two-column layouts (Hero, FoundingCta, GetInvolved, splash Resources)
  stack below `lg:`; text first, form/image second.
- Written Guides grid `grid-cols-1 lg:grid-cols-2`; WhyJoin `grid-cols-1
  md:grid-cols-3` (stack below `md:`).
- Stats: `grid-cols-1 sm:grid-cols-3` (existing behavior).
- 22px edge bars: `hidden lg:block` on both pages.
- Decorative arrows/polygons: `hidden lg:block`.
- Footer notch + hairline: keep at all sizes (they scale fine).
- Nav: keep three-slot grid; eyebrow + Join shrink via existing `sm:` sizing;
  no hamburger.

---

## §J — Verification checklist (run all before finishing)

1. `pnpm -r build` (web builds; studio schema compiles). Fix all errors.
2. Prettier/ESLint per repo tooling (`pnpm -r lint` / `format` if defined in
   package.json; otherwise `npx prettier --check` on touched files).
3. No remaining references anywhere in `apps/web/src` to: `cream`,
   `font-ui`, `Armand`, `New Burns`, `Helvetica` (grep for each), old hexes
   `#F1E9DD` `#F4552A` `#ECF278` `#A7B795` `#1F1B17`, `SectionMarker` usage in
   sections, `border-radius: 0`.
4. Run the seed against the dataset; load `/` and `/resources` in dev
   (`pnpm dev`) and compare against the Figma screenshots at 1440px and 375px
   viewports: section order, band colors (canonical tokens), torn edges,
   highlight sweeps firing on scroll, guide grouping (4 sections, locked
   order), featured guides on splash with Download links, videos rendering,
   footer notch + utility row links.
5. Confirm both ST iframes still load (they will show the OLD theme until the
   human paste step — expected; note it in the final report).
6. Final report must list the two human follow-ups: (a) paste ST block into ST
   admin, (b) editors attach real PDFs to seeded guides and swap placeholder
   photos.
