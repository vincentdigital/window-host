/** @vitest-environment jsdom */
import { parseScene } from "@window-host/schema";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SceneShell } from "./SceneShell.js";

const link = parseScene({
  version: 1,
  id: "link-test",
  title: "Link",
  layout: { kind: "split-horizontal", split: 0.5 },
  panes: [
    { id: "send", host: { kind: "widget", widgetId: "bus-send", props: { topic: "demo.ping" } } },
    { id: "listen", host: { kind: "widget", widgetId: "bus-listen", props: { topic: "demo.ping" } } },
  ],
});

describe("pane bus POC", () => {
  it("delivers send ping to listen pane", async () => {
    render(<SceneShell scene={link} />);
    fireEvent.click(screen.getByRole("button", { name: "Send ping" }));
    await waitFor(() => {
      expect(screen.getByText("ping")).toBeTruthy();
      expect(document.querySelector(".wh-bus-from")?.textContent).toBe("send");
    });
  });
});
