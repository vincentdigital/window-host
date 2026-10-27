import { z } from "zod";

export const widgetIdSchema = z.enum([
  "notes",
  "pomodoro",
  "bus-send",
  "bus-listen",
  "example-harness",
]);

export type WidgetId = z.infer<typeof widgetIdSchema>;

export type WidgetCatalogEntry = {
  id: WidgetId;
  label: string;
  description: string;
  /** Layouts that may include this widget */
  layouts: Array<"split-horizontal" | "trinity-rail">;
  defaultProps?: Record<string, unknown>;
};

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  {
    id: "notes",
    label: "Notes",
    description: "Scratch pad — zoom out / zoom in slots",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { slot: "zoom-out", label: "Notes" },
  },
  {
    id: "pomodoro",
    label: "Focus",
    description: "25-minute focus timer",
    layouts: ["split-horizontal", "trinity-rail"],
  },
  {
    id: "bus-send",
    label: "Link · send",
    description: "Publish a message on the pane bus (POC)",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { topic: "demo.ping" },
  },
  {
    id: "bus-listen",
    label: "Link · listen",
    description: "Show messages from another pane on the same topic",
    layouts: ["split-horizontal", "trinity-rail"],
    defaultProps: { topic: "demo.ping" },
  },
];

export function defaultHostForWidget(id: WidgetId): {
  kind: "widget";
  widgetId: WidgetId;
  props?: Record<string, unknown>;
} {
  const entry = WIDGET_CATALOG.find((w) => w.id === id)!;
  return {
    kind: "widget",
    widgetId: id,
    props: entry.defaultProps ? { ...entry.defaultProps } : undefined,
  };
}
