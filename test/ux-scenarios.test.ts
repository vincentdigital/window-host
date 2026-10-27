import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseScene, parseUxScenario } from "@window-host/schema";
import { describe, expect, it } from "vitest";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const uxDir = path.join(root, "scenes/ux");
const scenesDir = path.join(root, "scenes");

function sceneIdsOnDisk(): Set<string> {
  const ids = new Set<string>();
  for (const name of readdirSync(scenesDir)) {
    if (!name.endsWith(".scene.json")) continue;
    const raw = JSON.parse(readFileSync(path.join(scenesDir, name), "utf8"));
    ids.add(parseScene(raw).id);
  }
  return ids;
}

describe("UX scenario contracts (scenes/ux)", () => {
  const sceneIds = sceneIdsOnDisk();
  const uxFiles = readdirSync(uxDir).filter((f) => f.endsWith(".json")).sort();

  it("auto-discovers every scenes/ux/*.json (grandparent glob stays in sync)", () => {
    const globKeys = Object.keys(import.meta.glob("../scenes/ux/*.json")).sort();
    expect(globKeys.length).toBe(uxFiles.length);
    for (const file of uxFiles) {
      expect(globKeys.some((k) => k.endsWith(`/${file}`))).toBe(true);
    }
  });

  it("parses each scenario and references a shipped scene id", () => {
    expect(uxFiles.length).toBeGreaterThan(0);
    for (const file of uxFiles) {
      const raw = JSON.parse(readFileSync(path.join(uxDir, file), "utf8"));
      const scenario = parseUxScenario(raw);
      expect(sceneIds.has(scenario.sceneId), `${file} → sceneId ${scenario.sceneId}`).toBe(
        true,
      );
    }
  });
});
