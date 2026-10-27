import { describe, expect, it } from "vitest";
import { createPaneBus } from "./bus.js";

describe("createPaneBus", () => {
  it("delivers publish to subscriber on same topic", () => {
    const bus = createPaneBus();
    const seen: unknown[] = [];
    bus.subscribe("demo.ping", (e) => seen.push(e.payload));
    bus.publish("left", "demo.ping", { text: "hi" });
    expect(seen).toEqual([{ text: "hi" }]);
  });

  it("isolates topics", () => {
    const bus = createPaneBus();
    let n = 0;
    bus.subscribe("a", () => n++);
    bus.publish("x", "b", {});
    expect(n).toBe(0);
  });
});
