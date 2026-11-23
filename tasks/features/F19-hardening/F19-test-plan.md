# F19 Test Plan — Hardening: JSON validation, git-merge safety, API error handling

**Feature:** F19
**Author:** TEA (Test Architect)
**Date:** 2026-11-23

---

## 1. Test Strategy

The hardening feature is defensive in nature — its purpose is to prevent data corruption from cascading into user-facing failures. The test strategy reflects this:

- **Unit tests** validate each individual defensive function in isolation (conflict detection, JSON validation, error classes, backup/restore logic). These form the bulk of coverage.
- **Integration tests** verify cross-module scenarios: corrupted JSON flowing through data-io into the API layer, and startup self-heal recovering from multiple failure modes.
- **Smoke tests** are lightweight production health checks that confirm the system is in a good state after deployment (valid JSON on disk, API responsive, build succeeds).

All tests run in temp directories with no side effects on real data. No running server or real git repo is required for unit/integration tests.

---

## 2. Test Environment

| Component        | Tool / Setup                                                                      |
| ---------------- | --------------------------------------------------------------------------------- |
| Test runner      | `bun test` (Bun built-in)                                                         |
| Test file        | `admin/src/__tests__/hardening.test.ts`                                           |
| Temp directories | `os.tmpdir()` + unique subdirectory per test suite, cleaned up in `afterAll`      |
| Mock git         | Not needed — `hasConflictMarkers` works on file content, not git operations       |
| File I/O         | Real filesystem via `fs.writeFileSync` / `fs.readFileSync` into temp dirs         |
| JSON fixtures    | Inline strings written to temp files (conflict markers, invalid JSON, valid JSON) |
| Run command      | `cd admin && bun test src/__tests__/hardening.test.ts`                            |
| Build check      | `bun run build` from project root                                                 |

---

## 3. Unit Tests

### 3.1 data-io: readJson (T02)

| #   | Test Name                                                          | What It Verifies                            | Setup / Preconditions                                                       | Expected Result                                                                          | Priority |
| --- | ------------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| U01 | readJson throws DataCorruptionError with reason "conflict_markers" | Conflict marker detection before JSON parse | Write temp file containing `<<<<<<< HEAD` and `>>>>>>> origin/main` markers | Throws `DataCorruptionError` with `reason === "conflict_markers"` and correct `filePath` | P0       |
| U02 | readJson throws DataCorruptionError with reason "invalid_json"     | Malformed JSON detection                    | Write temp file with `{not valid json}}}`                                   | Throws `DataCorruptionError` with `reason === "invalid_json"`, `cause` is a SyntaxError  | P0       |
| U03 | readJson throws DataCorruptionError with reason "file_not_found"   | Missing file handling                       | No file at the given path                                                   | Throws `DataCorruptionError` with `reason === "file_not_found"`                          | P0       |
| U04 | readJson parses valid JSON array                                   | Happy path                                  | Write temp file with `[{"name":"test","slug":"s1"}]`                        | Returns parsed array matching input                                                      | P0       |
| U05 | readJson parses valid JSON object                                  | Happy path for settings                     | Write temp file with `{"whatsappUrl":"https://wa.me/123"}`                  | Returns parsed object                                                                    | P1       |
| U06 | readJson detects only opening conflict marker                      | Partial conflict marker                     | Write temp file with `<<<<<<< HEAD\n{"a":1}` (no closing marker)            | Throws `DataCorruptionError` with `reason === "conflict_markers"`                        | P1       |
| U07 | readJson detects only closing conflict marker                      | Partial conflict marker                     | Write temp file with `{"a":1}\n>>>>>>> origin/main`                         | Throws `DataCorruptionError` with `reason === "conflict_markers"`                        | P1       |

### 3.2 data-io: readJsonSafe (T02)

| #   | Test Name                                          | What It Verifies        | Setup / Preconditions                 | Expected Result                                 | Priority |
| --- | -------------------------------------------------- | ----------------------- | ------------------------------------- | ----------------------------------------------- | -------- |
| U08 | readJsonSafe returns fallback for conflict markers | Fallback on corruption  | Write temp file with conflict markers | Returns the provided fallback value (e.g. `[]`) | P0       |
| U09 | readJsonSafe returns fallback for invalid JSON     | Fallback on parse error | Write temp file with `{broken`        | Returns fallback                                | P0       |
| U10 | readJsonSafe returns fallback for missing file     | Fallback on ENOENT      | No file at path                       | Returns fallback                                | P1       |
| U11 | readJsonSafe returns parsed data for valid file    | Happy path              | Write valid JSON to temp file         | Returns parsed data, not fallback               | P0       |

### 3.3 data-io: validateJson (T02)

| #   | Test Name                                       | What It Verifies             | Setup / Preconditions              | Expected Result | Priority |
| --- | ----------------------------------------------- | ---------------------------- | ---------------------------------- | --------------- | -------- |
| U12 | validateJson returns false for conflict markers | Validation catches conflicts | Temp file with conflict markers    | Returns `false` | P0       |
| U13 | validateJson returns false for invalid JSON     | Validation catches bad JSON  | Temp file with `}}}`               | Returns `false` | P0       |
| U14 | validateJson returns false for missing file     | Validation catches ENOENT    | No file at path                    | Returns `false` | P1       |
| U15 | validateJson returns true for valid JSON        | Happy path                   | Temp file with `[{"slug":"test"}]` | Returns `true`  | P0       |

### 3.4 data-io: writeJson (T02)

| #   | Test Name                                    | What It Verifies         | Setup / Preconditions | Expected Result                                              | Priority |
| --- | -------------------------------------------- | ------------------------ | --------------------- | ------------------------------------------------------------ | -------- |
| U16 | writeJson writes valid JSON that round-trips | Write + read consistency | Temp directory exists | File written, `readJson` on same path returns identical data | P0       |
| U17 | writeJson output ends with newline           | File formatting          | Temp directory exists | File content ends with `\n`                                  | P2       |

### 3.5 git-persist: hasConflictMarkers (T01)

| #   | Test Name                                         | What It Verifies    | Setup / Preconditions                             | Expected Result | Priority |
| --- | ------------------------------------------------- | ------------------- | ------------------------------------------------- | --------------- | -------- |
| U18 | hasConflictMarkers detects opening markers        | `<<<<<<<` detection | Temp file with `<<<<<<< HEAD` embedded in content | Returns `true`  | P0       |
| U19 | hasConflictMarkers detects closing markers        | `>>>>>>>` detection | Temp file with `>>>>>>> origin/main` embedded     | Returns `true`  | P0       |
| U20 | hasConflictMarkers returns false for clean JSON   | No false positives  | Temp file with valid JSON                         | Returns `false` | P0       |
| U21 | hasConflictMarkers returns false for missing file | Graceful ENOENT     | No file at path                                   | Returns `false` | P1       |
| U22 | hasConflictMarkers returns false for empty file   | Edge case           | Temp file with empty string                       | Returns `false` | P2       |

### 3.6 DataCorruptionError class (T02)

| #   | Test Name                                       | What It Verifies     | Setup / Preconditions                | Expected Result                                            | Priority |
| --- | ----------------------------------------------- | -------------------- | ------------------------------------ | ---------------------------------------------------------- | -------- |
| U23 | DataCorruptionError has correct name            | Error class identity | Instantiate with filePath and reason | `error.name === "DataCorruptionError"`                     | P1       |
| U24 | DataCorruptionError exposes filePath and reason | Error metadata       | Instantiate with filePath and reason | `error.filePath` and `error.reason` match constructor args | P1       |
| U25 | DataCorruptionError preserves cause             | Error chaining       | Instantiate with a cause Error       | `error.cause` is the original error                        | P2       |
| U26 | DataCorruptionError is instanceof Error         | Inheritance          | Instantiate                          | `error instanceof Error === true`                          | P2       |

---

## 4. Integration Tests

| #   | Test Name                                                                                         | What It Verifies                    | Setup / Preconditions                                                                                                                                                                         | Expected Result                                                                                    | Priority |
| --- | ------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| I01 | Corrupted JSON triggers DataCorruptionError through readJson, caught by safeHandleRequest pattern | End-to-end: corruption to API error | 1. Write conflict-marker JSON to temp file. 2. Call `readJson` on it. 3. Verify the error is `DataCorruptionError`. 4. Verify a handler catching it can produce a 503-shaped response object. | Error has `reason === "conflict_markers"`, response shape has `error`, `detail`, `recovery` fields | P0       |
| I02 | Backup restoration flow: .bak file used when primary is corrupted                                 | Backup preference logic             | 1. Write corrupted JSON to temp `collections.json`. 2. Write valid JSON to `collections.json.bak`. 3. Simulate the self-heal logic (validateJson + copyFileSync).                             | Primary file overwritten with backup content; `readJson` succeeds on primary                       | P0       |
| I03 | Self-heal strips conflict markers when no backup exists                                           | Conflict stripping fallback         | 1. Write JSON with conflict markers (ours side is valid JSON). 2. No `.bak` file. 3. Run the conflict-stripping regex logic.                                                                  | Stripped content is valid JSON; `JSON.parse` succeeds                                              | P0       |
| I04 | Self-heal falls back to default when stripping fails                                              | Last-resort default                 | 1. Write a file with conflict markers where neither side is valid JSON alone. 2. No `.bak` file. 3. Run self-heal logic.                                                                      | File is replaced with default value (e.g. `[]` for collections)                                    | P0       |
| I05 | Tokens migration adds missing tokens field                                                        | Data migration                      | 1. Write valid JSON array where objects lack `tokens` field. 2. Run migration logic (read, check, write).                                                                                     | Each object in result has `tokens: []`; file on disk is updated                                    | P1       |
| I06 | Tokens migration is idempotent                                                                    | No unnecessary writes               | 1. Write valid JSON where all objects already have `tokens: []`. 2. Run migration logic.                                                                                                      | `dirty` flag remains `false`; file is not rewritten                                                | P1       |
| I07 | readJsonSafe + writeJson round-trip after recovery                                                | Full cycle                          | 1. First read with `readJsonSafe` returns fallback. 2. Write fallback using `writeJson`. 3. `readJson` on same file succeeds.                                                                 | Data is consistent through the full cycle                                                          | P1       |

---

## 5. Edge Cases

| #   | Test Name                                        | What It Verifies             | Setup / Preconditions                                                                                               | Expected Result                                                                                                 | Priority |
| --- | ------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| E01 | Empty JSON file                                  | Zero-byte file handling      | Write empty file (0 bytes) to temp path                                                                             | `readJson` throws `DataCorruptionError` with `reason === "invalid_json"`; `validateJson` returns `false`        | P0       |
| E02 | JSON file with only whitespace                   | Whitespace-only content      | Write `"   \n\n  "` to temp file                                                                                    | `readJson` throws `DataCorruptionError` with `reason === "invalid_json"`                                        | P1       |
| E03 | JSON file with BOM marker                        | UTF-8 BOM prefix             | Write `\uFEFF[{"slug":"test"}]` to temp file                                                                        | Either parses correctly or throws identifiable error (not a crash)                                              | P2       |
| E04 | Very large JSON file (>1MB)                      | Performance / no timeout     | Generate a JSON array with 10,000 collection objects, write to temp                                                 | `readJson` succeeds within reasonable time (<2s); `validateJson` returns `true`                                 | P2       |
| E05 | Conflict markers embedded in a JSON string value | False positive check         | Write `[{"description":"Use <<<<<<< for arrows"}]` — markers inside a string value                                  | Ideally this is valid JSON; however current implementation will flag it. Document as known limitation.          | P2       |
| E06 | Concurrent reads during self-heal                | Race condition safety        | Not easily testable in unit tests. Document that self-heal runs synchronously at startup before `Bun.serve` starts. | No race condition possible — startup is sequential                                                              | P1       |
| E07 | Backup file is also corrupted                    | Double corruption            | Write corrupted JSON to both primary and `.bak` file                                                                | Self-heal skips backup (`validateJson(bakPath)` returns false), falls through to stripping/default              | P0       |
| E08 | Backup file exists but is empty                  | Zero-byte backup             | Write corrupted primary; write empty `.bak`                                                                         | Self-heal skips backup, falls through to stripping/default                                                      | P1       |
| E09 | Partial write (truncated JSON)                   | Simulated crash during write | Write `[{"slug":"test"},{"slug":"oth` (truncated mid-object)                                                        | `readJson` throws `DataCorruptionError` with `reason === "invalid_json"`                                        | P1       |
| E10 | Nested conflict markers                          | Multiple conflict blocks     | Write JSON with two separate conflict marker blocks                                                                 | `hasConflictMarkers` returns `true`; self-heal stripping handles both blocks                                    | P1       |
| E11 | settings.json missing entirely                   | Fresh deploy / deleted file  | No file at SETTINGS_JSON path, no `.bak` either                                                                     | Self-heal writes default `{"whatsappUrl":""}`                                                                   | P0       |
| E12 | Read-only file permissions                       | Permission denied            | Write corrupted file, set read-only                                                                                 | Self-heal or writeJson throws an error that is caught (not an unhandled crash). Log indicates permission issue. | P2       |

---

## 6. Smoke Tests

These are quick health checks to run in production or staging after deployment.

| #   | Test Name                                  | What It Verifies      | How to Run                                                                              | Expected Result                                                                  | Priority |
| --- | ------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------- |
| S01 | collections.json is valid JSON             | No corruption on disk | `node -e "JSON.parse(require('fs').readFileSync('src/data/collections.json','utf-8'))"` | Exits 0, no error                                                                | P0       |
| S02 | testimonials.json is valid JSON            | No corruption on disk | Same pattern for `src/data/testimonials.json`                                           | Exits 0                                                                          | P0       |
| S03 | settings.json is valid JSON                | No corruption on disk | Same pattern for `src/data/settings.json`                                               | Exits 0                                                                          | P0       |
| S04 | No conflict markers in any JSON file       | Merge safety          | `grep -rl "<<<<<<< " src/data/*.json` returns empty                                     | No matches found (exit code 1)                                                   | P0       |
| S05 | `bun run build` succeeds                   | Build resilience      | `bun run build` from project root                                                       | Exit code 0; `dist/` directory contains `index.html`                             | P0       |
| S06 | Admin API responds to GET /api/collections | Server health         | `curl -s http://localhost:3001/api/collections`                                         | Returns HTTP 200 with JSON array, or 503 with structured error (never 500 crash) | P0       |
| S07 | Admin API responds to GET /api/health      | Server health         | `curl -s http://localhost:3001/api/health`                                              | Returns HTTP 200                                                                 | P1       |
| S08 | Admin TypeScript compiles                  | Type safety           | `cd admin && bun tsc --noEmit`                                                          | Exit code 0, no type errors                                                      | P0       |
| S09 | Test suite passes                          | Regression gate       | `cd admin && bun test`                                                                  | All tests pass, exit code 0                                                      | P0       |

---

## 7. Coverage Matrix

This table maps each Global Acceptance Criterion (from F19-README.md) to the test cases that verify it.

| Global AC | Description                                                                  | Test Cases                                                                         | Covered? |
| --------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- |
| **GAC-1** | `bun run build` succeeds even when `collections.json` is malformed           | S05, plus manual test: corrupt `collections.json` then `bun run build` (T03 scope) | Yes      |
| **GAC-2** | All `/api/*` endpoints return structured JSON errors (never crash)           | I01, S06, S07                                                                      | Yes      |
| **GAC-3** | `fetchAndRebase()` detects merge conflicts and restores from backup          | U18, U19, U20, U21, I02                                                            | Yes      |
| **GAC-4** | `readJson()` validates JSON and detects conflict markers                     | U01, U02, U03, U04, U05, U06, U07                                                  | Yes      |
| **GAC-5** | Server startup auto-heals corrupted JSON and migrates missing `tokens` field | I02, I03, I04, I05, I06, E07, E08, E11                                             | Yes      |
| **GAC-6** | Smoke tests cover all hardening scenarios                                    | S01-S09, plus the full unit/integration suite (U01-U26, I01-I07)                   | Yes      |

### Per-Task Coverage Summary

| Task                                                 | Scope             | Unit Tests          | Integration Tests | Edge Cases        | Smoke Tests |
| ---------------------------------------------------- | ----------------- | ------------------- | ----------------- | ----------------- | ----------- |
| **T01** — fetchAndRebase conflict detection + backup | git-persist.ts    | U18-U22             | I02               | E07, E08, E10     | S04         |
| **T02** — JSON validation in data-io                 | data-io.ts        | U01-U17, U23-U26    | I01, I07          | E01-E05, E09, E12 | S01-S03     |
| **T03** — Harden vite sitemap plugin                 | vite.config.ts    | (manual/build test) | —                 | —                 | S05         |
| **T04** — API try/catch wrapper                      | server.ts         | —                   | I01               | —                 | S06, S07    |
| **T05** — Startup self-heal + migration              | server.ts         | —                   | I02-I06           | E06-E08, E10, E11 | S01-S03     |
| **T06** — Smoke test file                            | hardening.test.ts | U01-U26             | I01-I07           | E01-E12           | S08, S09    |

---

### Priority Summary

| Priority | Count | Description                              |
| -------- | ----- | ---------------------------------------- |
| **P0**   | 27    | Must-have — blocks release if failing    |
| **P1**   | 15    | Should-have — important but non-blocking |
| **P2**   | 10    | Nice-to-have — edge cases and polish     |
