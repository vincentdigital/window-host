import { isPickerEntryActive } from "@window-host/schema";
import type { PaneHost, Scene } from "@window-host/schema";
import { useCallback, useMemo } from "react";
import {
  catalogForLayout,
  commitHosts,
  hostForPane,
  setPaneFromPickerEntry,
  setPanePropInHosts,
  widgetIdFromHost,
} from "./compose-helpers.js";

type Props = {
  scene: Scene;
  paneId: string;
  hosts: Record<string, PaneHost>;
  onHostsChange: (hosts: Record<string, PaneHost>) => void;
  onClose?: () => void;
  variant?: "compact" | "detailed";
};

export function PaneHostPicker({
  scene,
  paneId,
  hosts,
  onHostsChange,
  onClose,
  variant = "detailed",
}: Props) {
  const catalog = useMemo(() => catalogForLayout(scene), [scene]);
  const host = hostForPane(scene, paneId, hosts);
  const activeWidget = widgetIdFromHost(host);
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

  const setPaneFromEntry = useCallback(
    (entry: (typeof catalog)[number]) => {
      applyHosts(setPaneFromPickerEntry(hosts, paneId, entry));
    },
    [applyHosts, hosts, paneId],
  );

  const setPaneProp = useCallback(
    (key: string, value: string) => {
      applyHosts(setPanePropInHosts(scene, hosts, paneId, key, value));
    },
    [applyHosts, hosts, paneId, scene],
  );

  return (
    <div className={`wh-host-picker ${variant}`}>
      <div
        className={variant === "compact" ? "wh-picker-pills" : "wh-compose-chips"}
        role="listbox"
        aria-label={`Widget for ${paneId}`}
      >
        {catalog.map((entry) => {
          const selected = isPickerEntryActive(host, entry);
          const base = variant === "compact" ? "wh-picker-pill" : "wh-compose-chip";
          return (
            <button
              key={entry.pickerKey}
              type="button"
              role="option"
              aria-selected={selected}
              className={selected ? `${base} active` : base}
              title={entry.description}
              onClick={() => setPaneFromEntry(entry)}
            >
              <span className="wh-picker-pill-label">{entry.label}</span>
              {variant === "detailed" ? (
                <span className="wh-compose-chip-desc">{entry.description}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {activeWidget === "notes" ? (
        <label className="wh-compose-field wh-compose-field-subtle">
          Slot
          <select value={notesSlot} onChange={(e) => setPaneProp("slot", e.target.value)}>
            <option value="zoom-out">Zoom out</option>
            <option value="zoom-in">Zoom in</option>
            <option value="default">Default</option>
          </select>
        </label>
      ) : null}
      {activeWidget === "bus-send" || activeWidget === "bus-listen" ? (
        <label className="wh-compose-field wh-compose-field-subtle">
          Topic
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
          <button type="button" className="wh-btn-ghost-subtle" onClick={onClose}>
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
