# F13 Auto-persist — QA Report

**Date:** 2026-11-18
**Agent:** QA
**Verdict:** PASS

---

## 1. All 12 endpoints have gitPersist calls

| #   | Endpoint                                       | Line | Description             | Status |
| --- | ---------------------------------------------- | ---- | ----------------------- | ------ |
| 1   | POST /api/collections                          | 309  | Criar colecao           | OK     |
| 2   | PUT /api/collections/:slug                     | 347  | Editar colecao          | OK     |
| 3   | DELETE /api/collections/:slug                  | 354  | Remover colecao         | OK     |
| 4   | POST /api/collections/:slug/cover              | 386  | Atualizar capa          | OK     |
| 5   | POST /api/collections/:slug/manual             | 415  | Upload manual           | OK     |
| 6   | PUT /api/collections/:slug/images/reorder      | 443  | Reordenar imagens       | OK     |
| 7   | DELETE /api/collections/:slug/images/:filename | 477  | Remover imagem          | OK     |
| 8   | POST /api/collections/:slug/images             | 553  | Upload amostras         | OK     |
| 9   | POST /api/testimonials                         | 578  | Adicionar depoimento    | OK     |
| 10  | PUT /api/testimonials/:idx                     | 602  | Editar depoimento       | OK     |
| 11  | DELETE /api/testimonials/:idx                  | 609  | Remover depoimento      | OK     |
| 12  | PUT /api/settings                              | 625  | Atualizar configuracoes | OK     |

Additional calls:

- Line 636: POST /api/persist-retry (retry trigger) — OK
- Line 657: POST /api/publish (await gitPersist, reused helper) — OK
- Line 17: import statement — OK

**Total references: 15 (12 mutations + 1 retry + 1 publish + 1 import). Matches expectation.**

---

## 2. gitPersist helper correctness

| Check                                                | Status | Detail                                                                                                                     |
| ---------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Uses execFileSync (not execSync)                     | PASS   | Line 1 imports `execFileSync`, line 55 uses `execFileSync("git", args, ...)` with array args — no shell injection possible |
| Serial queue via promise chain                       | PASS   | `queue = queue.then(() => doGitPersist(...)).catch(...)` on line 28 chains every call sequentially                         |
| State transitions clean->dirty->pushing->clean/error | PASS   | Line 74 sets "dirty", line 106 sets "pushing", line 140 sets "clean" on success, line 153 sets "error" on failure          |
| safeDesc sanitizes commit messages                   | PASS   | Line 60 strips shell-special chars (``"`$\``) and truncates to 200 chars                                                   |
| GITHUB_TOKEN scrubbed from errors                    | PASS   | Line 150-152 uses `replaceAll` to replace token with `***` in error messages                                               |

---

## 3. New endpoints

| Endpoint                | Status | Detail                                                                                       |
| ----------------------- | ------ | -------------------------------------------------------------------------------------------- |
| GET /api/persist-status | PASS   | Line 631-632: Returns `{ state, error }` from `getPersistState()` and `getLastError()`       |
| POST /api/persist-retry | PASS   | Line 635-638: Calls `gitPersist("Retry: re-push pending changes")` and returns current state |

---

## 4. Publish refactor

| Check                                    | Status | Detail                                                                                                                             |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Uses `await gitPersist("Publicar site")` | PASS   | Line 657 — awaited (unlike fire-and-forget mutation calls)                                                                         |
| Build step preserved                     | PASS   | Line 650: `execSync("bun run build", ...)` still runs before gitPersist                                                            |
| Error handling preserved                 | PASS   | Lines 659-684: Checks `result.committed`, `result.pushed`, `result.error` with appropriate step messages and 500 response on error |

No inline git logic remains in the publish endpoint — fully delegated to gitPersist.

---

## 5. Banner UI

| Check                              | Status | Detail                                                                                                                                                                          |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banner between header and tab bar  | PASS   | Lines 605-616: `#persist-banner` div sits between `</header>` and `<!-- Tabs -->`                                                                                               |
| Hidden when clean                  | PASS   | Line 2412: `banner.classList.add("hidden")`                                                                                                                                     |
| Yellow when dirty                  | PASS   | Line 2425: `bg-yellow-900/30, border-yellow-700/40, text-yellow-300`                                                                                                            |
| Blue when pushing                  | PASS   | Line 2431: `bg-blue-900/30, border-blue-700/40, text-blue-300`                                                                                                                  |
| Red when error                     | PASS   | Line 2437: `bg-red-900/30, border-red-700/40, text-red-300`                                                                                                                     |
| Retry button visible only in error | PASS   | Lines 2428, 2434 hide retry; line 2440 shows it only for error state                                                                                                            |
| Non-dismissable in error           | PASS   | No close/dismiss button on persist-banner. The only way to clear it is a successful push. No `onclick` to hide/close the banner.                                                |
| Polling 3s when not clean          | PASS   | Lines 2429, 2435, 2441: `schedulePersistPoll(3000)` for dirty/pushing/error                                                                                                     |
| Polling 15s when clean             | PASS   | Line 2414: `schedulePersistPoll(15000)` for clean state                                                                                                                         |
| checkPersistStatus after mutations | PASS   | Line 854-857: `apiFetch` hook calls `checkPersistStatus()` with 500ms delay after successful mutation methods                                                                   |
| visibilitychange listener          | PASS   | Lines 2464-2466: `document.addEventListener("visibilitychange", ...)` calls `checkPersistStatus()` when page becomes visible. Polling skips when `document.hidden` (line 2459). |

---

## 6. Governance compliance (Saruman G-20261117-001)

| Condition                                        | Status | Evidence                                                                                             |
| ------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------- |
| Serial queue (no concurrent git ops)             | PASS   | Promise chain in `git-persist.ts` line 28 ensures all calls are serialized                           |
| Push failures show user-visible error with retry | PASS   | Error state shows red banner with "Tentar novamente" button (lines 2437-2441, 2445-2453)             |
| Banner non-dismissable until push succeeds       | PASS   | No dismiss/close mechanism on the persist banner. Only `updatePersistBanner("clean", ...)` hides it. |

---

## 7. Build verification

```
$ bun run build
vite v8.3.8 building client environment for production...
1832 modules transformed.
dist/index.html                   1.35 kB
dist/assets/index-CczZZlQ9.css   30.71 kB
dist/assets/index-B_CHvVeM.js   383.09 kB
Built in 445ms
```

**Build: PASS** — no errors, no warnings.

---

## Issues found

None. All checklist items pass.

---

## Summary

Feature F13 (Auto-persist admin changes to git) is correctly implemented. The gitPersist helper uses `execFileSync` with array arguments (safe from shell injection), implements a serial promise queue, tracks four states, and scrubs tokens from error messages. All 12 mutation endpoints call gitPersist. The publish endpoint was successfully refactored to reuse the helper. The admin UI banner correctly reflects all four states with appropriate colors, polling intervals, and non-dismissable error behavior. All three Saruman governance conditions are satisfied. The site builds cleanly.
