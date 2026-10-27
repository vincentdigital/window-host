/** @vitest-environment jsdom */
import { createPaneBus } from "@window-host/core";
import { parseScene } from "@window-host/schema";
import { describe, expect, it } from "vitest";
import { registerDeskSession } from "./desk-session.js";

const scene = parseScene({
  version: 1,
  id: "duet",
  title: "Duet",
  layout: { kind: "split-horizontal", split: 0.5 },
  panes: [
    { id: "left", host: { kind: "widget", widgetId: "notes" } },
    { id: "right", host: { kind: "widget", widgetId: "pomodoro" } },
  ],
});

describe("registerDeskSession", () => {
  it("exposes snapshot and bus.publish on window", () => {
    const bus = createPaneBus();
    const teardown = registerDeskSession({
      getScene: () => scene,
      getEffectiveScene: () => scene,
      getSplit: () => 0.5,
      getComposeHosts: () => ({}),
      bus,
      setComposeHosts: () => {},
      clearCompose: () => {},
    });

    expect(window.__windowHost?.version).toBe(1);
    const snap = window.__windowHost!.getSnapshot();
    expect(snap.sceneId).toBe("duet");
    expect(snap.panes).toHaveLength(2);

    window.__windowHost!.dispatch({
      type: "bus.publish",
      topic: "demo.ping",
      payload: { t: 1 },
    });
    expect(bus.history("demo.ping").length).toBe(1);

    teardown();
    expect(window.__windowHost).toBeUndefined();
  });
});
