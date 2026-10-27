/** @vitest-environment jsdom */
import React from "react";
import { parseScene, parseUxScenario, type Scene } from "@window-host/schema";
import { SceneShell } from "@window-host/shell";
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { assertUxExpectation } from "../packages/shell/src/ux-expectations.js";
import duetRaw from "../scenes/duet.scene.json";
import linkRaw from "../scenes/link.scene.json";
import playgroundBus from "../scenes/ux/playground-bus-reaches-listen.json";
import linkUx from "../scenes/ux/link-send-listen.json";
import playgroundRaw from "../scenes/playground.scene.json";

const SCENES: Record<string, Scene> = {
  duet: parseScene(duetRaw),
  link: parseScene(linkRaw),
  playground: parseScene(playgroundRaw),
};

const UX_FILES = [playgroundBus, linkUx];

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
  for (const file of UX_FILES) {
    it(file.name, () => runGrandparent(file));
  }
});
