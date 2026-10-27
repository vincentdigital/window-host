import { clearComposeOverrides, type PaneBus } from "@window-host/core";
import type { PaneHost, Scene } from "@window-host/schema";
import { useCallback, useEffect, useMemo, useState } from "react";
import { labelForHost } from "./compose-helpers.js";
import type { DeskSnapshot } from "./desk-session.js";
import { PaneHostPicker } from "./PaneHostPicker.js";

type Props = {
  scene: Scene;
  effectiveScene: Scene;
  split: number;
  composeHosts: Record<string, PaneHost>;
  bus: PaneBus;
  open: boolean;
  onClose: () => void;
  onHostsChange: (hosts: Record<string, PaneHost>) => void;
};

function hostSummary(host: PaneHost): string {
  if (host.kind === "iframe") return host.url;
  const parts: string[] = [host.widgetId];
  if (host.props) {
    for (const [k, v] of Object.entries(host.props)) {
      parts.push(`${k}=${String(v)}`);
    }
  }
  return parts.join(" · ");
}

export function SceneOverview({
  scene,
  effectiveScene,
  split,
  composeHosts,
  bus,
  open,
  onClose,
  onHostsChange,
}: Props) {
  const [expandedPane, setExpandedPane] = useState<string | null>(null);
  const [busLog, setBusLog] = useState<ReturnType<PaneBus["history"]>>([]);
  const [deskSnap, setDeskSnap] = useState<DeskSnapshot | null>(null);

  const overrideCount = useMemo(() => Object.keys(composeHosts).length, [composeHosts]);

  const refreshDeskSnap = useCallback(() => {
    const api = window.__windowHost;
    if (api) setDeskSnap(api.getSnapshot());
  }, []);

  useEffect(() => {
    if (!open) {
      setDeskSnap(null);
      return;
    }
    refreshDeskSnap();
    const off = window.__windowHost?.subscribe(() => refreshDeskSnap());
    return () => off?.();
  }, [open, refreshDeskSnap]);

  useEffect(() => {
    if (open) refreshDeskSnap();
  }, [open, split, composeHosts, effectiveScene, busLog, refreshDeskSnap]);

  useEffect(() => {
    if (!open) return;
    setBusLog(bus.history());
    const topics = new Set<string>();
    for (const p of effectiveScene.panes) {
      const h = p.host;
      if (h.kind === "widget" && typeof h.props?.topic === "string") topics.add(h.props.topic);
    }
    topics.add("demo.ping");
    const unsubs = [...topics].map((topic) =>
      bus.subscribe(topic, () => setBusLog(bus.history())),
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unsubs.forEach((u) => u());
      window.removeEventListener("keydown", onKey);
    };
  }, [open, bus, effectiveScene.panes, onClose]);

  const resetScene = () => {
    onHostsChange({});
    clearComposeOverrides(scene.id);
  };

  if (!open) return null;

  const layoutLabel =
    scene.layout.kind === "split-horizontal"
      ? `split ${Math.round(split * 100)}% / ${Math.round((1 - split) * 100)}%`
      : `trinity-rail`;

  return (
    <div className="wh-overview-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="wh-overview-panel"
        role="dialog"
        aria-labelledby="wh-overview-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="wh-overview-head">
          <div>
            <h2 id="wh-overview-title" className="wh-overview-title">Scene overview</h2>
            <p className="wh-overview-sub">{scene.title}</p>
          </div>
          <button type="button" className="wh-overview-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <section className="wh-overview-section" aria-label="Scene state">
          <h3 className="wh-overview-section-label">State</h3>
          <dl className="wh-overview-dl">
            <div>
              <dt>Scene id</dt>
              <dd><code>{scene.id}</code></dd>
            </div>
            <div>
              <dt>Layout</dt>
              <dd>{layoutLabel}</dd>
            </div>
            <div>
              <dt>Compose overrides</dt>
              <dd>{overrideCount === 0 ? "none (defaults)" : `${overrideCount} pane(s)`}</dd>
            </div>
            <div>
              <dt>Bus messages</dt>
              <dd>{busLog.length} in session buffer</dd>
            </div>
          </dl>
        </section>

        <section className="wh-overview-section" aria-label="Panes">
          <h3 className="wh-overview-section-label">Panes</h3>
          <ul className="wh-overview-pane-list">
            {effectiveScene.panes.map((pane) => {
              const host = pane.host;
              const defaultHost = scene.panes.find((p) => p.id === pane.id)!.host;
              const customized =
                JSON.stringify(host) !== JSON.stringify(defaultHost) ? "custom" : "default";
              const expanded = expandedPane === pane.id;
              return (
                <li key={pane.id} className="wh-overview-pane-item">
                  <button
                    type="button"
                    className="wh-overview-pane-row"
                    aria-expanded={expanded}
                    onClick={() => setExpandedPane(expanded ? null : pane.id)}
                  >
                    <span className="wh-overview-pane-id">{pane.id}</span>
                    <span className="wh-overview-pane-host">{labelForHost(host)}</span>
                    <span className={`wh-overview-pane-tag ${customized}`}>{customized}</span>
                  </button>
                  <p className="wh-overview-pane-detail">
                    <code>{hostSummary(host)}</code>
                  </p>
                  {expanded ? (
                    <div className="wh-overview-pane-edit">
                      <PaneHostPicker
                        scene={scene}
                        paneId={pane.id}
                        hosts={composeHosts}
                        onHostsChange={onHostsChange}
                        variant="compact"
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="wh-overview-section" aria-label="Desk session snapshot">
          <h3 className="wh-overview-section-label">Desk session</h3>
          <p className="wh-overview-hint">
            Same <code>getSnapshot()</code> object grandparent tests assert — copy from console via{" "}
            <code>__windowHost.getSnapshot()</code>.
          </p>
          {deskSnap ? (
            <pre className="wh-overview-snapshot">{JSON.stringify(deskSnap, null, 2)}</pre>
          ) : (
            <p className="wh-overview-empty">Session API not available.</p>
          )}
        </section>

        <section className="wh-overview-section" aria-label="Bus debug">
          <h3 className="wh-overview-section-label">Bus (debug)</h3>
          {busLog.length === 0 ? (
            <p className="wh-overview-empty">No messages yet this session.</p>
          ) : (
            <ol className="wh-overview-bus-log">
              {[...busLog].reverse().slice(0, 12).map((e) => (
                <li key={e.id}>
                  <span className="wh-overview-bus-from">{e.source.paneId}</span>
                  <span className="wh-overview-bus-topic">{e.topic}</span>
                  <code>{JSON.stringify(e.payload)}</code>
                </li>
              ))}
            </ol>
          )}
        </section>

        <footer className="wh-overview-foot">
          <button type="button" className="wh-btn wh-btn-ghost wh-btn-sm" onClick={resetScene}>
            Reset compose
          </button>
          <a className="wh-overview-examples" href="/examples/" onClick={onClose}>
            Integration examples
          </a>
          <button type="button" className="wh-btn wh-btn-sm" onClick={onClose}>
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
}
