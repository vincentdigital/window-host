import { describe, expect, it } from "vitest";
import { parseScene } from "./scene.js";

describe("parseScene", () => {
  it("accepts split-horizontal with two panes", () => {
    const scene = parseScene({
      version: 1,
      id: "duet",
      title: "Duet",
      layout: { kind: "split-horizontal", split: 0.5 },
      panes: [
        { id: "a", host: { kind: "widget", widgetId: "notes", props: { slot: "zoom-out" } } },
        { id: "b", host: { kind: "widget", widgetId: "pomodoro" } },
      ],
    });
    expect(scene.id).toBe("duet");
  });

  it("rejects split-horizontal with three panes", () => {
    expect(() =>
      parseScene({
        version: 1,
        id: "bad",
        title: "Bad",
        layout: { kind: "split-horizontal", split: 0.5 },
        panes: [
          { id: "a", host: { kind: "widget", widgetId: "notes" } },
          { id: "b", host: { kind: "widget", widgetId: "notes" } },
          { id: "c", host: { kind: "widget", widgetId: "notes" } },
        ],
      }),
    ).toThrow(/exactly 2 panes/);
  });
});
