# F22 — Tech Lead Review

**Verdict:** APPROVED
**Date:** 2026-11-23

## Changes Reviewed

### `public/images/verso.jpg` (new asset)

- 612KB JPEG — card back with Forja Serafim branding
- Served statically, preloaded when lightbox opens

### `src/components/lightbox.tsx` (modified)

- Added `flipped` state toggled on card click
- Reset flip on card navigation (prev/next)
- CSS 3D flip: `rotateY(180deg)` with `preserve-3d` + `backfaceVisibility: hidden`
- 600ms `cubic-bezier(0.4, 0.0, 0.2, 1)` transition — organic feel
- Preloads card back alongside adjacent images
- Flip hint icon (RotateCw) in bottom-right corner

## Issues Found & Fixed

- Missing `position: relative` on outer flip container — hint icon would float to wrong position. Fixed by adding `relative` class.

## Quality

- Build: PASS
- Lint: PASS
- No new dependencies (lucide-react already in project)
- Art protection maintained: right-click blocked, pointer-events none, draggable false on verso too
