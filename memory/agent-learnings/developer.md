# Developer Learnings

(QA appends to this file at the end of every feature retrospective.)

## F14 -- 2026-11-18

**What worked:** Mirroring the existing deck image upload pattern (tmp-file + sharp + finally cleanup) for cover uploads reduced design risk and kept code consistent across endpoints.

**What to avoid:** (1) When copying code blocks from existing endpoints, check whether dynamic imports (e.g., `await import("fs")`) are actually needed or if the module is already statically imported in scope. Add to the static import instead. (2) Always wrap sharp/image processing calls in a try/catch that returns a structured JSON error response -- do not rely on the framework's default 500 handler, which produces opaque errors the frontend cannot parse.

**Pattern to repeat:** Serve-time cache-bust injection (read mtime from disk, inject `?v=<mtime>` in GET response, persist only clean paths) keeps committed data clean while ensuring browsers get fresh assets.
