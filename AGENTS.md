> **Where things live** - Client: NewWorld | Bucket: `clients/NewWorld/` | Dropbox: `_Clients/NewWorld/` | Registry: Notion "Repos" DB (IDs in `~/Code/toolhub/CoS/NOTION.md`)

# REBUILD.US

Re-development of [rebuild.us](https://rebuild.us) for newworld.inc. This is a rebrand and full information-architecture change from the current WordPress site to a new "national association for disaster survivors" positioning.

See `CONTEXT.md` for the domain language and `docs/adr/` for architectural decisions (start with `docs/adr/0001-stack.md`).

## Stack

- **Frontend:** Astro `output: 'static'` with the Vercel adapter, Tailwind CSS v4 with brand design tokens (`docs/design-system.md`)
- **CMS:** Sanity (Studio on Sanity hosting); document types — `siteSettings`, `splashPage`, `privacyPage`, `resourcesPage`, `resourceGuide`, `resourceVideo`. Spanish is editor-managed via parallel `*Es` fields (ADR-0008)
- **Structure:** pnpm-workspace monorepo (`apps/web`, `apps/studio`)
- **Hosting:** Vercel, rebuilt on publish via Sanity webhook → Vercel deploy hook; canonical origin is `https://www.rebuild.us` (ADR-0010)
- **Integrations:** Solidarity Tech — founding-member signup form embed (`act.rebuild.us`) and get-involved form embed (`act.rebuild.us/join-rebuild`), with UTM pass-through (ADR-0009); Fundraise Up — checkout modal opened after the signup form submits (capture-then-pay, ADR-0005)
- **Tooling:** TypeScript strict, Prettier, ESLint; unit tests via `node --test` (`pnpm --filter web test`)

See `docs/adr/0001-stack.md` and the other ADRs in `docs/adr/` for the decisions behind this. There is no backend, auth, or database.

## Workflows

### After any Sanity schema change

Schema changes in `apps/studio/schemaTypes/` are not reflected in the live Studio until you redeploy:

```
cd apps/studio && npx sanity deploy
```

Studio is hosted at `https://rebuild-us.sanity.studio/`. The web app (`apps/web`) reads the schema at build time via the Sanity client, so no Studio redeploy is needed for web rebuilds — only for making new/changed fields visible to content editors.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to identically-named GitHub labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
