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

export function hostForPane(
  scene: Scene,
  paneId: string,
  hosts: Record<string, PaneHost>,
): PaneHost {
  return hosts[paneId] ?? scene.panes.find((p) => p.id === paneId)!.host;
}

export function widgetIdFromHost(host: PaneHost): WidgetId | null {
  return host.kind === "widget" ? host.widgetId : null;
}

export function labelForHost(host: PaneHost): string {
  if (host.kind === "iframe") return host.title ?? "Embed";
  const entry = WIDGET_CATALOG.find((w) => w.id === host.widgetId);
  return entry?.label ?? host.widgetId;
}

export function catalogForLayout(scene: Scene) {
  return WIDGET_CATALOG.filter((w) => w.layouts.includes(scene.layout.kind));
}

export function commitHosts(scene: Scene, hosts: Record<string, PaneHost>): void {
  const overrides = overridesFromHosts(scene, hosts);
  if (Object.keys(overrides).length === 0) clearComposeOverrides(scene.id);
  else writeComposeOverrides(scene.id, overrides);
}

export function setPaneWidgetInHosts(
  hosts: Record<string, PaneHost>,
  paneId: string,
  widgetId: WidgetId,
): Record<string, PaneHost> {
  return { ...hosts, [paneId]: defaultHostForWidget(widgetId) };
}

export function setPanePropInHosts(
  scene: Scene,
  hosts: Record<string, PaneHost>,
  paneId: string,
  key: string,
  value: string,
): Record<string, PaneHost> {
  const current = hostForPane(scene, paneId, hosts);
  if (current.kind !== "widget") return hosts;
  return {
    ...hosts,
    [paneId]: { ...current, props: { ...current.props, [key]: value } },
  };
}
