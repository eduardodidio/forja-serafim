import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { writeFileSync, mkdirSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";

import {
  DataCorruptionError,
  hasConflictMarkers,
  readJson,
  readJsonSafe,
  validateJson,
  writeJson,
} from "../lib/data-io.js";

import { hasConflictMarkers as hasConflictMarkersFile } from "../lib/git-persist.js";

// ---------------------------------------------------------------------------
// Temp directory setup
// ---------------------------------------------------------------------------

const TMP = join(tmpdir(), `f19-test-${randomBytes(4).toString("hex")}`);

beforeAll(() => {
  mkdirSync(TMP, { recursive: true });
});

afterAll(() => {
  rmSync(TMP, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// 1. hasConflictMarkers (data-io — string-based)
// ---------------------------------------------------------------------------

describe("hasConflictMarkers (string)", () => {
  test("detects <<<<<<< markers", () => {
    const content = '<<<<<<< HEAD\n{"a":1}\n=======\n{"b":2}\n>>>>>>> origin/main';
    expect(hasConflictMarkers(content)).toBe(true);
  });

  test("detects >>>>>>> markers", () => {
    const content = '{"a":1}\n>>>>>>> origin/main';
    expect(hasConflictMarkers(content)).toBe(true);
  });

  test("returns false for clean JSON", () => {
    const content = '{"name": "test", "slug": "s1"}';
    expect(hasConflictMarkers(content)).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(hasConflictMarkers("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. readJson
// ---------------------------------------------------------------------------

describe("readJson", () => {
  test("parses valid JSON file", () => {
    const path = join(TMP, "valid.json");
    writeFileSync(path, '[{"name":"test","slug":"s1"}]');
    const data = readJson<Array<{ name: string; slug: string }>>(path);
    expect(data).toEqual([{ name: "test", slug: "s1" }]);
  });

  test("throws DataCorruptionError with reason conflict_markers for file with git markers", () => {
    const path = join(TMP, "conflict.json");
    writeFileSync(path, '[\n<<<<<<< HEAD\n{"a":1}\n=======\n{"b":2}\n>>>>>>> origin/main\n]');
    try {
      readJson(path);
      expect(true).toBe(false); // should not reach
    } catch (err) {
      expect(err).toBeInstanceOf(DataCorruptionError);
      expect((err as DataCorruptionError).reason).toBe("conflict_markers");
      expect((err as DataCorruptionError).filePath).toBe(path);
    }
  });

  test("throws DataCorruptionError with reason invalid_json for malformed JSON", () => {
    const path = join(TMP, "bad.json");
    writeFileSync(path, "{not valid json}}}");
    try {
      readJson(path);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(DataCorruptionError);
      expect((err as DataCorruptionError).reason).toBe("invalid_json");
    }
  });

  test("throws DataCorruptionError with reason file_not_found for missing file", () => {
    try {
      readJson(join(TMP, "nope.json"));
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(DataCorruptionError);
      expect((err as DataCorruptionError).reason).toBe("file_not_found");
    }
  });

  test("throws DataCorruptionError with reason invalid_json for empty file", () => {
    const path = join(TMP, "empty.json");
    writeFileSync(path, "");
    try {
      readJson(path);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(DataCorruptionError);
      expect((err as DataCorruptionError).reason).toBe("invalid_json");
    }
  });

  test("detects only opening conflict marker", () => {
    const path = join(TMP, "open-marker.json");
    writeFileSync(path, '<<<<<<< HEAD\n{"a":1}');
    try {
      readJson(path);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(DataCorruptionError);
      expect((err as DataCorruptionError).reason).toBe("conflict_markers");
    }
  });

  test("detects only closing conflict marker", () => {
    const path = join(TMP, "close-marker.json");
    writeFileSync(path, '{"a":1}\n>>>>>>> origin/main');
    try {
      readJson(path);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(DataCorruptionError);
      expect((err as DataCorruptionError).reason).toBe("conflict_markers");
    }
  });
});

// ---------------------------------------------------------------------------
// 3. readJsonSafe
// ---------------------------------------------------------------------------

describe("readJsonSafe", () => {
  test("returns parsed data for valid JSON", () => {
    const path = join(TMP, "safe-valid.json");
    writeFileSync(path, '{"key":"value"}');
    const result = readJsonSafe<{ key: string }>(path, { key: "fallback" });
    expect(result).toEqual({ key: "value" });
  });

  test("returns fallback for invalid JSON", () => {
    const path = join(TMP, "safe-bad.json");
    writeFileSync(path, "{broken");
    const result = readJsonSafe(path, []);
    expect(result).toEqual([]);
  });

  test("returns fallback for missing file", () => {
    const result = readJsonSafe(join(TMP, "safe-missing.json"), []);
    expect(result).toEqual([]);
  });

  test("returns fallback for file with conflict markers", () => {
    const path = join(TMP, "safe-conflict.json");
    writeFileSync(path, "<<<<<<< HEAD\nnot json");
    const result = readJsonSafe(path, []);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 4. validateJson
// ---------------------------------------------------------------------------

describe("validateJson", () => {
  test("returns true for valid JSON file", () => {
    const path = join(TMP, "validate-ok.json");
    writeFileSync(path, '[{"slug":"test"}]');
    expect(validateJson(path)).toBe(true);
  });

  test("returns false for file with conflict markers", () => {
    const path = join(TMP, "validate-conflict.json");
    writeFileSync(path, '<<<<<<< HEAD\n{"a":1}\n=======\n{"b":2}\n>>>>>>> origin/main');
    expect(validateJson(path)).toBe(false);
  });

  test("returns false for invalid JSON", () => {
    const path = join(TMP, "validate-bad.json");
    writeFileSync(path, "}}}");
    expect(validateJson(path)).toBe(false);
  });

  test("returns false for missing file", () => {
    expect(validateJson(join(TMP, "validate-nope.json"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. writeJson
// ---------------------------------------------------------------------------

describe("writeJson", () => {
  test("writes valid JSON that can be read back", () => {
    const path = join(TMP, "write-out.json");
    const data = [{ slug: "test", name: "Test Deck" }];
    writeJson(path, data);
    const content = readFileSync(path, "utf-8");
    // Content should be valid JSON
    expect(() => JSON.parse(content)).not.toThrow();
    // Content should end with newline
    expect(content.endsWith("\n")).toBe(true);
  });

  test("round-trip: writeJson then readJson returns same data", () => {
    const path = join(TMP, "write-roundtrip.json");
    const data = [{ slug: "castlevania", name: "Castlevania", cards: 100 }];
    writeJson(path, data);
    const result = readJson<typeof data>(path);
    expect(result).toEqual(data);
  });
});

// ---------------------------------------------------------------------------
// 6. DataCorruptionError class
// ---------------------------------------------------------------------------

describe("DataCorruptionError", () => {
  test("has correct reason field", () => {
    const err = new DataCorruptionError("/tmp/test.json", "conflict_markers");
    expect(err.reason).toBe("conflict_markers");
  });

  test("has path field (filePath)", () => {
    const err = new DataCorruptionError("/tmp/test.json", "invalid_json");
    expect(err.filePath).toBe("/tmp/test.json");
  });

  test("is instanceof Error", () => {
    const err = new DataCorruptionError("/tmp/test.json", "file_not_found");
    expect(err).toBeInstanceOf(Error);
  });

  test("has name DataCorruptionError", () => {
    const err = new DataCorruptionError("/tmp/test.json", "conflict_markers");
    expect(err.name).toBe("DataCorruptionError");
  });

  test("preserves cause when provided", () => {
    const cause = new SyntaxError("Unexpected token");
    const err = new DataCorruptionError("/tmp/test.json", "invalid_json", cause);
    expect(err.cause).toBe(cause);
  });

  test("message includes file path and reason", () => {
    const err = new DataCorruptionError("/tmp/test.json", "conflict_markers");
    expect(err.message).toContain("/tmp/test.json");
    expect(err.message).toContain("conflict_markers");
  });
});

// ---------------------------------------------------------------------------
// 7. hasConflictMarkers from git-persist (file-based)
// ---------------------------------------------------------------------------

describe("hasConflictMarkers (git-persist, file-based)", () => {
  test("detects opening markers in file", () => {
    const path = join(TMP, "gp-conflict-open.json");
    writeFileSync(path, '<<<<<<< HEAD\n{"a":1}');
    expect(hasConflictMarkersFile(path)).toBe(true);
  });

  test("detects closing markers in file", () => {
    const path = join(TMP, "gp-conflict-close.json");
    writeFileSync(path, '{"a":1}\n>>>>>>> origin/main');
    expect(hasConflictMarkersFile(path)).toBe(true);
  });

  test("returns false for clean JSON file", () => {
    const path = join(TMP, "gp-clean.json");
    writeFileSync(path, '[{"slug":"test"}]');
    expect(hasConflictMarkersFile(path)).toBe(false);
  });

  test("returns false for missing file", () => {
    expect(hasConflictMarkersFile(join(TMP, "gp-nope.json"))).toBe(false);
  });

  test("returns false for empty file", () => {
    const path = join(TMP, "gp-empty.json");
    writeFileSync(path, "");
    expect(hasConflictMarkersFile(path)).toBe(false);
  });
});
