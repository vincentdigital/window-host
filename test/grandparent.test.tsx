/** @vitest-environment jsdom */
import React from "react";
import { parseScene, parseUxScenario, type Scene } from "@window-host/schema";
import { SceneShell } from "@window-host/shell";
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { assertUxExpectation } from "../packages/shell/src/ux-expectations.js";

const sceneModules = import.meta.glob("../scenes/*.scene.json", {
  eager: true,
}) as Record<string, { default: unknown }>;

const SCENES: Record<string, Scene> = {};
for (const mod of Object.values(sceneModules)) {
  const scene = parseScene(mod.default);
  SCENES[scene.id] = scene;
}

const uxModules = import.meta.glob("../scenes/ux/*.json", {
  eager: true,
}) as Record<string, { default: { name?: string } }>;

function runGrandparent(raw: unknown) {
  const scenario = parseUxScenario(raw);
  const scene = SCENES[scenario.sceneId];
  if (!scene) throw new Error(`unknown sceneId in UX scenario: ${scenario.sceneId}`);

  let sceneId = scenario.sceneId;
  const setSceneId = (id: string) => {
    sceneId = id;
  };

  const { unmount } = render(
    <SceneShell
      scene={SCENES[sceneId] ?? scene}
      deskSession={{
        setSceneId,
        allowedSceneIds: () => Object.keys(SCENES),
      }}
    />,
  );

  try {
    for (const cmd of scenario.when) {
      act(() => {
        const result = window.__windowHost!.dispatch(cmd as Parameters<typeof window.__windowHost.dispatch>[0]);
        if (!result.ok) throw new Error(result.error);
      });
    }
    const snapshot = window.__windowHost!.getSnapshot();
    const result = assertUxExpectation(snapshot, scenario);
    expect(result.ok, result.ok ? "" : result.error).toBe(true);
  } finally {
    unmount();
  }
}

describe("grandparent UX scenarios", () => {
  for (const [filePath, mod] of Object.entries(uxModules)) {
    const title = mod.default.name ?? filePath.split("/").pop()!;
    it(title, () => runGrandparent(mod.default));
  }
});
