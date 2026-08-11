# UTM Pass-Through to Solidarity Tech — Research & Spec

- Status: **Implemented and verified end-to-end** (persistence script shipped).
- Date: 2026-08-11

## Goal

Allow UTM codes on `survivors.rebuild.us` URLs to pass through to Solidarity Tech
so the rebuild team can track signups by campaign. Example inbound link:

```
https://survivors.rebuild.us/?utm_source=socials&utm_medium=media&utm_campaign=txfloods&utm_content=join
```

## TL;DR

**The basic pass-through already works today, with zero code changes.** Solidarity
Tech's embed stack natively forwards `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content`, and `utm_term` (plus `ref`) from the host page URL into the form
submission. ST's own docs state: "Forms submitted through an embed record the same
data as regular submissions, and UTM parameters on the host page's URL are
automatically carried into the submission."

**The one real gap:** UTMs are read from the *current* page URL only. If a visitor
lands with UTMs, navigates to another page (e.g. `/resources`), and submits the
form there, attribution is lost. Fixing that requires a small site-side script
(spec below).

## How it works today (verified against live infrastructure)

The chain has three links, all confirmed 2026-08-11:

### 1. Host side — `act.rebuild.us/embed/v1.js` (loaded in `BaseLayout.astro`)

The script's header comment: "Upgrades `<iframe data-st-embed>` elements with
auto-height, events, and UTM forwarding." It reads these keys from
`window.location.search`:

```js
var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];
```

and forwards them to the iframe via a hybrid strategy:

- **Src decoration** — appends the params to the iframe `src`, but only while
  `document.readyState === "loading"` at registration time. In practice the script
  defers registration to `DOMContentLoaded` (when `readyState` is `"interactive"`),
  so this branch is effectively unreachable in the standard embed flow.
- **`st:embed:context` postMessage** — on the iframe's `load` event, the host posts
  `{ type: "st:embed:context", v: 1, utm: {...}, hostUrl: <page URL> }` to the
  iframe. **This is the operative path for our site.**

### 2. Inside the iframe — ST's `action_page` bundle

The embed page's JS listens for `st:embed:context` and, for each forwarded key
matching `/^(utm_(source|medium|campaign|content|term)|ref)$/`, appends a hidden
`<input>` to every `<form>` on the page (skipped if the form already has that
input; values truncated to 500 chars).

Independently, if UTM params are present in the iframe URL itself, the ST server
renders the hidden inputs server-side. Verified by probing
`https://act.rebuild.us/web/embed?utm_source=socials&utm_medium=media&utm_campaign=txfloods&utm_content=join&utm_term=termx&ref=refx`,
which returned:

```html
<input type="hidden" name="utm_source" id="utm_source" value="socials" ... />
<input type="hidden" name="utm_medium" id="utm_medium" value="media" ... />
<input type="hidden" name="utm_campaign" id="utm_campaign" value="txfloods" ... />
<input type="hidden" name="utm_content" id="utm_content" value="join" ... />
<input type="hidden" name="utm_term" id="utm_term" value="termx" ... />
```

(Note: `ref` was *not* server-rendered, though the client-side context handler
accepts it.)

### 3. Submission & reporting

The hidden inputs post with the form, so the UTM values are recorded on the
submission. Per ST docs ("Tracking Form Sources with UTM Parameters"): view
sources in the page's **Results tab**, or **filter by UTM source in People**.

## Gap analysis

| # | Gap / caveat | Impact | Severity |
| - | ------------ | ------ | -------- |
| 1 | ~~**No cross-page persistence.** `hostUtmParams()` reads only the current page's query string.~~ | **FIXED 2026-08-11** by the persistence script (see "Implementation" below): stored UTMs are re-attached to the URL on every page load, so ST's own forwarding picks them up site-wide. | Resolved |
| 2 | `ref` is forwarded host-side and accepted child-side, but not server-rendered from URL params and not listed in ST's UTM docs. | Don't rely on `ref` for reporting. | Low |
| 3 | Timing edge: if the iframe fires `load` before the async host script attaches its listener, the context message is never sent. | Rare attribution loss (slow script download + fast cached iframe). No practical host-side mitigation; acceptable. | Low |
| 4 | ~~Founding-member stepper: context-appended hidden inputs are added once at iframe load. If ST re-renders form DOM between steps, appended inputs could be dropped.~~ | **RESOLVED 2026-08-11 — see "Stepper DOM test" below.** The stepper is show/hide panes in one persistent form; hidden inputs survive step navigation in both directions. | None |
| 5 | UTMs attach to the **ST submission** only. The Fundraise Up donation opened via the `st:embed:submitted` handoff does its own separate tracking. | Donation-level attribution in FU is a separate concern, out of scope here. | Info |

Non-issues confirmed during research:

- **Static hosting:** the site is SSG on Vercel; query strings pass through to the
  client untouched. `vercel.json` has no redirects that could drop them. No
  server-side work needed.
- **Sanity-managed form URLs:** `foundingMemberFormSrc` / `getInvolvedFormSrc`
  carry no UTM params, so ST's "don't override params already present" guard never
  conflicts.
- **Spanish pages:** all pages share `BaseLayout.astro`, so behavior is identical
  across `/` and `/es/*`.
- **Ad blockers:** no analytics beacons involved; nothing here is blocked.

## Proposed design (when implementation is approved)

Close gap #1 with a small inline script in `BaseLayout.astro`, placed in `<head>`
**before** the `embed/v1.js` tag:

1. Parse the five `utm_*` keys from `location.search`.
2. If present: persist them (storage scope is decision D1) — URL params always win
   over stored values.
3. If absent but stored values exist: `history.replaceState()` to re-attach them
   to the current URL.
4. ST's script then runs and reads the (possibly restored) UTMs from
   `window.location.search` via its own supported mechanism — no iframe surgery,
   no reliance on ST's internal message API.

**Ordering guarantee:** an inline, parser-blocking script earlier in `<head>` than
the async `embed/v1.js` tag executes before that tag is even parsed, so the
restore step always lands before ST reads the URL.

**Why `replaceState` over alternatives:**

- *Decorating iframe srcs ourselves* — the iframes don't exist yet when a head
  script runs, and rewriting `src` at `DOMContentLoaded` forces a visible iframe
  reload. Rejected.
- *Sending our own `st:embed:context` postMessage* — works (child handler is
  idempotent), but duplicates ST's mechanism against an undocumented message
  shape. Rejected in favor of the supported host-URL path.
- Side benefit of `replaceState`: if the visitor copies/shares the URL from the
  address bar, the UTMs travel with it.

**Scope:** one script in `BaseLayout.astro` covers every page and both embeds
(`FoundingCta`, `GetInvolved`). No Sanity schema changes, no Studio redeploy, no
ST-side configuration.

### Decision points (resolved)

- **D1 — Storage scope:** `sessionStorage` — attribution covers the click-through
  session only, never later direct visits. Conservative; no over-attribution.
- **D2 — Touch model:** URL params always win and replace the stored set as a
  whole (last touch within the session; partial URL sets replace the full stored
  set to avoid mixing campaigns).

### Out of scope

- Donation-level attribution in Fundraise Up.
- Phase 2 ST ↔ Neon sync carrying UTM fields (revisit with ADR-0002 work).
- Server-side (SSR) handling — unnecessary on static hosting.

## UTM conventions for the rebuild team

ST records whatever values arrive; conventions are ours to set. Model on the
team's example:

| Param | Purpose | Example |
| ----- | ------- | ------- |
| `utm_source` | Platform/origin | `socials`, `instagram`, `newsletter` |
| `utm_medium` | Channel type | `media`, `email`, `qr` |
| `utm_campaign` | Campaign slug | `txfloods` |
| `utm_content` | Creative/variant | `join` |
| `utm_term` | Paid search term | (optional) |

Values are recorded verbatim (truncated at 500 chars) — keep them lowercase,
stable, and hyphenated.

## Implementation (2026-08-11)

- **`apps/web/src/scripts/utm-persistence.js`** — classic-script IIFE (no module
  syntax, ES5 idiom) implementing the store/restore logic above. Single source of
  truth; also exercised directly by the unit tests.
- **`apps/web/src/layouts/BaseLayout.astro`** — imports the file via Vite `?raw`
  and inlines it with `<script is:inline set:html={utmPersistence}>`
  immediately before the `embed/v1.js` tag. `is:inline` keeps it parser-blocking
  and unbundled, guaranteeing it executes before the async ST script on every
  page. Verified in the built HTML for `/`, `/resources`, and `/es/`.
- **`apps/web/test/utm-persistence.test.mjs`** — 12 tests running the shipped
  file in a `node:vm` sandbox with a mocked `window`: store on arrival, partial
  sets, URL-wins overwrite, empty-value handling, restore with existing
  params/hash preserved, no-op cases, malformed/absent storage, storage
  exceptions, and non-UTM params (`ref`, `fbclid`, `gclid`) ignored.

### E2E verification (local production build, `astro preview`)

Drove the built site headlessly and inspected the cross-origin iframes via CDP:

1. Landed on `/?utm_source=test&utm_medium=test&utm_campaign=persist_e2e&utm_content=resources&utm_term=z`
   → set written to `sessionStorage`; founding-member iframe received all 5
   hidden inputs.
2. Clicked the **Resources** nav link (href has no UTMs) → address bar became
   `/resources?utm_source=test&utm_medium=test&utm_campaign=persist_e2e&utm_content=resources&utm_term=z`
   (restore via `replaceState`).
3. Get Involved iframe on `/resources` → all 5 hidden UTM inputs present with the
   original values. **Cross-page attribution works.**
4. Negative control (fresh browser session, `/resources` opened directly) → URL
   stays clean, iframe has zero UTM inputs. No phantom attribution.

`pnpm --filter web test` — 28/28 pass (16 pre-existing + 12 new).
`pnpm --filter web build` — clean. (No lint/typecheck scripts exist in the repo;
those commands in earlier specs were aspirational.)

## Stepper DOM test (2026-08-11) — gap #4 RESOLVED

Drove the live site headlessly (`survivors.rebuild.us/?utm_source=test&utm_medium=test&utm_campaign=utm_verify&utm_content=stepper&utm_term=x`)
and inspected the cross-origin iframes via CDP isolated worlds. No submission
was made. Findings:

- Iframe srcs are **not** URL-decorated (confirming the src-decoration branch is
  unreachable in our flow); the postMessage `st:embed:context` path is what
  delivers UTMs.
- **Baseline (step 1):** the founding-member iframe contains one form
  (`#founding-member`) with all 5 hidden inputs: `utm_source=test`,
  `utm_medium=test`, `utm_campaign=utm_verify`, `utm_content=stepper`,
  `utm_term=x`. No `ref` input (not passed). No stray inputs outside the form.
- **After Continue → step 2:** same single form, all 5 inputs intact with values.
- **After clicking the step-1 tab (back navigation):** inputs intact.
- **Control — Get Involved iframe (`/web/embed`, form `#web`):** all 5 inputs
  present with the same values.
- Conclusion: the stepper is show/hide panes within one persistent `<form>`; ST
  does not re-render the form between steps, so context-appended hidden inputs
  survive to submission. The founding-member form behaves like the join form for
  UTM purposes.
- Test artifact (re-advance quirk): after tabbing back to step 1, Continue would
  not re-advance — consistent with validation gating on the conditionally
  revealed "how can you help" checkbox group, not with DOM re-rendering (inputs
  and prior answers persisted throughout).

Remaining optional confirmation: one real test submission (Test B — fake but
MX-valid email, close the FU modal without paying, check the ST Results tab,
then delete the test person) to observe the values server-side. The mechanism is
already proven: the hidden inputs are ordinary form fields that post with the
form, and ST documents that they are recorded.

## Verification

Done (2026-08-11, automated, DOM-level — see "E2E verification" and "Stepper DOM
test" above): same-page forwarding, cross-page restore, stepper survival,
negative control, unit tests, production build.

Remaining (manual, requires ST dashboard access — one real submission each):

1. **Same-page:** visit `/ ?utm_source=test&utm_campaign=utm_verify`, submit the
   Get Involved form with a test address, confirm the UTM values on the
   submission in ST (Results tab / People filter). Delete the test person after.
2. **Cross-page:** land with UTMs → navigate to `/resources` → submit → confirm
   attribution survives in ST.
3. **Founding-member:** submit with UTMs (FU in test mode,
   `?fundraiseupLivemode=no`; close the FU modal without paying) → confirm UTMs
   on the ST record.
4. **Spanish:** repeat 1–2 on `/es/`.

## Reference

- ST embed docs: <https://www.solidarity.tech/docs/integrate-a-form-into-external-website>
  ("UTM parameters on the host page's URL are automatically carried into the submission")
- ST forms docs, UTM section: <https://www.solidarity.tech/docs/forms#tracking-form-sources-with-utm-parameters>
- Host script source: <https://act.rebuild.us/embed/v1.js>
- Site embeds: `apps/web/src/components/sections/FoundingCta.astro`,
  `apps/web/src/components/sections/GetInvolved.astro`; script tag in
  `apps/web/src/layouts/BaseLayout.astro`
- Related: `docs/fundraiseup-donation-spec.md` (ST → FU handoff),
  `docs/splash/solidarity-tech-form-styling.md`
