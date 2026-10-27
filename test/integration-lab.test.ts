import { describe, expect, it, vi } from "vitest";
import { unwrapPostMessage, wrapPublish } from "../examples/_shared/bus-envelope.js";
import {
  bridgePostMessage,
  createMiniBus,
  ingestBusRequest,
  ingestPaneEmit,
  ingestServerEnvelope,
  publishFromWidget,
} from "../examples/_shared/lab-adapters.js";

const TOPIC = "demo.ping";

describe("integration lab adapters", () => {
  it("unwraps postMessage wrapper", () => {
    const inner = {
      v: 1,
      id: "x",
      topic: TOPIC,
      source: { paneId: "iframe-guest" },
      payload: { message: "ping" },
      at: 1,
    };
    const wrapped = wrapPublish(inner);
    expect(unwrapPostMessage(wrapped)).toEqual(inner);
    expect(unwrapPostMessage({ channel: "other" })).toBeNull();
  });

  it("fans widget → listener (patterns 1 ↔ 4)", () => {
    const bus = createMiniBus();
    const seen: string[] = [];
    bus.subscribe(TOPIC, (e) => seen.push(e.source.paneId));
    publishFromWidget(bus, "widget-a", TOPIC, { message: "a" });
    ingestBusRequest(bus, { topic: TOPIC, payload: { message: "b" } }, "wc-b");
    expect(seen).toEqual(["widget-a", "wc-b"]);
  });

  it("fans iframe postMessage → esm listener (patterns 2 ↔ 3)", () => {
    const bus = createMiniBus();
    const payloads: unknown[] = [];
    bus.subscribe(TOPIC, (e) => payloads.push(e.payload));

    const envelope = {
      v: 1,
      id: "1",
      topic: TOPIC,
      source: { paneId: "iframe-guest" },
      payload: { message: "from-iframe" },
      at: Date.now(),
    };
    const event = {
      origin: "https://desk.test",
      data: wrapPublish(envelope),
    };
    bridgePostMessage(bus, event as MessageEvent, ["https://desk.test"]);
    ingestPaneEmit(bus, { topic: TOPIC, payload: { message: "from-esm" } }, "esm");

    expect(payloads).toEqual([{ message: "from-iframe" }, { message: "from-esm" }]);
  });

  it("fans mock server envelope → widget listener (patterns 5 ↔ 1)", () => {
    const bus = createMiniBus();
    let count = 0;
    bus.subscribe(TOPIC, () => count++);
    ingestServerEnvelope(bus, {
      v: 1,
      id: "srv",
      topic: TOPIC,
      source: { paneId: "server" },
      payload: { message: "push" },
      at: 1,
    });
    publishFromWidget(bus, "widget", TOPIC, {});
    expect(count).toBe(2);
  });

  it("rejects disallowed iframe origin", () => {
    const bus = createMiniBus();
    const fn = vi.fn();
    bus.subscribe(TOPIC, fn);
    bridgePostMessage(
      bus,
      {
        origin: "https://evil.test",
        data: wrapPublish({
          v: 1,
          id: "1",
          topic: TOPIC,
          source: { paneId: "iframe-guest" },
          payload: {},
          at: 1,
        }),
      } as MessageEvent,
      ["https://desk.test"],
    );
    expect(fn).not.toHaveBeenCalled();
  });
});
