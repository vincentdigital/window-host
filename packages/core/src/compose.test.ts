/** @vitest-environment jsdom */
import { parseScene } from "@window-host/schema";
import { describe, expect, it, beforeEach } from "vitest";
import {
  clearComposeOverrides,
  readComposeOverrides,
  sceneWithCompose,
  storageKeyForCompose,
  writeComposeOverrides,
} from "./compose.js";

const base = parseScene({
  version: 1,
  id: "duet",
  title: "Duet",
  layout: { kind: "split-horizontal", split: 0.5 },
  panes: [
    { id: "left", host: { kind: "widget", widgetId: "notes" } },
    { id: "right", host: { kind: "widget", widgetId: "pomodoro" } },
  ],
});

describe("compose storage", () => {
  beforeEach(() => {
    clearComposeOverrides("duet");
  });

  it("round-trips pane host overrides", () => {
    const overrides = {
      left: { kind: "widget" as const, widgetId: "bus-send" as const, props: { topic: "t" } },
    };
    writeComposeOverrides("duet", overrides);
    expect(readComposeOverrides("duet")).toEqual(overrides);
  });

  it("merges overrides into scene panes", () => {
    const merged = sceneWithCompose(base, {
      right: { kind: "widget", widgetId: "bus-listen", props: { topic: "demo.ping" } },
    });
    const right = merged.panes.find((p) => p.id === "right")?.host;
    const left = merged.panes.find((p) => p.id === "left")?.host;
    expect(right?.kind === "widget" && right.widgetId).toBe("bus-listen");
    expect(left?.kind === "widget" && left.widgetId).toBe("notes");
  });

  it("uses stable storage key", () => {
    expect(storageKeyForCompose("link")).toBe("window-host.compose.link");
  });
});
