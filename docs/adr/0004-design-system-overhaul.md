# 0004 - Design system overhaul: fonts, rounded corners, white base

- Status: Accepted
- Date: 2026-07-14

> This ADR records the *decisions and trade-offs* behind the brand refresh. The
> living token/type/component catalog lives in
> [`docs/design-system.md`](../design-system.md). This ADR amends the brand-palette,
> fonts, and square-corner statements in [ADR-0001](./0001-stack.md).

## Context

ADR-0001 adopted a brand palette and fonts from an approved mid-fi design: a
cream-based page (`#F1E9DD`), New Burns Trial (display) + Armand Grotesk (body) +
Helvetica Neue (UI), and a strictly square aesthetic enforced globally
(`border-radius: 0 !important`, "the brand is square"). A new Figma design
(Rebuild Splash: palette node 34-167, typography 34-146, splash 34-174) supersedes
that direction. Rather than continue styling individual elements, we want a canonical
token + component system reused across the site and the embedded Solidarity Tech
forms.

## Decision

1. **Full font swap.** Instrument Serif (headlines/subheads) replaces New Burns Trial;
   Basis Grotesque Pro (body + buttons) replaces Armand Grotesk; Basis Grotesque Mono
   Pro (Bold only) becomes the eyebrow/label face. Helvetica Neue, Armand, and New
   Burns are retired on the main site.

2. **White base, single ink, cream retired.** Page background becomes
   `--color-white #FFFFFC` (the cream `#F1E9DD` base is dropped). All near-black drifts
   in the mocks (`#201B16`, `#1C1B19`, `#1F1B17`, `#18191B`, `#0A0A0A`, pure `#000000`)
   collapse into one `--color-ink #1C1B19`, used for both text and dark surfaces.
   `--color-muted #6B655C` is kept for secondary text.

3. **Accents from the palette frame.** Yellow `#EAF261`, Sage `#B5C1AB`, Orange
   `#FD683E` (palette node 34-167 is the source of truth; splash-mock drifts
   `#B7C1AD` / `#FF5C29` are discarded). A fifth accent, Blue `#DBF1FE`, is added
   for the Insurance guide sub-section on the Resources page (see Resources page
   comp, node 37-439). It is scoped to that content-type accent and not used as a
   general-purpose brand color.

4. **Square → rounded.** A single `--radius: 5px` applies to buttons, cards, inputs,
   and image frames; dividers and full-width section bands stay square. The global
   `border-radius: 0 !important` reset is removed. This reverses ADR-0001's square
   stance.

5. **Type scale retained by name, repointed.** The eight `ty-*` utilities keep their
   names (components already use them) and are remapped to the new fonts/sizes.
   Inline heading emphasis is Instrument Serif *italic only* (the previous italic +
   orange treatment is dropped).

6. **Solidarity Tech forms load Basis Grotesque Pro** via `@font-face` and adopt a
   single light theme (white surface, black-bordered inputs, orange primary, 5px
   radius); the dark founding-form treatment is removed. See
   `docs/design-system.md` §7.

## Alternatives considered

- **Keep the square aesthetic** and treat the Figma radius as a mistake. Rejected: the
  radius is consistent across buttons, cards, and inputs in the approved design, so it
  is intentional, not noise.
- **Keep Helvetica Neue as the UI/label font** (no third brand face). Rejected in favor
  of Basis Grotesque Mono Pro, a real brand font already on hand; mono reads as
  "utility/label" and differentiates eyebrows from body.
- **Load Basis Grotesque Mono Pro for captions too.** Not viable: the mono face ships
  Bold only, which is too heavy for small meta text, so captions use Basis Grotesque
  Pro Regular instead.
- **Match the palette frame's pure `#000000`** for text. Rejected: the splash uses warm
  near-blacks; a single warm `#1C1B19` ink is softer and more consistent.

## Consequences

- ADR-0001's brand-palette + fonts paragraph and its implied square stance are
  superseded by this ADR and `docs/design-system.md`; ADR-0001 is annotated to point
  here.
- Reversing the corner decision (back to square) is cheap in code but is a visible
  brand flip, hence recording it. The font swap requires replacing the files in
  `apps/web/public/fonts/` and the `@font-face`/token blocks in `global.css`.
- The ST font change is gated on confirming a web-font license and CORS-enabled
  hosting for `act.rebuild.us`; until then Helvetica Neue remains the fallback.
- `CONTEXT.md` is updated to record the four locked guide section enum values and their
  section-to-accent-color mapping; the Blue token decision is recorded here and in
  `docs/design-system.md`.
- The Resources page comp (node 37-439) contains color drifts (`#FF5C29`, `#B7C1AD`)
  that differ from the canonical tokens -- discard these in favor of the palette-frame
  values.
