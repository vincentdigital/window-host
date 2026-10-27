import type { PaneHost, Scene, WidgetId } from "@window-host/schema";
import { useCallback, useMemo } from "react";
import {
  catalogForLayout,
  commitHosts,
  hostForPane,
  setPanePropInHosts,
  setPaneWidgetInHosts,
  widgetIdFromHost,
} from "./compose-helpers.js";

type Props = {
  scene: Scene;
  paneId: string;
  hosts: Record<string, PaneHost>;
  onHostsChange: (hosts: Record<string, PaneHost>) => void;
  /** Popover: show a dismiss control */
  onClose?: () => void;
};

export function PaneHostPicker({ scene, paneId, hosts, onHostsChange, onClose }: Props) {
  const catalog = useMemo(() => catalogForLayout(scene), [scene]);
  const host = hostForPane(scene, paneId, hosts);
  const active = widgetIdFromHost(host);
  const topic =
    host.kind === "widget" && typeof host.props?.topic === "string"
      ? host.props.topic
      : "demo.ping";
  const notesSlot =
    host.kind === "widget" && typeof host.props?.slot === "string"
      ? host.props.slot
      : "zoom-out";

  const applyHosts = useCallback(
    (next: Record<string, PaneHost>) => {
      onHostsChange(next);
      commitHosts(scene, next);
    },
    [onHostsChange, scene],
  );

  const setPaneWidget = useCallback(
    (widgetId: WidgetId) => {
      applyHosts(setPaneWidgetInHosts(hosts, paneId, widgetId));
    },
    [applyHosts, hosts, paneId, scene],
  );

  const setPaneProp = useCallback(
    (key: string, value: string) => {
      applyHosts(setPanePropInHosts(scene, hosts, paneId, key, value));
    },
    [applyHosts, hosts, paneId, scene],
  );

  return (
    <div className="wh-host-picker">
      <div className="wh-compose-chips" role="listbox" aria-label={`Widget for ${paneId}`}>
        {catalog.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="option"
            aria-selected={active === entry.id}
            className={active === entry.id ? "wh-compose-chip active" : "wh-compose-chip"}
            onClick={() => setPaneWidget(entry.id)}
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
            onChange={(e) => setPaneProp("slot", e.target.value)}
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
            onChange={(e) => setPaneProp("topic", e.target.value)}
          />
        </label>
      ) : null}
      {onClose ? (
        <div className="wh-host-picker-foot">
          <button type="button" className="wh-btn wh-btn-ghost wh-btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
