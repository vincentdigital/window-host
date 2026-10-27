import {
  clampSplit,
  clearComposeOverrides,
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
import { PaneChrome } from "./PaneChrome.js";
import { attachPaneIframeBusBridge } from "./iframe-bus-bridge.js";
import { commitHosts } from "./compose-helpers.js";
import { registerDeskSession, type DeskSessionNav } from "./desk-session.js";
import { SceneOverview } from "./SceneOverview.js";

export type { DeskSessionApi, DeskSnapshot, DeskCommand } from "./desk-session.js";

function readSplit(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return clampSplit(Number(raw));
  } catch {
    return fallback;
  }
}

export function SceneShell({
  scene,
  deskSession,
}: {
  scene: Scene;
  deskSession?: DeskSessionNav;
}) {
  const layoutKey = storageKeyForLayout(scene.id, scene.layout.kind);
  const defaultSplit =
    scene.layout.kind === "split-horizontal" ? scene.layout.split : 0.5;

  const [split, setSplit] = useState(() => readSplit(layoutKey, defaultSplit));
  const [composeHosts, setComposeHosts] = useState<Record<string, PaneHost>>(() =>
    readComposeOverrides(scene.id) ?? {},
  );
  const [overviewOpen, setOverviewOpen] = useState(false);

  useEffect(() => {
    setComposeHosts(readComposeOverrides(scene.id) ?? {});
  }, [scene.id]);

  const effectiveScene = useMemo(
    () => sceneWithCompose(scene, composeHosts),
    [scene, composeHosts],
  );

  const bus = useMemo(() => createPaneBus(), [scene.id]);

  useEffect(() => {
    const allowed = [window.location.origin];
    return attachPaneIframeBusBridge(bus, allowed, () =>
      Array.from(document.querySelectorAll<HTMLIFrameElement>(".wh-pane-host-iframe")),
    );
  }, [bus]);

  useEffect(() => {
    return registerDeskSession({
      getScene: () => scene,
      getEffectiveScene: () => effectiveScene,
      getSplit: () => split,
      getComposeHosts: () => composeHosts,
      bus,
      setComposeHosts: (hosts) => {
        setComposeHosts(hosts);
        commitHosts(scene, hosts);
      },
      clearCompose: () => {
        setComposeHosts({});
        clearComposeOverrides(scene.id);
      },
      setSceneId: deskSession?.setSceneId,
      allowedSceneIds: deskSession?.allowedSceneIds,
    });
  }, [bus, scene, effectiveScene, split, composeHosts, deskSession]);

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
          className="wh-scene-overview-trigger"
          onClick={() => setOverviewOpen(true)}
          aria-haspopup="dialog"
          title="Scene overview"
        >
          <span className="wh-scene-overview-dot" aria-hidden />
          Overview
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
              <div key={pane.id} className="wh-pane" style={{ flex }}>
                <PaneChrome
                  scene={scene}
                  paneId={pane.id}
                  hosts={composeHosts}
                  onHostsChange={setComposeHosts}
                >
                  <PaneIdProvider paneId={pane.id}>
                    {renderPaneHost(pane.host)}
                  </PaneIdProvider>
                </PaneChrome>
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
        <SceneOverview
          scene={scene}
          effectiveScene={effectiveScene}
          split={split}
          composeHosts={composeHosts}
          bus={bus}
          open={overviewOpen}
          onClose={() => setOverviewOpen(false)}
          onHostsChange={setComposeHosts}
        />
      </div>
    </PaneBusProvider>
  );
}
