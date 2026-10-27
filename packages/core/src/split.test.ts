import { describe, expect, it } from "vitest";
import { clampSplit, nudgeSplit, paneFractions } from "./split.js";

describe("split", () => {
  it("clamps split to bounds", () => {
    expect(clampSplit(0)).toBe(0.2);
    expect(clampSplit(1)).toBe(0.8);
    expect(clampSplit(0.5)).toBe(0.5);
  });

  it("builds two-pane fractions", () => {
    const f = paneFractions(
      { kind: "split-horizontal", split: 0.5 },
      0.6,
      ["left", "right"],
    );
    expect(f).toEqual([
      { paneId: "left", flex: 0.6 },
      { paneId: "right", flex: 0.4 },
    ]);
  });

  it("builds trinity-rail fractions", () => {
    const f = paneFractions(
      { kind: "trinity-rail", leftRail: 0.2, rightRail: 0.2 },
      undefined,
      ["out", "focus", "in"],
    );
    expect(f[0].flex).toBe(0.2);
    expect(f[2].flex).toBe(0.2);
    expect(f[1].flex).toBeCloseTo(0.6);
  });

  it("nudges within clamp", () => {
    expect(nudgeSplit(0.5, 0.05)).toBe(0.55);
    expect(nudgeSplit(0.79, 0.05)).toBe(0.8);
  });
});
