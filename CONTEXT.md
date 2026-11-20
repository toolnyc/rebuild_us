# REBUILD.US

Shared language for this project. Keep variable, function, file, and content-model names consistent with the terms below. This glossary grows lazily as decisions are made (see `/grill-with-docs`).

## Language

**Disaster survivor**:
A person who has lived through a catastrophic climate disaster (or loves someone who has). The audience the organization serves and organizes.
_Avoid_: victim — the organization explicitly rejects this framing ("we are not victims; we are agents of change").

**Rebuild**:
The short name of the organization and the product. Used as the wordmark (`REBUILD★`) and in running copy.

**The National Disaster Survivors Association**:
The canonical long-form name / descriptor of the organization, shown as a tagline lockup beside the wordmark in the nav and footer and in the copyright line ("© 2026 Rebuild — The National Disaster Survivors Association"). Hardcoded in the layout (not editor-controlled). "Rebuild" is the short name; this is its formal descriptor.

**Association**:
The organizational positioning of the rebuilt site — a membership/community framing, not only a fundraising vehicle. Its canonical name is **The National Disaster Survivors Association**.
_Avoid_: charity, fund (when describing the org itself)

**Founding member**:
A disaster survivor who joins the association during its founding phase ("Become a Founding Member"). Gets early access to trainings, member calls, legislative updates, and resources. The Phase 1 splash page targets 500 founding members via a Solidarity Tech signup form.
**Resource**:
Content that helps people prepare for and respond to a disaster and navigate recovery. The umbrella term is realized as two Sanity document types (see ADR-0003):

- **Guide** — a written, downloadable PDF that belongs to one **section** (see four locked values below). Shown on the Resources page grouped by section as a grid of Guide cards; each card is a clickable anchor to the file. Also shown on the splash as curated hairline-separated rows (document icon + title + "Download" link) in the splash Resources section.
- **Video** — a YouTube video (link/embed). Has no section; shown in a flat "Video Library" grid on the Resources page below the Written Guides section.


**Share page**:
An unlisted, full-screen PDF page at `www.rebuild.us/share/<slug>` (Español: `/es/share/<slug>`) created from a `sharePage` Sanity document. Editors upload a PDF and pick a slug; the page has no nav or footer, is absent from the sitemap and nav, and is reached only by direct link (see ADR-0011). Distinct from a **Guide**, which is a listed resource shown on the Resources page.

**Impact story**:
A narrative of an organization's or community's relief/recovery work, featured on the homepage.

**Testimonial**:
An endorsement quote from an advisory-board member or partner-organization leader.

**News article**:
A time-stamped update published in the **Newsroom**. Carries a **vertical** (a tag used for grouping/filtering); see the flagged ambiguity on vertical vs category.

**Claims Ready** (our page) / **ClaimReady** (the vendor):
"Claims Ready" (with "s") is the rebuild.us page and program. "ClaimReady" (no space, no "s") is the third-party vendor product — a white-label policy-scan tool (upload a policy → AI coverage-gap analysis → hosted report). The Claims Ready page is a static "Coming Soon" section with a link to claimreadyapp.com. Always keep the two names distinct in code, copy, and route names.

**Rebuild Foundation**:
A nav destination referring to the foundation entity (currently TBD — hidden via Sanity `siteSettings` in Phase 1).

**Solidarity Tech**:
The CRM and form platform used by rebuild.us. The Solidarity Tech instance is hosted at `act.rebuild.us`. It provides iframe embeds for the founding-member signup and Get Involved forms; on submission the founding-member embed fires a bubbling DOM event (`st:embed:submitted`) on `document` that triggers the Fundraise Up handoff (see ADR-0005). UTM parameters on inbound links are persisted and forwarded into form submissions for campaign attribution (see ADR-0009).
_Avoid_: "Action Network" as a synonym — these are two distinct platforms.

**Fundraise Up**:
The payment processing platform used for donations. Integrated via an org-specific async `<script>` in `<head>` (account `AEFYDEJU`). In Phase 1 the Checkout Modal is opened programmatically via `FundraiseUp.openCheckout(campaignId, options)` after the Solidarity Tech founding-member form submits, creating a capture-then-pay flow. Campaign ID `FUNKBGQPBRY` is the founding-member campaign; the `c4` code is its reporting label in event payloads only.

**Phase 1 / splash**:
The static splash site live at `www.rebuild.us` since launch: a single long-scroll home page with the Solidarity Tech founding-member form embed, plus Resources, Privacy, and share pages. No user auth or backend. The **full site** replaces its home page.

**Full site**:
The site described by the V2 sitemap and wireframes, launching the week of 2026-12-02. It adds the pages below to the splash-era site and replaces the splash home page. Fully static, built with the existing design system (ADR-0012). The working brief is `docs/full-site.md`.
_Avoid_: "Phase 2" — that name belonged to an earlier plan that included user accounts and a backend.

**Rebuild Ready Network**:
The network of local organizations that Rebuild funds and works through ("Rebuild Ready groups"), and the page that presents it. A top-level nav destination.

**Partner**:
An organization affiliated with the **Rebuild Ready Network**. Shown as a Partner card (logo, name, state) and grouped by category on the Rebuild Ready Network page.

**Chapter**:
A local group of members who organize where they live. Distinct from a **Partner**, which is an organization.

**Membership Hub**:
The page where existing members manage their chapter membership, email preferences, and recurring donations. It is a set of link cards to the outside systems that hold that state; there is no login on rebuild.us (ADR-0012).
_Avoid_: member portal — implies an authenticated area, which is out of scope.

**Get Help** / **Get Involved**:
The two nav dropdown groups. **Get Help** holds Resources and the Membership Hub. **Get Involved** holds Membership, Volunteer, Chapters & Partnerships, and Donate.

**Newsroom**:
The news landing page and its children: the News Archive (paginated list) and News Story pages (one per **News article**).

**Utility page**:
A text-only policy page linked from the footer: Privacy Policy, Terms, Donor Policy & Disclosures, Accessibility Statement.

**Currently watching**:
The ticker of active disasters Rebuild is tracking, shown as a marquee on the Home and News Story pages.

**Spanish (`es`) fields**:
Editor-managed translations live as parallel `*Es` fields on the same Sanity
documents as the English source (see ADR-0008). Pages under `/es/` render from
these fields, falling back to English when a translation is empty (the `es()`
helper in `apps/web/src/lib/i18n.ts`). There is no build-time translation pipeline.

## Relationships

- The **Association** has many **Founding members**.
- A **News article** carries one **vertical**.
- The **Rebuild Ready Network** has many **Partners**; a **Partner** belongs to one category.
- The **Newsroom** lists **News articles**; each has one News Story page.
- A **Guide** belongs to one **section** (one of four locked values); a **Video** has no section.
- The splash features a curated, ordered subset of **Guides** (referenced from the splash page).
- **Testimonials** and **Impact stories** are reused across multiple pages.
- Each **`es` field** mirrors the English field on the same document; an empty `es`
  value falls back to English at render time.


