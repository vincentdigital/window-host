import {
  clampSplit,
  createPaneBus,
  nudgeSplit,
  paneFractions,
  readComposeOverrides,
  sceneWithCompose,
  storageKeyForLayout,
} from "@window-host/core";
import type { PaneHost, Scene } from "@window-host/schema";
import { PaneBusProvider, PaneIdProvider, renderPaneHost } from "@window-host/widgets";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PaneComposer } from "./PaneComposer.js";

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
  const [composeHosts, setComposeHosts] = useState<Record<string, PaneHost>>(() =>
    readComposeOverrides(scene.id) ?? {},
  );
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    setComposeHosts(readComposeOverrides(scene.id) ?? {});
  }, [scene.id]);

  const effectiveScene = useMemo(
    () => sceneWithCompose(scene, composeHosts),
    [scene, composeHosts],
  );

  const bus = useMemo(() => createPaneBus(), [scene.id]);

  useEffect(() => {
    if (scene.layout.kind === "split-horizontal") {
      localStorage.setItem(layoutKey, String(split));
    }
  }, [layoutKey, split, scene.layout.kind]);

  const paneIds = useMemo(() => effectiveScene.panes.map((p) => p.id), [effectiveScene.panes]);
  const fractions = useMemo(
    () => paneFractions(effectiveScene.layout, split, paneIds),
    [effectiveScene.layout, split, paneIds],
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

  const resizable = effectiveScene.layout.kind === "split-horizontal";

  return (
    <PaneBusProvider bus={bus}>
      <div className="wh-scene" data-scene={effectiveScene.id}>
        <button
          type="button"
          className="wh-compose-trigger"
          onClick={() => setComposerOpen(true)}
          aria-haspopup="dialog"
        >
          Compose
        </button>
        <div
          className="wh-row"
          ref={(el) => {
            if (el) el.dataset.testid = "wh-row";
          }}
        >
          {effectiveScene.panes.flatMap((pane, i) => {
            const flex = fractions.find((f) => f.paneId === pane.id)?.flex ?? 1;
            const out = [
              <div key={pane.id} className="wh-pane" style={{ flex }} data-pane={pane.id}>
                <PaneIdProvider paneId={pane.id}>
                  {renderPaneHost(pane.host)}
                </PaneIdProvider>
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
        <PaneComposer
          scene={scene}
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          hosts={composeHosts}
          onHostsChange={setComposeHosts}
        />
      </div>
    </PaneBusProvider>
  );
}
