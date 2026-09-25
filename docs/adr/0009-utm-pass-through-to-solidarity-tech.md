# 0009 - UTM pass-through to Solidarity Tech: sessionStorage persistence + site-side context delivery

- Status: Accepted
- Date: 2026-08-11 (hardened 2026-08-12)

## Context

The rebuild team tracks signups by campaign via UTM parameters on inbound links.
Solidarity Tech's embed stack natively forwards `utm_source`, `utm_medium`,
`utm_campaign`, `utm_content`, and `utm_term` (plus `ref`) from the host page URL
into form submissions — but only from the *current* page URL, via a
`st:embed:context` postMessage sent on the iframe's `load` event.

Two production defects were found in this mechanism:

1. **Cross-page attribution loss.** A visitor landing with UTMs who navigates to
   another page before submitting loses attribution, because the host script reads
   only the current query string.
2. **Delivery race.** On repeat visits with a warm-cached iframe, the iframe's
   `load` event can fire before the async `embed/v1.js` attaches its listener, so
   the context message is never sent and the submission records no UTMs.

An early persistence implementation (plain `sessionStorage`) also leaked stale
values: Firefox and Chrome restore sessionStorage with browser-session restore,
so "session-only" attribution survived into later direct visits.

## Decision

**Persist and restore UTMs at the URL level, and send the context message ourselves.**

- `apps/web/src/scripts/utm-persistence.js` — an inline, parser-blocking IIFE in
  `BaseLayout.astro` (before the ST script tag). On arrival with URL UTMs it
  stores them; on arrival without, it re-attaches the stored set via
  `history.replaceState()` so ST's own supported URL-reading mechanism picks them
  up. URL params always win and replace the stored set as a whole (last touch;
  no mixing campaigns). Side benefit: copied/shared URLs carry the UTMs.
- **12-hour TTL** — stored sets are `{ t, utm }` with a 12-hour lifetime. Expired
  and legacy (timestamp-less) sets are discarded and removed on read, closing the
  browser-session-restore leak. 12h covers a genuine same-day visit chain.
- `apps/web/src/scripts/st-embed-utm.js` — sends the `st:embed:context`
  postMessage site-side on two parser-blocking hooks: a capture-phase window
  `load` listener (capture sees every subresource load, so no iframe load is
  missed) and the child's own `st:embed:loaded` announcement. Origin and window
  handle are verified; the child handler is idempotent, so duplicate sends are
  harmless.

Rejected alternatives: decorating iframe `src`s ourselves (iframes don't exist
yet when a head script runs; rewriting at DOMContentLoaded forces a visible
reload) and relying solely on our own postMessage (duplicates ST's mechanism
against an undocumented message shape — hence the URL-restore design as the
primary path, with the postMessage as the race fix).

Donation-level attribution in Fundraise Up is out of scope (FU does its own
tracking).

## Consequences

- Cross-page attribution works site-wide (verified end-to-end on `/`,
  `/resources`, and `/es/`): land with UTMs → navigate → submit → values recorded.
- The delivery race is closed; repeat visits with warm caches still attribute.
- Stale attribution from restored browser sessions is flushed after 12 hours.
- No Sanity schema changes, no ST-side configuration, no server-side work.
- Unit tests (`apps/web/test/utm-persistence.test.mjs` and delivery tests) run
  the shipped scripts in a `node:vm` sandbox.
