import type { PaneHost, Scene } from "@window-host/schema";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { hostForPane, labelForHost } from "./compose-helpers.js";
import { PaneHostPicker } from "./PaneHostPicker.js";

type Props = {
  scene: Scene;
  paneId: string;
  hosts: Record<string, PaneHost>;
  onHostsChange: (hosts: Record<string, PaneHost>) => void;
  children: ReactNode;
};

export function PaneChrome({ scene, paneId, hosts, onHostsChange, children }: Props) {
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const host = hostForPane(scene, paneId, hosts);
  const label = labelForHost(host);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="wh-pane-shell" ref={shellRef} data-pane={paneId}>
      <header className="wh-pane-chrome">
        <span className="wh-pane-chrome-id">{paneId}</span>
        <button
          type="button"
          className="wh-pane-chrome-picker"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`Choose content for ${paneId}, currently ${label}`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="wh-pane-chrome-picker-label">{label}</span>
          <span className="wh-pane-chrome-chevron" aria-hidden>▾</span>
        </button>
      </header>
      {open ? (
        <div
          className="wh-pane-popover"
          role="dialog"
          aria-label={`Content picker for ${paneId}`}
        >
          <PaneHostPicker
            scene={scene}
            paneId={paneId}
            hosts={hosts}
            onHostsChange={onHostsChange}
            onClose={() => setOpen(false)}
          />
        </div>
      ) : null}
      <div className="wh-pane-content">{children}</div>
    </div>
  );
}
