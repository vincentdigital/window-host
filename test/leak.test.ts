import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const TOKENS = [
  "homelab2",
  "vincentdigital",
  "workspace.homelab",
  "life.homelab",
  "muse.vincent",
];

const SCAN_DIRS = ["packages/schema/src", "packages/core/src"];

function scanDir(rel: string): { file: string; token: string }[] {
  const hits: { file: string; token: string }[] = [];
  const dir = path.join(root, rel);
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const full = path.join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".ts")) {
        const text = readFileSync(full, "utf8");
        for (const token of TOKENS) {
          if (text.includes(token)) hits.push({ file: path.relative(root, full), token });
        }
      }
    }
  };
  walk(dir);
  return hits;
}

describe("tenant leak", () => {
  it("core and schema have no homelab or product host literals", () => {
    const hits = SCAN_DIRS.flatMap(scanDir);
    expect(hits).toEqual([]);
  });
});
