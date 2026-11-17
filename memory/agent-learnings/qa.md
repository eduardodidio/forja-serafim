# QA Learnings

(QA appends to this file at the end of every feature retrospective.)

## F12 -- Project Review: Bug Fixes & Flow Hardening (2026-11-17)

### What went well

- **Audit-driven feature structure** -- Having a clear audit table in the README with severity levels (Critico/Alto/Medio/Baixo) made it straightforward to validate that each finding was addressed. Every item in the audit table maps to a specific task and specific lines of code.
- **Comprehensive test plan** -- The test plan included 16 test cases for T01 alone, with clear expected results. This made code review validation efficient -- I could check each case against the actual implementation.
- **Tech Lead review as pre-filter** -- The Tech Lead had already verified all changes before QA, which meant zero issues found during QA validation. This confirms the value of the review gate.
- **Static validation is powerful** -- For a bugfix/hardening feature like this, most validation can be done via code review (grep for patterns, read implementations). Build and lint provide automated confirmation.

### What could be improved

- **Integration tests remain manual** -- Several important test cases (Lighthouse PWA audit, full upload flow with corrupted files, malicious input across endpoints) require a running server and browser. We should consider adding automated API tests (e.g., using Bun test runner) for the server validation logic.
- **Frontend handling not verified** -- The server now returns `failed` arrays for partial upload failures, but we did not verify the admin frontend actually displays this information to the user. This gap should be tracked.
- **Icon dimension verification** -- The manifest declares 192x192 and 512x512 for the favicon files, but we have no automated check that the actual file dimensions match. A build-time assertion would catch regressions if someone replaces the files.

### Patterns to remember

- **Grep for awaited async calls** -- When verifying race condition fixes, grep for the pattern (e.g., `Bun\.write`) and confirm every occurrence is prefixed with `await`. Simple and reliable.
- **Check both source AND built output** -- For HTML-level changes (like manifest links), always verify the change survives the build process by checking `dist/` output, not just the source file.
- **Validate regex against existing data** -- When a new validation regex is introduced (like slug validation), mentally check it against all existing data to ensure no regression. The slug regex correctly matches all three existing collection slugs.
- **Count route handlers vs validation calls** -- When a validation helper is introduced (like `isValidSlug`), count the number of route handlers that extract the parameter and verify each one calls the helper. In F12, 7 slug-extracting routes all call `isValidSlug`.
