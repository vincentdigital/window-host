import {
  clampSplit,
  nudgeSplit,
  paneFractions,
  storageKeyForLayout,
} from "@window-host/core";
import type { Scene } from "@window-host/schema";
import { renderPaneHost } from "@window-host/widgets";
import { useCallback, useEffect, useMemo, useState } from "react";

function readSplit(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return clampSplit(Number(raw));
  } catch {
    return fallback;
  }
}

export function SceneShell({ scene }: { scene: Scene }) {
  const layoutKey = storageKeyForLayout(scene.id, scene.layout.kind);
  const defaultSplit =
    scene.layout.kind === "split-horizontal" ? scene.layout.split : 0.5;

  const [split, setSplit] = useState(() => readSplit(layoutKey, defaultSplit));

  useEffect(() => {
    if (scene.layout.kind === "split-horizontal") {
      localStorage.setItem(layoutKey, String(split));
    }
  }, [layoutKey, split, scene.layout.kind]);

  const paneIds = useMemo(() => scene.panes.map((p) => p.id), [scene.panes]);
  const fractions = useMemo(
    () => paneFractions(scene.layout, split, paneIds),
    [scene.layout, split, paneIds],
  );

  const onDividerKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (scene.layout.kind !== "split-horizontal") return;
      if (e.key === "ArrowLeft") setSplit((s) => nudgeSplit(s, -0.02));
      if (e.key === "ArrowRight") setSplit((s) => nudgeSplit(s, 0.02));
      if (e.key === "Enter") setSplit(0.5);
    },
    [scene.layout.kind],
  );

  const startDrag = useCallback(
    (e: React.PointerEvent, row: DOMRect) => {
      const move = (ev: PointerEvent) => {
        const ratio = (ev.clientX - row.left) / row.width;
        setSplit(clampSplit(ratio));
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [],
  );

  const resizable = scene.layout.kind === "split-horizontal";

  return (
    <div className="wh-scene" data-scene={scene.id}>
      <div
        className="wh-row"
        ref={(el) => {
          if (el) el.dataset.testid = "wh-row";
        }}
      >
        {scene.panes.flatMap((pane, i) => {
          const flex = fractions.find((f) => f.paneId === pane.id)?.flex ?? 1;
          const out = [
            <div key={pane.id} className="wh-pane" style={{ flex }} data-pane={pane.id}>
              {renderPaneHost(pane.host)}
            </div>,
          ];
          if (resizable && i === 0) {
            out.push(
              <div
                key="divider"
                className="wh-divider"
                role="separator"
                aria-orientation="vertical"
                aria-valuenow={Math.round(split * 100)}
                tabIndex={0}
                onKeyDown={onDividerKey}
                onDoubleClick={() => setSplit(0.5)}
                onPointerDown={(e) => {
                  const row = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (row) startDrag(e, row);
                }}
              />,
            );
          }
          return out;
        })}
      </div>
    </div>
  );
}
