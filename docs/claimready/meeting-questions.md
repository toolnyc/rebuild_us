# ClaimReady Integration — Meeting Questions

- Meeting: ClaimReady (Jennifer), 2026-06-30
- Source docs: `APA_API_INTEGRATION_GUIDE_v1.5.pdf`, `ClaimReady_WhiteLabel_Integration_Guide_v1.pdf`
- Context: rebuild.us is a national association for disaster survivors, currently
  a fully-static Astro site (no backend, no login; signup is an Action Network
  blind-POST). We want to offer the ClaimReady policy-scan / coverage-gap
  experience. The v1.5 guide is written for APA, whose model assumes a partner
  with its own member portal + login — which we do not have.

The blocking questions decide the entire shape of the build. Everything else is
secondary.

---

## Blocking questions (answer these or the project shape is unknown)

1. **No-login entry point.** The guide says the partner authenticates members
   through its own login system, and Section 12 states a "direct consumer upload
   workflow is not currently part of the implementation." rebuild.us has **no
   login system at all**. Can ClaimReady support an entry point where the partner
   has no member auth — i.e. an unauthenticated / email-only handoff? If not,
   what is the supported path for a partner like us?

2. **Who pays for the scan, and when?** The scan is a paid service ($29 /
   $23.20). But the Associate journey shows **no payment step before the scan**.
   Through the partner integration, is the scan free to the member, billed
   wholesale to us, or referral-based? When/where does money change hands?

3. **rebuild.us commercial terms.** What discount do our members get, is there a
   revenue share on subscriptions (Claim Ready $5.99/mo, Claim Life $19.99/mo),
   and what does a scan cost us (if anything)?

4. **Product fit for disaster survivors.** The policy scan is *pre-loss* ("find
   gaps before a loss"). Many of our members have **already had a loss / have an
   active claim**. Is the scan the right lead product for us, or should we lead
   with **Claim Life** (active-claim tools)? And how does a member reach Claim
   Life — it is **not exposed in the API** (only scan endpoints are)?

---

## By theme

### Identity & accounts
- When we call `Auth` with an email, does that **create or claim anything** on
  ClaimReady's side, or is it ephemeral until the member registers?
- Anyone could type any email and scan a policy under it — do you expect the
  partner to **verify the email** first, or does your registration OTP cover it?
- Confirm: `member_email` required, `member_id` optional (audit only),
  `member_tier` defaults to `associate`.

### PDF upload, storage & validation
- Is there a **true direct-upload** path, or must we **always host the policy PDF
  at a public URL** for `SubmitScan`? (`policy_file_url` is the only documented
  field.)
- If a public URL is required: how long must it stay reachable? Can we **delete
  it immediately after** the ~60s scan completes? (It's sensitive PII.)
- PDFs must be text-based and not password-protected. Scanned-image policies are
  common for our audience — how should we detect/handle them, and what's the
  recommended error UX? Is there a **max file size**?

### Report hosting, branding & routing
- The report is hosted at `claimreadyapp.com/apa/results` and is "APA branded."
  What **consumer-report branding** is available to us — logo, colors, a
  `/rebuild/results` path, a custom domain?
- Will we get our own `ref=rebuild`, our own partner-prefixed endpoints
  (`rebuildAuth`, etc.), and our own base URL + API key?

### Deep link / return access
- Confirm the `deep_link` is a **permanent, no-login bookmark to one scan
  report** (token "currently permanent"). The word "currently" — any plan to add
  **expiry**? If so, our bookmark assumption breaks.
- For ongoing "claim state," is the only path the **ClaimReady account** (created
  via registration), hosted entirely by you? (i.e. we never build a dashboard.)

### Free tools
- Can we surface/link the **free-account tools** (Preparedness Score, Safety
  Checklist, Claim Calculator, Weather Alerts, inventory) to our members without
  a paid scan?

### Data, privacy & legal
- What member data does ClaimReady **retain** (you keep "ongoing user data, scan
  history")? Implications for our privacy policy / ToS.
- Where/when do users **consent** to ClaimReady's terms in the flow?

### Infra & API stability
- The API is hosted on **base44** (`app--claimreadyapp.base44.app`). Is that
  production infrastructure? What's the **uptime / SLA**?
- v1.5 returns **500 for unparseable PDFs** (planned upgrade to 422). Timeline?

### Onboarding / go-live
- How is our **API key** provisioned (secure channel), and what's the required
  **pre-launch end-to-end test** process?

---

## Appendix — internal decisions blocked on the above (for our own tracking)

These are ours to decide, but each hinges on answers from the meeting. Captured
here so they're not lost; not to be settled until ADR-0002 (post-meeting).

- Backend runtime: Node serverless functions in `apps/web` via Astro's hybrid
  Vercel adapter (site stays static; only `/api/claimready/*` runs server-side).
- Polling design: browser-driven proxy calls vs server-side long poll (serverless
  timeout constraints).
- PDF storage: Vercel Blob / S3, plus deletion-after-scan policy.
- PDF validation + error UX for scanned/password-protected files.
- Tier scope: associate-only (Professional tier appears entirely out of scope).
- `member_email` / `member_id` source — fresh entry at upload vs Action Network
  capture; whether an AN API key is needed to tag/record usage.
- API-key storage (Vercel secret); confirm we never compute HMAC ourselves.
- Our own PII retention policy for any stored PDF.
