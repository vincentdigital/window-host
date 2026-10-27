import { z } from "zod";

export const SPLIT_MIN = 0.2;
export const SPLIT_MAX = 0.8;

export const paneHostSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("widget"),
    widgetId: z.enum(["notes", "pomodoro"]),
    props: z.record(z.string(), z.unknown()).optional(),
  }),
  z.object({
    kind: z.literal("iframe"),
    url: z.string().url(),
    title: z.string().optional(),
  }),
]);

export const paneSchema = z.object({
  id: z.string().min(1),
  host: paneHostSchema,
});

export const layoutSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("split-horizontal"),
    split: z.number().min(SPLIT_MIN).max(SPLIT_MAX).default(0.5),
  }),
  z.object({
    kind: z.literal("trinity-rail"),
    /** Width share of left rail (center gets remainder minus right). */
    leftRail: z.number().min(0.12).max(0.35).default(0.22),
    rightRail: z.number().min(0.12).max(0.35).default(0.22),
  }),
]);

export const sceneSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  layout: layoutSchema,
  panes: z.array(paneSchema).min(2).max(3),
});

export type PaneHost = z.infer<typeof paneHostSchema>;
export type PaneDef = z.infer<typeof paneSchema>;
export type LayoutDef = z.infer<typeof layoutSchema>;
export type Scene = z.infer<typeof sceneSchema>;

export function parseScene(raw: unknown): Scene {
  const scene = sceneSchema.parse(raw);
  if (scene.layout.kind === "split-horizontal" && scene.panes.length !== 2) {
    throw new Error("split-horizontal requires exactly 2 panes");
  }
  if (scene.layout.kind === "trinity-rail" && scene.panes.length !== 3) {
    throw new Error("trinity-rail requires exactly 3 panes");
  }
  return scene;
}
