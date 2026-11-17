/**
 * Re-watermark script for Forja Serafim
 *
 * Reprocesses all sample images from collections.json through processImage()
 * to apply the correct "Forja Serafim" watermark.
 *
 * Usage:
 *   bun run admin/src/scripts/rewatermark.ts            # process all images
 *   bun run admin/src/scripts/rewatermark.ts --dry-run   # list what would be processed
 */

import { readFileSync, mkdirSync, copyFileSync, unlinkSync, existsSync } from "fs";
import { resolve, basename } from "path";
import { processImage } from "../lib/image-processor.js";
import { PROJECT_ROOT, COLLECTIONS_JSON } from "../lib/paths.js";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

interface Collection {
  slug: string;
  name: string;
  sampleImages: string[];
}

const dryRun = process.argv.includes("--dry-run");

async function main(): Promise<void> {
  console.log(`[rewatermark] Starting${dryRun ? " (DRY RUN)" : ""}...`);
  console.log(`[rewatermark] Project root: ${PROJECT_ROOT}`);
  console.log(`[rewatermark] Collections JSON: ${COLLECTIONS_JSON}`);

  const collections: Collection[] = JSON.parse(readFileSync(COLLECTIONS_JSON, "utf-8"));

  console.log(`[rewatermark] Found ${collections.length} collections`);

  let processed = 0;
  let errors = 0;
  const tmpBase = resolve(tmpdir(), `rewatermark-${randomUUID()}`);

  if (!dryRun) {
    mkdirSync(tmpBase, { recursive: true });
  }

  try {
    for (const collection of collections) {
      console.log(`\n[rewatermark] Collection: ${collection.name} (${collection.slug})`);

      for (const imagePath of collection.sampleImages) {
        const filename = basename(imagePath);
        const absolutePath = resolve(PROJECT_ROOT, "public", imagePath.replace(/^\//, ""));

        if (dryRun) {
          console.log(`  [dry-run] Would process: ${absolutePath}`);
          processed++;
          continue;
        }

        if (!existsSync(absolutePath)) {
          console.error(`  [ERROR] File not found: ${absolutePath}`);
          errors++;
          continue;
        }

        const tmpPath = resolve(tmpBase, `${collection.slug}-${filename}`);

        try {
          // Copy current image to temp location as input source
          copyFileSync(absolutePath, tmpPath);

          // Reprocess with processImage (applies "Forja Serafim" watermark)
          await processImage(tmpPath, absolutePath);

          console.log(`  [OK] ${filename}`);
          processed++;
        } catch (err) {
          console.error(`  [ERROR] ${filename}: ${err}`);
          errors++;
        } finally {
          // Clean up temp file
          try {
            if (existsSync(tmpPath)) {
              unlinkSync(tmpPath);
            }
          } catch {
            // ignore cleanup errors
          }
        }
      }
    }
  } finally {
    // Clean up temp directory
    if (!dryRun) {
      try {
        const { rmSync } = await import("fs");
        rmSync(tmpBase, { recursive: true, force: true });
        console.log(`\n[rewatermark] Cleaned up temp directory`);
      } catch {
        console.warn(`[rewatermark] Warning: could not clean temp dir: ${tmpBase}`);
      }
    }
  }

  console.log(`\n[rewatermark] Done! Processed: ${processed}, Errors: ${errors}`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[rewatermark] Fatal error:", err);
  process.exit(1);
});
