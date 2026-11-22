import { execFileSync } from "child_process";
import { PROJECT_ROOT } from "./paths.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PersistState = "clean" | "dirty" | "pushing" | "error";
export type PersistResult = {
  committed: boolean;
  pushed: boolean;
  error?: string;
  retries?: number;
};

export type PersistOp = {
  description: string;
  timestamp: string;
  committed: boolean;
  pushed: boolean;
  error?: string;
  retries?: number;
};

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let state: PersistState = "clean";
let lastError: string | null = null;
let queue: Promise<PersistResult> = Promise.resolve({ committed: false, pushed: false });
const recentOps: PersistOp[] = [];
const MAX_RECENT = 10;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Queue a git add + commit + push for all mutable data paths.
 * Calls are serialised — no two git operations run concurrently.
 */
export function gitPersist(description: string): Promise<PersistResult> {
  queue = queue
    .then(() => doGitPersist(description))
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      state = "error";
      lastError = sanitize(msg);
      log("ERROR", description, lastError);
      const result: PersistResult = { committed: false, pushed: false, error: lastError };
      recordOp(description, result);
      return result;
    });
  return queue;
}

/** Current state of the persist pipeline. */
export function getPersistState(): PersistState {
  return state;
}

/** Last error message, or null when state !== "error". */
export function getLastError(): string | null {
  return lastError;
}

/** Recent operations (most recent first, max 10). */
export function getRecentOps(): PersistOp[] {
  return [...recentOps];
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function sanitize(text: string): string {
  if (!process.env.GITHUB_TOKEN) return text;
  return text.replaceAll(process.env.GITHUB_TOKEN, "***");
}

function log(level: "INFO" | "ERROR", ...parts: string[]): void {
  const ts = new Date().toISOString();
  const msg = `[git-persist] [${ts}] ${parts.join(" | ")}`;
  if (level === "ERROR") {
    console.error(msg);
  } else {
    console.log(msg);
  }
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

function recordOp(description: string, result: PersistResult): void {
  const op: PersistOp = {
    description,
    timestamp: new Date().toISOString(),
    committed: result.committed,
    pushed: result.pushed,
    error: result.error,
    retries: result.retries,
  };
  recentOps.unshift(op);
  if (recentOps.length > MAX_RECENT) recentOps.pop();
}

// ---------------------------------------------------------------------------
// Internal implementation
// ---------------------------------------------------------------------------

const GIT_OPTS = { cwd: PROJECT_ROOT, encoding: "utf-8" as const, stdio: "pipe" as const };

/** Run git with array args — avoids shell injection. */
function git(...args: string[]): string {
  return execFileSync("git", args, GIT_OPTS).trim();
}

/** Sanitize description for commit message (strip shell-special chars). */
function safeDesc(desc: string): string {
  return desc.replace(/["`$\\]/g, "").slice(0, 200);
}

const FILES_TO_ADD = [
  "src/data/collections.json",
  "src/data/testimonials.json",
  "src/data/settings.json",
  "public/images/covers/",
  "public/images/decks/",
  "public/images/tokens/",
  "public/manuals/",
  "public/videos/decks/",
];

// ---------------------------------------------------------------------------
// Retry logic
// ---------------------------------------------------------------------------

const MAX_PUSH_RETRIES = 3;
const BACKOFF_BASE_MS = 1000; // 1s, 3s, 9s

function isTransientError(err: unknown): boolean {
  const msg = String(err).toLowerCase();
  return (
    msg.includes("could not resolve host") ||
    msg.includes("connection timed out") ||
    msg.includes("connection reset") ||
    msg.includes("tls") ||
    msg.includes("ssl") ||
    msg.includes("fetch first") ||
    msg.includes("non-fast-forward") ||
    msg.includes("failed to connect") ||
    msg.includes("network is unreachable") ||
    msg.includes("name or service not known")
  );
}

function isAuthError(err: unknown): boolean {
  const msg = String(err).toLowerCase();
  return (
    msg.includes("authentication failed") ||
    msg.includes("401") ||
    msg.includes("403") ||
    msg.includes("permission denied") ||
    msg.includes("invalid credentials")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchAndRebase(): void {
  try {
    git("fetch", "origin", "main");
    const behind = git("rev-list", "--count", "HEAD..origin/main");
    if (behind !== "0") {
      try {
        git("rebase", "origin/main");
      } catch {
        try {
          git("rebase", "--abort");
        } catch {
          /* ignore */
        }
        git("pull", "--no-rebase", "origin", "main");
      }
    }
  } catch {
    /* fetch failed (offline / no remote) — continue */
  }
}

async function pushWithRetry(
  authedUrl: string,
): Promise<{ pushed: boolean; retries: number; error?: string }> {
  for (let attempt = 1; attempt <= MAX_PUSH_RETRIES; attempt++) {
    log("INFO", `PUSH attempt ${attempt}/${MAX_PUSH_RETRIES}`);

    try {
      git("push", authedUrl, "main");
      log("INFO", "PUSH OK");
      return { pushed: true, retries: attempt - 1 };
    } catch (err: unknown) {
      const detail = extractErrorDetail(err);

      if (isAuthError(err)) {
        log("ERROR", `PUSH FAILED (auth, no retry)`, detail);
        return { pushed: false, retries: attempt - 1, error: detail };
      }

      if (attempt < MAX_PUSH_RETRIES && isTransientError(err)) {
        const delayMs = BACKOFF_BASE_MS * Math.pow(3, attempt - 1);
        log("INFO", `PUSH FAILED (transient)`, detail, `RETRY in ${delayMs}ms`);
        await sleep(delayMs);
        fetchAndRebase();
        continue;
      }

      log("ERROR", `PUSH FAILED (attempt ${attempt}/${MAX_PUSH_RETRIES})`, detail);
      return { pushed: false, retries: attempt - 1, error: detail };
    }
  }

  return { pushed: false, retries: MAX_PUSH_RETRIES, error: "Max retries exceeded" };
}

function extractErrorDetail(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const stderr =
    err && typeof err === "object" && "stderr" in err
      ? String((err as { stderr: unknown }).stderr).trim()
      : "";
  const raw = stderr ? `${msg} — ${stderr}` : msg;
  return sanitize(raw);
}

// ---------------------------------------------------------------------------
// Main persist flow
// ---------------------------------------------------------------------------

async function doGitPersist(description: string): Promise<PersistResult> {
  log("INFO", "START", description);

  state = "dirty";
  lastError = null;

  ensureOnMain();

  for (const f of FILES_TO_ADD) {
    try {
      git("add", f);
    } catch {
      /* file/dir may not exist yet — skip silently */
    }
  }

  const diff = git("diff", "--cached", "--name-only");
  if (!diff) {
    log("INFO", "SKIP", "no staged changes");
    state = "clean";
    const result: PersistResult = { committed: false, pushed: false };
    recordOp(description, result);
    return result;
  }

  log("INFO", "STAGED", diff.split("\n").join(", "));

  git("commit", "-m", `Auto-save: ${safeDesc(description)}`);
  const hash = git("rev-parse", "--short", "HEAD");
  log("INFO", "COMMITTED", hash);

  state = "pushing";

  fetchAndRebase();

  const authedUrl = getAuthedRemoteUrl();
  const pushResult = await pushWithRetry(authedUrl);

  if (pushResult.pushed) {
    state = "clean";
    const result: PersistResult = { committed: true, pushed: true, retries: pushResult.retries };
    recordOp(description, result);
    return result;
  }

  state = "error";
  lastError = pushResult.error || "Push failed";
  const result: PersistResult = {
    committed: true,
    pushed: false,
    error: pushResult.error,
    retries: pushResult.retries,
  };
  recordOp(description, result);
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Switch from detached HEAD to main branch without reverting the working directory. */
function ensureOnMain(): void {
  try {
    const branch = git("rev-parse", "--abbrev-ref", "HEAD");
    if (branch !== "HEAD") return;

    log("INFO", "DETACHED HEAD detected, switching to main");

    try {
      git("fetch", "origin", "main");
    } catch {
      /* offline */
    }

    try {
      git("checkout", "-B", "main", "origin/main");
    } catch {
      git("checkout", "-B", "main");
    }

    log("INFO", "Now on main branch");
  } catch {
    /* ignore — best-effort */
  }
}

/** Build authenticated remote URL for push. */
function getAuthedRemoteUrl(): string {
  if (!process.env.GITHUB_TOKEN) return "origin";

  let remoteUrl = "";
  try {
    remoteUrl = git("remote", "get-url", "origin");
  } catch {
    const repo = process.env.GITHUB_REPO || "https://github.com/eduardodidio/forja-serafim.git";
    git("remote", "add", "origin", repo);
    remoteUrl = repo;
  }

  return remoteUrl.startsWith("https://") && !remoteUrl.includes("@")
    ? remoteUrl.replace("https://", `https://x-access-token:${process.env.GITHUB_TOKEN}@`)
    : remoteUrl;
}
