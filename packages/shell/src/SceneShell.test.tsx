/** @vitest-environment jsdom */
import { parseScene } from "@window-host/schema";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SceneShell } from "./SceneShell.js";

const duet = parseScene({
  version: 1,
  id: "duet-test",
  title: "Duet",
  layout: { kind: "split-horizontal", split: 0.5 },
  panes: [
    { id: "left", host: { kind: "widget", widgetId: "notes", props: { slot: "zoom-out" } } },
    { id: "right", host: { kind: "widget", widgetId: "pomodoro" } },
  ],
});

describe("SceneShell UX", () => {
  it("renders pane widgets and a focus timer", () => {
    render(<SceneShell scene={duet} />);
    expect(screen.getByLabelText("Zoom out")).toBeTruthy();
    expect(screen.getByText("Focus")).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
  });
});
