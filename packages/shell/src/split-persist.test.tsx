/** @vitest-environment jsdom */
import { parseScene } from "@window-host/schema";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SceneShell } from "./SceneShell.js";

const duet = parseScene({
  version: 1,
  id: "duet-persist",
  title: "Duet",
  layout: { kind: "split-horizontal", split: 0.5 },
  panes: [
    { id: "left", host: { kind: "widget", widgetId: "notes" } },
    { id: "right", host: { kind: "widget", widgetId: "pomodoro" } },
  ],
});

describe("split persistence UX", () => {
  it("writes layout ratio to localStorage on divider key nudge", () => {
    localStorage.clear();
    render(<SceneShell scene={duet} />);
    const divider = document.querySelector(".wh-divider") as HTMLElement;
    fireEvent.keyDown(divider, { key: "ArrowRight" });
    const stored = localStorage.getItem("window-host.layout.duet-persist.split-horizontal");
    expect(stored).not.toBeNull();
    expect(Number(stored)).toBeGreaterThan(0.5);
  });
});
