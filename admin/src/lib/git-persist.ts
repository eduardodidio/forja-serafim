import { execFileSync } from "child_process";
import { PROJECT_ROOT } from "./paths.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PersistState = "clean" | "dirty" | "pushing" | "error";
export type PersistResult = { committed: boolean; pushed: boolean; error?: string };

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let state: PersistState = "clean";
let lastError: string | null = null;
let queue: Promise<PersistResult> = Promise.resolve({ committed: false, pushed: false });

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Queue a git add + commit + push for all mutable data paths.
 * Calls are serialised — no two git operations run concurrently.
 */
export function gitPersist(description: string): Promise<PersistResult> {
  queue = queue.then(() => doGitPersist(description)).catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    state = "error";
    lastError = msg;
    return { committed: false, pushed: false, error: msg };
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
  "public/manuals/",
];

async function doGitPersist(description: string): Promise<PersistResult> {
  // --- Stage ---
  state = "dirty";
  lastError = null;

  // Ensure we are on main (handle detached HEAD on Render)
  ensureOnMain();

  for (const f of FILES_TO_ADD) {
    try {
      git("add", f);
    } catch {
      /* file/dir may not exist yet — skip silently */
    }
  }

  // --- Check for staged changes ---
  const diff = git("diff", "--cached", "--name-only");
  if (!diff) {
    state = "clean";
    return { committed: false, pushed: false };
  }

  // --- Commit ---
  git("commit", "-m", `Auto-save: ${safeDesc(description)}`);

  // --- Push ---
  state = "pushing";

  try {
    // Fetch + rebase to handle diverged history (e.g. code push between deploys)
    try {
      git("fetch", "origin", "main");
      const behind = git("rev-list", "--count", "HEAD..origin/main");
      if (behind !== "0") {
        try {
          git("rebase", "origin/main");
        } catch {
          // Rebase conflict — abort and try merge
          try { git("rebase", "--abort"); } catch { /* ignore */ }
          git("pull", "--no-rebase", "origin", "main");
        }
      }
    } catch {
      /* fetch failed (offline / no remote) — try push anyway */
    }

    const authedUrl = getAuthedRemoteUrl();
    git("push", authedUrl, "main");

    state = "clean";
    return { committed: true, pushed: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const stderr =
      err && typeof err === "object" && "stderr" in err
        ? String((err as { stderr: unknown }).stderr).trim()
        : "";
    // Scrub GITHUB_TOKEN from error messages
    const raw = stderr ? `${msg} — ${stderr}` : msg;
    const detail = process.env.GITHUB_TOKEN
      ? raw.replaceAll(process.env.GITHUB_TOKEN, "***")
      : raw;
    state = "error";
    lastError = detail;
    return { committed: true, pushed: false, error: detail };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Switch from detached HEAD to main branch without reverting the working directory. */
function ensureOnMain(): void {
  try {
    const branch = git("rev-parse", "--abbrev-ref", "HEAD");
    if (branch !== "HEAD") return; // already on a branch

    // Fetch latest origin/main so we don't reset main to an old commit
    try { git("fetch", "origin", "main"); } catch { /* offline */ }

    // If origin/main exists, start main there and merge local changes
    try {
      // Create/reset main at origin/main (working-dir safe: only moves branch pointer)
      git("checkout", "-B", "main", "origin/main");
    } catch {
      // No origin/main — just create main at current HEAD
      git("checkout", "-B", "main");
    }
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
    const repo =
      process.env.GITHUB_REPO || "https://github.com/eduardodidio/forja-serafim.git";
    git("remote", "add", "origin", repo);
    remoteUrl = repo;
  }

  return remoteUrl.startsWith("https://") && !remoteUrl.includes("@")
    ? remoteUrl.replace("https://", `https://x-access-token:${process.env.GITHUB_TOKEN}@`)
    : remoteUrl;
}
