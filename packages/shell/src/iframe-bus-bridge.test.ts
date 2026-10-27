/** @vitest-environment jsdom */
import { createPaneBus } from "@window-host/core";
import { describe, expect, it } from "vitest";
import { attachPaneIframeBusBridge } from "./iframe-bus-bridge.js";

describe("attachPaneIframeBusBridge", () => {
  it("forwards postMessage into pane bus", () => {
    const bus = createPaneBus();
    const seen: unknown[] = [];
    bus.subscribe("demo.ping", (e) => seen.push(e.payload));

    attachPaneIframeBusBridge(bus, ["https://desk.test"], () => []);

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://desk.test",
        data: {
          channel: "window-host-bus",
          direction: "publish",
          envelope: {
            v: 1,
            id: "1",
            topic: "demo.ping",
            source: { paneId: "iframe-guest" },
            payload: { message: "hi" },
            at: 1,
          },
        },
      }),
    );

    expect(seen).toEqual([{ message: "hi" }]);
  });
});
