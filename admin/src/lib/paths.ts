import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = resolve(__dirname, "..", "..", "..");
export const COLLECTIONS_JSON = resolve(PROJECT_ROOT, "src/data/collections.json");
export const TESTIMONIALS_JSON = resolve(PROJECT_ROOT, "src/data/testimonials.json");
export const COVERS_DIR = resolve(PROJECT_ROOT, "public/images/covers");
export const DECKS_DIR = resolve(PROJECT_ROOT, "public/images/decks");
export const MANUALS_DIR = resolve(PROJECT_ROOT, "public/manuals");
export const VIDEOS_DIR = resolve(PROJECT_ROOT, "public/videos/decks");
export const SETTINGS_JSON = resolve(PROJECT_ROOT, "src/data/settings.json");
