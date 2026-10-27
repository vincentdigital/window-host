import {
  clearComposeOverrides,
  overridesFromHosts,
  writeComposeOverrides,
} from "@window-host/core";
import {
  EXAMPLE_HARNESS_LABELS,
  WIDGET_CATALOG,
  exampleHarnessSchema,
  hostFromPickerEntry,
  pickerCatalogForLayout,
  type PaneHost,
  type PickerCatalogEntry,
  type Scene,
} from "@window-host/schema";

export function hostForPane(
  scene: Scene,
  paneId: string,
  hosts: Record<string, PaneHost>,
): PaneHost {
  return hosts[paneId] ?? scene.panes.find((p) => p.id === paneId)!.host;
}

export function widgetIdFromHost(host: PaneHost): string | null {
  return host.kind === "widget" ? host.widgetId : null;
}

export function labelForHost(host: PaneHost): string {
  if (host.kind === "iframe") return host.title ?? "Embed";
  if (host.kind === "widget" && host.widgetId === "example-harness") {
    const h = typeof host.props?.harness === "string" ? host.props.harness : "integration-lab";
    const parsed = exampleHarnessSchema.safeParse(h);
    if (parsed.success) return `Example · ${EXAMPLE_HARNESS_LABELS[parsed.data]}`;
    return "Example";
  }
  const entry = WIDGET_CATALOG.find((w) => w.id === host.widgetId);
  return entry?.label ?? host.widgetId;
}

export function catalogForLayout(scene: Scene): PickerCatalogEntry[] {
  return pickerCatalogForLayout(scene.layout.kind as "split-horizontal" | "trinity-rail");
}

export function commitHosts(scene: Scene, hosts: Record<string, PaneHost>): void {
  const overrides = overridesFromHosts(scene, hosts);
  if (Object.keys(overrides).length === 0) clearComposeOverrides(scene.id);
  else writeComposeOverrides(scene.id, overrides);
}

export function setPaneFromPickerEntry(
  hosts: Record<string, PaneHost>,
  paneId: string,
  entry: PickerCatalogEntry,
): Record<string, PaneHost> {
  return { ...hosts, [paneId]: hostFromPickerEntry(entry) };
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
