import { SPLIT_MAX, SPLIT_MIN, type LayoutDef } from "@window-host/schema";

export function clampSplit(value: number): number {
  if (Number.isNaN(value)) return 0.5;
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, value));
}

export type PaneFraction = { paneId: string; flex: number };

/** Convert layout + optional persisted split into flex weights per pane. */
export function paneFractions(
  layout: LayoutDef,
  persistedSplit?: number,
  paneIds: string[] = [],
): PaneFraction[] {
  if (layout.kind === "split-horizontal") {
    const split = clampSplit(persistedSplit ?? layout.split);
    const [left, right] = paneIds;
    return [
      { paneId: left, flex: split },
      { paneId: right, flex: 1 - split },
    ];
  }
  const left = layout.leftRail;
  const right = layout.rightRail;
  const center = 1 - left - right;
  const [a, b, c] = paneIds;
  return [
    { paneId: a, flex: left },
    { paneId: b, flex: center },
    { paneId: c, flex: right },
  ];
}

export function nudgeSplit(current: number, delta: number): number {
  return clampSplit(current + delta);
}

export function storageKeyForLayout(sceneId: string, layoutKind: string): string {
  return `window-host.layout.${sceneId}.${layoutKind}`;
}
