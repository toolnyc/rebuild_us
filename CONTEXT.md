# REBUILD.US

Shared language for this project. Keep variable, function, file, and content-model names consistent with the terms below. This glossary grows lazily as decisions are made (see `/grill-with-docs`).

## Language

**Disaster survivor**:
A person who has lived through a catastrophic climate disaster (or loves someone who has). The audience the organization serves and organizes.
_Avoid_: victim — the organization explicitly rejects this framing ("we are not victims; we are agents of change").

**Association**:
The organizational positioning of the rebuilt site — "the first-ever national association for disaster survivors." A membership/community framing, not only a fundraising vehicle.
_Avoid_: charity, fund (when describing the org itself)

**Founding member**:
A disaster survivor who joins the association during its founding phase ("Become a Founding Member"). Gets early access to trainings, member calls, legislative updates, and resources. The Phase 1 splash page targets 500 founding members via a Solidarity Tech signup form.
_Note:_ "member" collides with ClaimReady's own **member / associate / professional** tier vocabulary. Our member is an association identity; theirs is a ClaimReady account tier. Keep the two senses distinct in code and copy.

**Resource**:
A guide, article, or video that helps people prepare for and respond to a disaster and navigate recovery. Lives on the Resources page under a **section** (Preparation & Response, or Assistance & Eligibility) and has a **format** (article, video, or downloadable guide).

**Impact story**:
A narrative of an organization's or community's relief/recovery work, featured on the homepage.

**Testimonial**:
An endorsement quote from an advisory-board member or partner-organization leader.

**News article**:
A time-stamped update published under News. Carries a **vertical** (a tag used for grouping/filtering).

**Claims Ready** (our page) / **ClaimReady** (the vendor):
"Claims Ready" (with "s") is the rebuild.us page and program. "ClaimReady" (no space, no "s") is the third-party vendor product — a white-label policy-scan tool (upload a policy → AI coverage-gap analysis → hosted report). In Phase 1 the Claims Ready page is a static "Coming Soon" section with a link to claimreadyapp.com. Phase 2 integrates the ClaimReady API server-side (see ADR-0002). Always keep the two names distinct in code, copy, and route names.

**Rebuild Foundation**:
A nav destination referring to the foundation entity (currently TBD — hidden via Sanity `siteSettings` in Phase 1).

**Solidarity Tech**:
The CRM and form platform used by rebuild.us. The Solidarity Tech instance is hosted at `act.rebuild.us`. In Phase 1 it provides an iframe embed for the founding-member signup form. In Phase 2 it is the primary CRM, with bidirectional member data sync to Neon.
_Avoid_: "Action Network" as a synonym — these are two distinct platforms.

**Phase 1 / splash**:
The launch-ready static splash page at rebuild.us. Single long-scroll page, centered logo only in nav, Solidarity Tech founding-member form embed, no user auth or backend. Replaces the current WordPress site on deploy.

**Phase 2 / full site**:
The full rebuild.us product with user auth (Clerk), relational database (Neon), hybrid SSR (Astro + Vercel adapter), ClaimReady integration, and CMS-driven content pages.

## Relationships

- The **Association** has many **Founding members**.
- A **News article** carries one **vertical**.
- A **Resource** belongs to one **section** and has one **format**.
- **Testimonials** and **Impact stories** are reused across multiple pages.

## Flagged ambiguities

- "victim" vs "survivor" — resolved: always **disaster survivor**; "victim" is never used.
- "member" vs "founding member" — at launch the membership is the founding cohort. Revisit if a general (non-founding) member tier is introduced later.
- **Claims Ready** vs **ClaimReady** — resolved: "Claims Ready" (with "s") is our page/program; "ClaimReady" (no space) is the vendor. See term definitions above.
- **Rebuild Foundation** page scope — still TBD; hidden in Phase 1.
- **Identity / auth** — resolved: Phase 2 uses Clerk (phone/email OTP) for real user accounts. Phase 1 has no auth. See ADR-0002.
- **Newsletter signup** — integration TBD (Solidarity Tech secondary form or Action Network). Stubbed in Phase 1.
