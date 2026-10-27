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

/** Shared packages — no tenant URLs (scene JSON / deploy hold those). */
const PACKAGE_SCAN_DIRS = [
  "packages/schema/src",
  "packages/core/src",
  "packages/widgets/src",
  "packages/shell/src",
];

function scanTextFiles(
  rel: string,
  extensions: string[],
): { file: string; token: string }[] {
  const hits: { file: string; token: string }[] = [];
  const dir = path.join(root, rel);
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const full = path.join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (extensions.some((ext) => name.endsWith(ext))) {
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

function scanUxScenarios(): { file: string; token: string }[] {
  const hits: { file: string; token: string }[] = [];
  const uxDir = path.join(root, "scenes/ux");
  for (const name of readdirSync(uxDir)) {
    if (!name.endsWith(".json")) continue;
    const full = path.join(uxDir, name);
    const text = readFileSync(full, "utf8");
    for (const token of TOKENS) {
      if (text.includes(token)) hits.push({ file: path.relative(root, full), token });
    }
  }
  return hits;
}

describe("tenant leak", () => {
  it("shared packages have no homelab or product host literals", () => {
    const hits = PACKAGE_SCAN_DIRS.flatMap((rel) =>
      scanTextFiles(rel, [".ts", ".tsx"]),
    );
    expect(hits).toEqual([]);
  });

  it("grandparent UX scenarios (scenes/ux) have no tenant host literals", () => {
    expect(scanUxScenarios()).toEqual([]);
  });
});
