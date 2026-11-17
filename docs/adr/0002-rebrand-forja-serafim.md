# ADR 0002 — Rebrand from "A Casa do Serafim" to "Forja Serafim"

**Status:** accepted
**Date:** 2026-11-17
**Feature:** F04

## Context

The project owner decided to rebrand from "A Casa do Serafim" to "Forja Serafim"
with a new logo (seraph with anvil and flame). This required migrating the entire
codebase to a new repository (`forja-serafim`) and updating all references.

## Decision

- Migrate full git history to `github.com/eduardodidio/forja-serafim`
- Replace all brand references: "A Casa do Serafim" -> "Forja Serafim"
- Generate new favicon from `logoForjaSerafim.jpeg`
- Update Render service names: `forja-serafim` (static) + `forja-serafim-admin` (admin)
- Update SEO: site URL to `forjaserafim.com.br` (when domain is acquired)
- Keep old repo `serafim-arcana-forge` as read-only archive
- Historical task files (F01-F03) left with old references for audit trail

## Consequences

- All new development happens in `forja-serafim` repo
- Render services need to be recreated or updated to point to new repo
- Google OAuth authorized origins need update for new admin URL
- Old bookmarks/links to `casa-do-serafim.onrender.com` will stop working
