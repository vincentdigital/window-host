import {
  clearComposeOverrides,
  overridesFromHosts,
  writeComposeOverrides,
} from "@window-host/core";
import {
  WIDGET_CATALOG,
  defaultHostForWidget,
  type PaneHost,
  type Scene,
  type WidgetId,
} from "@window-host/schema";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  scene: Scene;
  open: boolean;
  onClose: () => void;
  hosts: Record<string, PaneHost>;
  onHostsChange: (hosts: Record<string, PaneHost>) => void;
};

function hostForPane(scene: Scene, paneId: string, hosts: Record<string, PaneHost>): PaneHost {
  return hosts[paneId] ?? scene.panes.find((p) => p.id === paneId)!.host;
}

function widgetIdFromHost(host: PaneHost): WidgetId | null {
  return host.kind === "widget" ? host.widgetId : null;
}

export function PaneComposer({ scene, open, onClose, hosts, onHostsChange }: Props) {
  const catalog = useMemo(
    () => WIDGET_CATALOG.filter((w) => w.layouts.includes(scene.layout.kind)),
    [scene.layout.kind],
  );

  const [draft, setDraft] = useState(hosts);

  useEffect(() => {
    if (open) setDraft(hosts);
  }, [open, hosts]);

  const setPaneWidget = useCallback(
    (paneId: string, widgetId: WidgetId) => {
      const next = { ...draft, [paneId]: defaultHostForWidget(widgetId) };
      setDraft(next);
      onHostsChange(next);
      const overrides = overridesFromHosts(scene, next);
      if (Object.keys(overrides).length === 0) clearComposeOverrides(scene.id);
      else writeComposeOverrides(scene.id, overrides);
    },
    [draft, onHostsChange, scene],
  );

  const setPaneProp = useCallback(
    (paneId: string, key: string, value: string) => {
      const current = hostForPane(scene, paneId, draft);
      if (current.kind !== "widget") return;
      const nextHost: PaneHost = {
        ...current,
        props: { ...current.props, [key]: value },
      };
      const next = { ...draft, [paneId]: nextHost };
      setDraft(next);
      onHostsChange(next);
      writeComposeOverrides(scene.id, overridesFromHosts(scene, next));
    },
    [draft, onHostsChange, scene],
  );

  const resetScene = useCallback(() => {
    setDraft({});
    onHostsChange({});
    clearComposeOverrides(scene.id);
  }, [onHostsChange, scene.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="wh-compose-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="wh-compose-panel"
        role="dialog"
        aria-labelledby="wh-compose-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="wh-compose-head">
          <div>
            <h2 id="wh-compose-title" className="wh-compose-title">Compose panes</h2>
            <p className="wh-compose-sub">
              Choose what each pane shows. Saved locally for <strong>{scene.title}</strong>.
            </p>
          </div>
          <button type="button" className="wh-compose-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="wh-compose-body">
          {scene.panes.map((pane) => {
            const host = hostForPane(scene, pane.id, draft);
            const active = widgetIdFromHost(host);
            const topic =
              host.kind === "widget" && typeof host.props?.topic === "string"
                ? host.props.topic
                : "demo.ping";
            const notesSlot =
              host.kind === "widget" && typeof host.props?.slot === "string"
                ? host.props.slot
                : "zoom-out";

            return (
              <section key={pane.id} className="wh-compose-pane" data-pane={pane.id}>
                <h3 className="wh-compose-pane-label">{pane.id}</h3>
                <div className="wh-compose-chips" role="listbox" aria-label={`Widget for ${pane.id}`}>
                  {catalog.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      role="option"
                      aria-selected={active === entry.id}
                      className={
                        active === entry.id ? "wh-compose-chip active" : "wh-compose-chip"
                      }
                      onClick={() => setPaneWidget(pane.id, entry.id)}
                    >
                      <span className="wh-compose-chip-title">{entry.label}</span>
                      <span className="wh-compose-chip-desc">{entry.description}</span>
                    </button>
                  ))}
                </div>
                {active === "notes" ? (
                  <label className="wh-compose-field">
                    Notes slot
                    <select
                      value={notesSlot}
                      onChange={(e) => setPaneProp(pane.id, "slot", e.target.value)}
                    >
                      <option value="zoom-out">Zoom out</option>
                      <option value="zoom-in">Zoom in</option>
                      <option value="default">Default</option>
                    </select>
                  </label>
                ) : null}
                {active === "bus-send" || active === "bus-listen" ? (
                  <label className="wh-compose-field">
                    Bus topic
                    <input
                      type="text"
                      value={topic}
                      spellCheck={false}
                      onChange={(e) => setPaneProp(pane.id, "topic", e.target.value)}
                    />
                  </label>
                ) : null}
              </section>
            );
          })}
        </div>

        <footer className="wh-compose-foot">
          <button type="button" className="wh-btn wh-btn-ghost" onClick={resetScene}>
            Reset to scene defaults
          </button>
          <button type="button" className="wh-btn" onClick={onClose}>
            Done
          </button>
        </footer>
      </aside>
    </div>
  );
}
