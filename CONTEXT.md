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
A disaster survivor who joins the association during its founding phase ("Become a Founding Member"). Gets early access to trainings, member calls, legislative updates, and resources.
_⚠ Pending ClaimReady meeting (2026-06-30):_ "member" collides with ClaimReady's own
**member / associate / professional** tier vocabulary. Our member is an association
identity; theirs is a ClaimReady account tier. Keep the two senses distinct.

**Resource**:
A guide, article, or video that helps people prepare for and respond to a disaster and navigate recovery. Lives on the Resources page under a **section** (Preparation & Response, or Assistance & Eligibility) and has a **format** (article, video, or downloadable guide).

**Impact story**:
A narrative of an organization's or community's relief/recovery work, featured on the homepage.

**Testimonial**:
An endorsement quote from an advisory-board member or partner-organization leader.

**News article**:
A time-stamped update published under News. Carries a **vertical** (a tag used for grouping/filtering).

**Claims Ready**:
A program/page (currently TBD) concerning disaster-insurance claim readiness.
_⚠ Pending ClaimReady meeting (2026-06-30):_ this page is intended to surface the
**ClaimReady** white-label policy-scan experience (upload a policy → AI coverage-gap
analysis → hosted report). Naming collision to resolve: our **Claims Ready** (with "s")
vs the vendor product **Claim Ready / ClaimReady** — pick one canonical term.

**Rebuild Foundation**:
A nav destination referring to the foundation entity (currently TBD).

## Relationships

- The **Association** has many **Founding members**.
- A **News article** carries one **vertical**.
- A **Resource** belongs to one **section** and has one **format**.
- **Testimonials** and **Impact stories** are reused across multiple pages.

## Flagged ambiguities

- "victim" vs "survivor" — resolved: always **disaster survivor**; "victim" is never used.
- "member" vs "founding member" — at launch the membership is the founding cohort. Revisit if a general (non-founding) member tier is introduced later.
- **Claims Ready** and **Rebuild Foundation** page scope is undefined in the current wireframes — TBD.
- _⚠ Identity (pending ClaimReady meeting 2026-06-30):_ the only notion of a "person"
  on the site today is an **Action Network email capture** via blind-POST — no login,
  no sessions, no readback, no API key. Open question whether this can back the
  ClaimReady flow (which expects the partner to authenticate members). See
  `docs/claimready/meeting-questions.md`.
