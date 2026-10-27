import type { PaneHost } from "@window-host/schema";
import type { ReactNode } from "react";
import { BusListenWidget } from "./BusListenWidget.js";
import { BusSendWidget } from "./BusSendWidget.js";
import { ExampleHarnessWidget } from "./ExampleHarnessWidget.js";
import { NotesWidget } from "./NotesWidget.js";
import { PomodoroWidget } from "./PomodoroWidget.js";

export function renderPaneHost(host: PaneHost): ReactNode {
  if (host.kind === "iframe") {
    return (
      <iframe
        className="wh-iframe wh-pane-host-iframe"
        src={host.url}
        title={host.title ?? "Pane"}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    );
  }
  if (host.widgetId === "example-harness") {
    const harness =
      typeof host.props?.harness === "string" ? host.props.harness : "integration-lab";
    return <ExampleHarnessWidget harness={harness} />;
  }
  if (host.widgetId === "pomodoro") return <PomodoroWidget />;
  if (host.widgetId === "bus-send") {
    const topic = typeof host.props?.topic === "string" ? host.props.topic : "demo.ping";
    const label = typeof host.props?.label === "string" ? host.props.label : undefined;
    return <BusSendWidget topic={topic} label={label} />;
  }
  if (host.widgetId === "bus-listen") {
    const topic = typeof host.props?.topic === "string" ? host.props.topic : "demo.ping";
    const label = typeof host.props?.label === "string" ? host.props.label : undefined;
    return <BusListenWidget topic={topic} label={label} />;
  }
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
