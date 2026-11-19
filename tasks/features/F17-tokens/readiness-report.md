# Readiness Report — F17

**Verdict:** READY
**Audited:** 2026-11-19T00:00:00Z

## Checklist
- [x] Every task has User Story section
- [x] Every task has Dev Notes section with specific file paths and code patterns
- [x] Every task has Testing section with happy path, edge cases, and error scenarios
- [x] Every task has Acceptance Criteria section with checkable items
- [x] Wave dependencies are correct (Wave 1 tasks T03/T04 depend on Wave 0 tasks T01/T02)
- [x] Wave 1 tasks (T03, T04) touch completely separate files — no overlap
- [x] Dev Notes include line number references for existing code to mirror
- [x] No broken references or missing links within task files
- [x] F17-README has global acceptance criteria and architecture overview
- [x] Diagram paths declared (F17-architecture.mmd, F17-journey.mmd) — to be created during implementation

## Notes

### Wave 0 file overlap between T01 and T02

Both T01 and T02 list `admin/src/lib/paths.ts` and `admin/src/server.ts` as touched files:

- **paths.ts**: T01 says "may need TOKENS_DIR constant"; T02 explicitly defines it. Resolution: T02 owns the `TOKENS_DIR` constant in `paths.ts`. T01 should import it but not define it. If running in parallel, T02 should land the `paths.ts` change and T01 should import from it.
- **server.ts**: T01 adds the endpoint handlers; T02 adds `mkdirSync` inside the POST handler. T02's Dev Notes already acknowledge this ("In the POST handler from T01"), meaning T02's server.ts changes are meant to be applied on top of T01's code.

**Recommendation:** Execute T01 first within Wave 0, then T02 immediately after (or treat T02 as a thin addendum to T01). Alternatively, the developer implementing T01 can absorb T02's scope since T02 is small (one constant + one mkdirSync call + verification). This is a coordination note, not a blocker — the tasks are aware of each other.

### Diagrams not yet created

`docs/diagrams/F17-architecture.mmd` and `docs/diagrams/F17-journey.mmd` are referenced in F17-README but do not exist yet. Per project conventions these are produced during or after implementation, so this is expected and not blocking.
