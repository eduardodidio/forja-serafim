import { readFileSync, writeFileSync, renameSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { randomBytes } from "crypto";

export class DataCorruptionError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly reason: "conflict_markers" | "invalid_json" | "file_not_found",
    cause?: unknown,
  ) {
    super(`Data corruption in ${filePath}: ${reason}`);
    this.name = "DataCorruptionError";
    if (cause) this.cause = cause;
  }
}

export function hasConflictMarkers(content: string): boolean {
  return content.includes("<<<<<<<") || content.includes(">>>>>>>");
}

export function validateJson(path: string): boolean {
  try {
    readJson(path);
    return true;
  } catch {
    return false;
  }
}

export function readJson<T>(path: string): T {
  let raw: string;
  try {
    raw = readFileSync(path, "utf-8");
  } catch (err) {
    throw new DataCorruptionError(path, "file_not_found", err);
  }

  if (hasConflictMarkers(raw)) {
    throw new DataCorruptionError(path, "conflict_markers");
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new DataCorruptionError(path, "invalid_json", err);
  }
}

export function readJsonSafe<T>(path: string, fallback: T): T {
  try {
    return readJson<T>(path);
  } catch (err) {
    console.error(
      `[data-io] readJsonSafe fallback for ${path}:`,
      err instanceof Error ? err.message : err,
    );
    return fallback;
  }
}

export function writeJson(path: string, data: unknown): void {
  const dir = dirname(path);
  const tmp = join(dir, `.tmp-${randomBytes(6).toString("hex")}.json`);
  const jsonStr = JSON.stringify(data, null, 2) + "\n";
  // Validate what we're about to write
  JSON.parse(jsonStr);
  writeFileSync(tmp, jsonStr, "utf-8");
  try {
    renameSync(tmp, path);
  } catch (err) {
    try {
      unlinkSync(tmp);
    } catch {
      /* best-effort cleanup */
    }
    throw err;
  }
}
