import sharp from "sharp";

const WATERMARK_TEXT = "Forja Serafim";
const MAX_WIDTH = 600;
const QUALITY = 80;
const COVER_MAX_WIDTH = 1200;
const COVER_QUALITY = 85;

function createWatermarkSvg(width: number, height: number): Buffer {
  const fontSize = Math.max(24, Math.round(width * 0.08));
  const lines = 5;
  const svgParts: string[] = [];

  for (let i = 0; i < lines; i++) {
    const y = Math.round((height / (lines + 1)) * (i + 1));
    svgParts.push(
      `<text x="${width / 2}" y="${y}" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" fill-opacity="0.40" stroke="black" stroke-width="1" stroke-opacity="0.15" text-anchor="middle" transform="rotate(-30, ${width / 2}, ${y})">${WATERMARK_TEXT}</text>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svgParts.join("")}</svg>`;
  return Buffer.from(svg);
}

export async function processImage(inputPath: string, outputPath: string): Promise<void> {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  const resizeWidth = Math.min(MAX_WIDTH, metadata.width ?? MAX_WIDTH);
  const resized = image.resize({ width: resizeWidth, withoutEnlargement: true });

  const ratio = resizeWidth / (metadata.width ?? resizeWidth);
  const newHeight = Math.round((metadata.height ?? 840) * ratio);

  const watermark = createWatermarkSvg(resizeWidth, newHeight);

  await resized
    .composite([{ input: watermark, gravity: "center" }])
    .jpeg({ quality: QUALITY })
    .toFile(outputPath);
}

export async function processCoverImage(inputPath: string, outputPath: string): Promise<void> {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const resizeWidth = Math.min(COVER_MAX_WIDTH, metadata.width ?? COVER_MAX_WIDTH);
  await image
    .resize({ width: resizeWidth, withoutEnlargement: true })
    .jpeg({ quality: COVER_QUALITY })
    .toFile(outputPath);
}
