import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ARCH_MAX_LINES, forbiddenEdges, listTsFiles } from "./architecture.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("architecture layers", () => {
  it("has no forbidden import edges between packages", () => {
    expect(forbiddenEdges(root)).toEqual([]);
  });

  it(`keeps package source files under ${ARCH_MAX_LINES} lines`, () => {
    const over: string[] = [];
    for (const rel of listTsFiles(root, "packages")) {
      if (rel.endsWith(".test.ts") || rel.endsWith(".test.tsx")) continue;
      const lines = readLines(path.join(root, rel));
      if (lines > ARCH_MAX_LINES) over.push(`${rel} (${lines})`);
    }
    expect(over).toEqual([]);
  });
});

function readLines(file: string): number {
  return readFileSync(file, "utf8").split("\n").length;
}
