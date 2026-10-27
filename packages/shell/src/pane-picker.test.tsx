/** @vitest-environment jsdom */
import { parseScene } from "@window-host/schema";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SceneShell } from "./SceneShell.js";

const duet = parseScene({
  version: 1,
  id: "duet-picker",
  title: "Duet",
  layout: { kind: "split-horizontal", split: 0.5 },
  panes: [
    { id: "left", host: { kind: "widget", widgetId: "notes", props: { slot: "zoom-out" } } },
    { id: "right", host: { kind: "widget", widgetId: "pomodoro" } },
  ],
});

describe("per-pane host picker", () => {
  it("opens from pane chrome and lists widgets", () => {
    render(<SceneShell scene={duet} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Change content for right, Focus/i }),
    );
    expect(screen.getByRole("option", { name: /Link · send/i })).toBeTruthy();
  });
});
