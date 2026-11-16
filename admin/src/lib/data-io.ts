import { readFileSync, writeFileSync, renameSync } from "fs";
import { dirname, join } from "path";
import { randomBytes } from "crypto";

export function readJson<T>(path: string): T {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as T;
}

export function writeJson(path: string, data: unknown): void {
  const dir = dirname(path);
  const tmp = join(dir, `.tmp-${randomBytes(6).toString("hex")}.json`);
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  renameSync(tmp, path);
}
