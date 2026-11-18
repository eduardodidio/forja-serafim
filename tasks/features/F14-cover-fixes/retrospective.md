# Retrospective -- F14

## What worked

- **Clear task decomposition by wave**: T01 (pure function) in Wave 0, then T02+T03 (backend+frontend consumers) in Wave 1, then T04 (data cleanup) in Wave 2. No conflicts, clean dependency chain.
- **Mirroring existing patterns**: The cover upload tmp-file + sharp pattern was modelled after the deck image upload code, reducing design risk and review time.
- **Defensive sanitiser at startup**: T04's one-time cleanup block is a cheap safety net that prevents legacy data from causing issues, even if the bug that produced it (persisted `?v=`) is now fixed by T02.
- **Tech Lead pre-filter caught real issues**: The review identified the missing try/catch on sharp failure (Finding #1) before QA, confirming the value of the review gate.

## What to avoid

- **Copy-pasting dynamic imports from existing code without checking scope**: The redundant `await import("fs")` for `rmdirSync` was copied from the deck upload block even though `fs` is statically imported at line 1. Always check whether a module is already in scope before adding a dynamic import.
- **Relying on framework default error responses for image processing endpoints**: The cover upload endpoint lacks a try/catch around sharp processing, so corrupt images produce an opaque 500 instead of a structured JSON error. This should be part of the task AC for any image processing endpoint.

## Patterns to repeat

- **Serve-time cache-bust injection**: Reading mtime from disk and injecting `?v=<mtime>` in the GET response (not persisting it) is a clean pattern that keeps committed data clean while ensuring browsers get fresh images. Reuse this for any future mutable asset serving.
- **Startup data sanitiser**: A one-time cleanup block at server boot that fixes known data issues is cheap insurance. Use this pattern when fixing bugs that may have produced stale/dirty data in previous deployments.
- **CSS pseudo-element overlay + real DOM spinner**: For vanilla HTML admin panels, using `::after` for the dark overlay and a real DOM element for the spinner (with z-index above) is a clean, no-framework approach to loading states.

## Propagated to learnings

- memory/agent-learnings/developer.md -- try/catch for sharp processing, check dynamic imports
- memory/agent-learnings/architect.md -- include error handling ACs for image processing tasks
- memory/agent-learnings/qa.md -- verify error paths in image upload endpoints
