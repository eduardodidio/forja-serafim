/**
 * process-images.ts
 *
 * Processes raw deck images: resizes to max 600px width and applies
 * a diagonal "Forja Serafim" watermark overlay.
 *
 * Usage:
 *   bun scripts/process-images.ts --input /path/to/raw --output /path/to/dest --slug castlevania
 */

import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync } from "fs";
import { join, extname } from "path";

const WATERMARK_TEXT = "Forja Serafim";
const MAX_WIDTH = 600;
const QUALITY = 80;

function parseArgs() {
  const args = process.argv.slice(2);
  let input = "";
  let output = "";
  let slug = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input" && args[i + 1]) input = args[++i];
    else if (args[i] === "--output" && args[i + 1]) output = args[++i];
    else if (args[i] === "--slug" && args[i + 1]) slug = args[++i];
  }

  if (!input || !output || !slug) {
    console.error("Usage: bun scripts/process-images.ts --input <dir> --output <dir> --slug <name>");
    process.exit(1);
  }

  return { input, output, slug };
}

function createWatermarkSvg(width: number, height: number): Buffer {
  const fontSize = Math.max(24, Math.round(width * 0.06));
  const lines = 5;
  const svgParts: string[] = [];

  for (let i = 0; i < lines; i++) {
    const y = Math.round((height / (lines + 1)) * (i + 1));
    svgParts.push(
      `<text x="${width / 2}" y="${y}" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" fill-opacity="0.25" text-anchor="middle" transform="rotate(-30, ${width / 2}, ${y})">${WATERMARK_TEXT}</text>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svgParts.join("")}</svg>`;
  return Buffer.from(svg);
}

async function processImage(inputPath: string, outputPath: string) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  const resizeWidth = Math.min(MAX_WIDTH, metadata.width ?? MAX_WIDTH);
  const resized = image.resize({ width: resizeWidth, withoutEnlargement: true });

  const resizedMeta = await resized.clone().metadata();
  // After resize, recalculate height
  const ratio = resizeWidth / (metadata.width ?? resizeWidth);
  const newHeight = Math.round((metadata.height ?? 840) * ratio);

  const watermark = createWatermarkSvg(resizeWidth, newHeight);

  await resized
    .composite([{ input: watermark, gravity: "center" }])
    .jpeg({ quality: QUALITY })
    .toFile(outputPath);
}

async function main() {
  const { input, output, slug } = parseArgs();

  const destDir = join(output, slug);
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

  const files = readdirSync(input).filter((f) => {
    const ext = extname(f).toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp"].includes(ext);
  });

  if (files.length === 0) {
    console.error(`No image files found in ${input}`);
    process.exit(1);
  }

  console.log(`Processing ${files.length} images from ${input} -> ${destDir}`);

  for (const file of files) {
    const inputPath = join(input, file);
    const baseName = file.replace(extname(file), "");
    const safeName = baseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    const outputPath = join(destDir, `${safeName}.jpg`);

    try {
      await processImage(inputPath, outputPath);
      console.log(`  OK: ${file} -> ${safeName}.jpg`);
    } catch (err) {
      console.error(`  FAIL: ${file} - ${err}`);
    }
  }

  console.log("Done!");
}

main();
