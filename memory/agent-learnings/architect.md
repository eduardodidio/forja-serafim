# Architect Learnings

(QA appends to this file at the end of every feature retrospective.)

## F14 -- 2026-11-18

**What worked:** Decomposing the bugfix into waves (pure function -> consumers -> data cleanup) created a clean dependency chain with no conflicts between parallel tasks.

**What to avoid:** When writing task ACs for image processing endpoints, always include an explicit criterion for error handling: "endpoint returns a structured JSON error (not opaque 500) when image processing fails." This was missed in F14-T02 and flagged by Tech Lead review.

**Pattern to repeat:** For any mutable asset that needs cache-busting, specify the "serve-time injection" pattern in the architecture: persist clean paths, inject `?v=<mtime>` only in API responses. Include a startup sanitiser task to clean legacy data.
