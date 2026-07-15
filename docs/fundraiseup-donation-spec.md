# Fundraise Up Donation Handoff — Spec

> Status: planned. Research complete; ready to build next session.

## Goal

Split the single "Become a Founding Member" flow into two parts that feel like one: Solidarity Tech (ST) captures donor info first (highest priority), then hands off to the Fundraise Up (FU) Checkout Modal (campaign `FUNKBGQPBRY`, code `c4`) to process payment. Founding-member language stays unchanged.

## Flow

```
Donor → ST iframe (capture, submit) → [st:embed:submitted DOM event] → FU modal opens → payment
```

FU fires only AFTER ST confirms submission, so the lead is captured even if payment is abandoned.

If the `st:embed:submitted` event detail carries field values, they are passed to FU as prefill. If the event fires with no usable field data, FU opens with no prefill — the donor re-enters their info. This is acceptable: the ST lead record is already secured at that point.

## Confirmed decisions

- Replaces the existing `FoundingCta` section; keeps founding-member copy/framing.
- Remove the nav "GIVE" link (`donate.rebuild.us`) — delete `showGive` prop and all related code from `Nav.astro`, `Footer.astro`, and `index.astro` entirely (not just set to `false`).
- ST embed URL: `https://act.rebuild.us/founding-member/embed` — **no `?breakout=true`**. The redirect approach was removed; the DOM event is the sole handoff path. ST dashboard "Redirect To" setting should be cleared or reset to default.
- ST submit signals via a bubbling DOM event on `document`: `st:embed:submitted`. This is not a `postMessage`; listen with `document.addEventListener('st:embed:submitted', handler)`.
- `event.detail` field names are undocumented by ST. The implementation should attempt to read `firstName`, `lastName`, `email` from `event.detail` optimistically (console.log it during testing to verify the actual keys). Pass whatever is present to FU; pass nothing if absent.
- Prefill FU with captured fields (`firstName`, `lastName`, `email`); FU owns amount/frequency/designation.
- Standard FU approach: install the org-specific `<script>` in `<head>` (account ID `AEFYDEJU`); modal opened via `FundraiseUp.openCheckout('FUNKBGQPBRY', { supporter })`.
- The `c4` code is only the campaign reporting code in FU event payloads — it is not passed to `openCheckout`.
- `FundraiseUp.openCheckout()` uses a stub/queue pattern and works immediately without waiting for the FU script to finish loading — no race condition risk.
- Both the ST embed URL and FU campaign ID are editable in Sanity `siteSettings`.

## Build steps (next session)

1. **FU install script** — add to `apps/web/src/layouts/BaseLayout.astro` `<head>` after the existing ST script:

```html
<!-- Fundraise Up: the new standard for online giving -->
<script>(function(w,d,s,n,a){if(!w[n]){var l='call,catch,on,once,set,then,track,openCheckout'
.split(','),i,o=function(n){return'function'==typeof n?o.l.push([arguments])&&o
:function(){return o.l.push([n,arguments])&&o}},t=d.getElementsByTagName(s)[0],
j=d.createElement(s);j.async=!0;j.src='https://cdn.fundraiseup.com/widget/'+a+'';
t.parentNode.insertBefore(j,t);o.s=Date.now();o.v=5;o.h=w.location.href;o.l=[];
for(i=0;i<8;i++)o[l[i]]=o(l[i]);w[n]=o}
})(window,document,'script','FundraiseUp','AEFYDEJU');</script>
<!-- End Fundraise Up -->
```

2. **Rework `FoundingCta.astro`** — keep copy; add `fundraiseUpCampaignId` prop; expose it to client script via `data-campaign-id` on the section element; add the `st:embed:submitted` handoff script:

```js
document.addEventListener('st:embed:submitted', (e) => {
  const d = e.detail ?? {};
  const supporter = {};
  if (d.firstName || d.first_name) supporter.firstName = d.firstName ?? d.first_name;
  if (d.lastName  || d.last_name)  supporter.lastName  = d.lastName  ?? d.last_name;
  if (d.email)                      supporter.email     = d.email;
  const campaignId = document.querySelector('[data-campaign-id]')?.dataset.campaignId;
  if (!campaignId) return;
  FundraiseUp.openCheckout(campaignId, Object.keys(supporter).length ? { supporter } : undefined);
});
```

3. **Sanity schema** — keep `siteSettings.foundingMemberFormSrc` (update default to `https://act.rebuild.us/founding-member/embed`, no `?breakout=true`); add `siteSettings.fundraiseUpCampaignId` (default `FUNKBGQPBRY`); wire through `index.astro`; update `apps/studio/scripts/seed.mjs`; run `cd apps/studio && npx sanity deploy`.

4. **`Nav.astro` + `Footer.astro` + `index.astro`** — remove `showGive` entirely: delete the prop, the `<a href="https://donate.rebuild.us">` anchors (desktop + mobile in nav, footer), and all prop-drilling in `index.astro`.

5. **Docs** — add FU glossary term to `CONTEXT.md`, update the ST entry; add ADR-0005 for the capture-then-pay split.

## FU dashboard branding checklist (client-owned, out of code scope)

- Colors: ink `#1c1b19`, white `#fffffc`, muted `#6b655c`, accent-orange `#fd683e` (primary CTA), accent-yellow `#eaf261`, accent-sage `#b5c1ab`, accent-blue `#dbf1fe`.
- Primary button: `#fd683e`, white text, radius `5px`.
- Fonts: headings Instrument Serif; body Basis Grotesque Pro; mono/eyebrow Basis Grotesque Mono Pro.
- Logo: Rebuild wordmark.

## Verification (next session)

- Console.log `e.detail` inside the `st:embed:submitted` handler on first run to confirm actual field key names; update the mapping if they differ from the assumed keys.
- Test with `window.fundraiseup_livemode = false` (or append `?fundraiseupLivemode=no` to the URL) before go-live.
- Confirm ST record created + FU modal opens (prefilled if field keys resolved, unfilled otherwise).
- Run `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build`.

## Reference

- ST embed DOM events: `st:embed:loaded` (iframe ready), `st:embed:submitted` (successful submission). Both bubble on `document`. Listen via `document.addEventListener(...)`.
- FU JS API: `FundraiseUp.openCheckout(campaignId, options?)` where `options.supporter = { firstName?, lastName?, email? }`. Events: `checkoutOpen`, `checkoutClose`, `donationComplete` via `FundraiseUp.on(eventName, callback)`.
- FU URL API params (for reference, not used in primary path): `form`, `amount`, `currency`, `designationId`, `elementId`, `email`, `firstName`, `lastName`, `modifyAmount`, `modifyDesignation`, `recurring`, `successUrl`, `_lang`, plus custom fields.
- FU test mode: set `window.fundraiseup_livemode = false` before the FU script runs, or add `?fundraiseupLivemode=no` to the page URL.
- FU install: org-specific async `<script>` in `<head>` (account `AEFYDEJU`); must be the last script in `<head>`.
