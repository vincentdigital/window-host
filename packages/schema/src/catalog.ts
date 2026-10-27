import type { WidgetId } from "./widgets.js";
import { WIDGET_CATALOG, type WidgetCatalogEntry } from "./widgets.js";

export type PickerCatalogEntry = WidgetCatalogEntry & {
  /** Unique key when several entries share one widgetId */
  pickerKey: string;
};

const EXAMPLE_PICKER: PickerCatalogEntry[] = [
  {
    pickerKey: "example-integration-lab",
    id: "example-harness",
    label: "Example · lab",
    description: "All integration patterns on one bus",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { harness: "integration-lab" },
  },
  {
    pickerKey: "example-vanilla-bus",
    id: "example-harness",
    label: "Example · vanilla bus",
    description: "Two-pane bus without React",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { harness: "vanilla-bus" },
  },
  {
    pickerKey: "example-iframe-guest",
    id: "example-harness",
    label: "Example · iframe guest",
    description: "postMessage guest (pairs with listen pane)",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { harness: "iframe-guest" },
  },
  {
    pickerKey: "example-iframe-harness",
    id: "example-harness",
    label: "Example · iframe harness",
    description: "iframe + parent bridge demo",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { harness: "iframe-harness" },
  },
  {
    pickerKey: "example-mfe",
    id: "example-harness",
    label: "Example · ESM remote",
    description: "dynamic import() mount",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { harness: "mfe-harness" },
  },
  {
    pickerKey: "example-wc",
    id: "example-harness",
    label: "Example · web component",
    description: "Custom element + DOM events",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { harness: "wc-harness" },
  },
  {
    pickerKey: "example-server",
    id: "example-harness",
    label: "Example · server SSE",
    description: "Needs npm run examples:server locally",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { harness: "server-harness" },
  },
];

export function pickerCatalogForLayout(
  layoutKind: "split-horizontal" | "trinity-rail",
): PickerCatalogEntry[] {
  const core = WIDGET_CATALOG.filter((w) => w.layouts.includes(layoutKind)).map((w) => ({
    ...w,
    pickerKey: w.id,
  }));
  const examples = EXAMPLE_PICKER.filter((w) => w.layouts.includes(layoutKind));
  return [...core, ...examples];
}

export function isPickerEntryActive(host: { kind: string; widgetId?: string; props?: Record<string, unknown> }, entry: PickerCatalogEntry): boolean {
  if (host.kind !== "widget" || host.widgetId !== entry.id) return false;
  if (entry.id === "example-harness") {
    return host.props?.harness === entry.defaultProps?.harness;
  }
  if (entry.defaultProps) {
    for (const [k, v] of Object.entries(entry.defaultProps)) {
      if (host.props?.[k] !== v) return false;
    }
  }
  return true;
}

export function hostFromPickerEntry(entry: PickerCatalogEntry): {
  kind: "widget";
  widgetId: WidgetId;
  props?: Record<string, unknown>;
} {
  return {
    kind: "widget",
    widgetId: entry.id,
    props: entry.defaultProps ? { ...entry.defaultProps } : undefined,
  };
}
