# Tech Lead Review -- F16 cover-bug

**Reviewed:** 2026-11-18
**Verdict:** APPROVED

## Summary

F16 adds build-time cache-busting to all user-visible collection images in the front-end. The approach is sound, the implementation is minimal and correct, and the investigation documented in T01-T04 is thorough.

## Findings

### 1. Architecture -- PASS

The build-time timestamp approach (`VITE_BUILD_TS` via Vite `define`) is the right choice for a static site. Each `bun run build` produces a new timestamp that gets inlined into the JS bundle, making every deploy bust all image caches automatically. The persisted JSON on disk remains clean (no `?v=` params), consistent with the serve-time cache-bust pattern already used in the admin API.

The `define` block in `vite.config.ts` (line 7-9) correctly uses `JSON.stringify(String(Date.now()))`, which produces a string literal that Vite substitutes at build time. No runtime overhead.

### 2. Code quality -- PASS

`src/lib/cache-bust.ts` is minimal (7 lines), handles edge cases correctly:
- Returns URL unchanged if `url` is falsy or `BUILD_TS` is empty (dev mode fallback)
- Correctly detects existing query params and uses `&` vs `?` separator
- No unnecessary abstractions

### 3. Security -- PASS

The appended `?v=<timestamp>` is a numeric string derived from `Date.now()` at build time. It is baked into the bundle as a string constant -- there is no user-controllable input that could lead to XSS or injection. The URL structure remains safe.

### 4. Completeness -- PASS (with minor note)

All user-visible image rendering paths are covered:

| Location | Image type | Cache-busted? |
|----------|-----------|---------------|
| `card-tile.tsx:52` | sampleImages (flip) + collection.image (fallback) | Yes |
| `colecoes.$slug.tsx:77` | Hero cover (`collection.image`) | Yes |
| `colecoes.$slug.tsx:60,105` | Sample images grid | Yes (via `bustedSampleImages`) |
| `colecoes.$slug.tsx:102` | Lightbox images prop | Yes (receives `bustedSampleImages`) |
| `lightbox.tsx:116` | Lightbox display `<img>` | Yes (inherits busted URLs from prop) |
| `lightbox.tsx:51` | Lightbox preload (`new Image()`) | Yes (same busted array) |

**Not cache-busted (by design -- correct):**
- OG/Twitter meta image tags (`seo.ts`, `colecoes.$slug.tsx:16`) -- These are absolute URLs consumed by social crawlers. Adding `?v=` would be counterproductive since crawlers interpret each unique URL as a different image, causing unnecessary re-crawling. These should remain stable.
- `index.tsx:67` hero image (`import hero from "@/assets/hero.jpg"`) -- This is a Vite-managed asset import, already content-hashed in the filename by Vite. No cache-bust needed.
- Logo images (`/images/logo-forja-serafim.jpg`) -- Static brand asset, not collection-dependent.
- Video URL (`collection.videoUrl`) -- Out of scope for this bug. If video cache-busting becomes needed, it can be addressed separately.

### 5. Regression risk -- LOW

- The `cacheBust()` function is additive (appends query param). It cannot break image loading.
- In dev mode, `VITE_BUILD_TS` falls back to empty string, so `cacheBust()` returns the original URL unchanged. No dev workflow impact.
- The function is pure with no side effects.

### 6. Investigation quality -- EXCELLENT

T01 and T02 systematically ruled out 5 of 6 hypotheses from the README with concrete evidence. The documentation in the task notes is clear and traceable. The root cause was correctly identified as browser/CDN caching due to unchanging image paths.

## Recommendations

None blocking. Two minor observations for future reference:

1. **TypeScript declaration for `VITE_BUILD_TS`**: Consider adding `VITE_BUILD_TS` to `src/vite-env.d.ts` (or an `env.d.ts`) under `ImportMetaEnv` for type safety. Currently it works because Vite's `define` performs literal substitution, but an explicit declaration would improve IDE support. Low priority.

2. **Video cache-busting**: If video upload via admin becomes common and users report stale videos, the same `cacheBust()` pattern can be applied to `collection.videoUrl`. Not needed now since video is a new feature (F15) with limited usage.
