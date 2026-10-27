import type { PaneHost } from "@window-host/schema";
import type { ReactNode } from "react";
import { NotesWidget } from "./NotesWidget.js";
import { PomodoroWidget } from "./PomodoroWidget.js";

export function renderPaneHost(host: PaneHost): ReactNode {
  if (host.kind === "iframe") {
    return (
      <iframe
        className="wh-iframe"
        src={host.url}
        title={host.title ?? "Pane"}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    );
  }
  if (host.widgetId === "pomodoro") return <PomodoroWidget />;
  const slot = typeof host.props?.slot === "string" ? host.props.slot : "default";
  const label =
    typeof host.props?.label === "string"
      ? host.props.label
      : slot === "zoom-out"
        ? "Zoom out"
        : slot === "zoom-in"
          ? "Zoom in"
          : "Notes";
  return <NotesWidget slot={slot} label={label} />;
}
