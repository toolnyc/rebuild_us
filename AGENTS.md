# REBUILD.US

Re-development of [rebuild.us](https://rebuild.us) for newworld.inc. This is a rebrand and full information-architecture change from the current WordPress site to a new "national association for disaster survivors" positioning.

See `CONTEXT.md` for the domain language and `docs/adr/` for architectural decisions (start with `docs/adr/0001-stack.md`).

## Stack (decided, not yet scaffolded)

> ⚠ **Under review — pending ClaimReady meeting (2026-06-30).** The "no backend" /
> "Action Network only" summary below is challenged by the planned ClaimReady
> integration (needs a server-side proxy + PDF storage). See the inline flags in
> `docs/adr/0001-stack.md` and the open questions in
> `docs/claimready/meeting-questions.md`.

- **Frontend:** Astro (static SSG), Tailwind CSS v4 with brand design tokens
- **CMS:** Sanity (Studio on Sanity hosting); 6 document types — siteSettings, newsArticle, resource, impactStory, testimonial, person
- **Structure:** pnpm-workspace monorepo (`apps/web`, `apps/studio`)
- **Hosting:** Vercel (static), rebuilt on publish via Sanity webhook → Vercel deploy hook
- **Integrations:** Action Network — custom blind-POST signup form; donations link out to the AN-hosted donate.rebuild.us page
- **Tooling:** TypeScript strict, Prettier, ESLint

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to identically-named GitHub labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
