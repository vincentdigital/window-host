import { z } from "zod";

/** Commands mirror `DeskCommand` in shell desk-session (UX scenario is the contract). */
export const uxCommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("bus.publish"),
    topic: z.string(),
    payload: z.unknown(),
    paneId: z.string().optional(),
  }),
  z.object({ type: z.literal("compose.reset") }),
  z.object({
    type: z.literal("compose.setPane"),
    paneId: z.string(),
    host: z.record(z.string(), z.unknown()),
  }),
  z.object({ type: z.literal("scene.set"), sceneId: z.string() }),
]);

export const uxExpectationSchema = z.object({
  snapshot: z
    .object({
      sceneId: z.string().optional(),
      /** pane id → widgetId for widget hosts */
      paneWidgetIds: z.record(z.string(), z.string()).optional(),
      minBusMessages: z.number().int().min(0).optional(),
    })
    .optional(),
  busLast: z
    .object({
      topic: z.string(),
      payload: z.unknown().optional(),
    })
    .optional(),
});

/**
 * Grandparent test — plain-language UX flow as data.
 * Readable without React/DOM; executed via desk session (no Playwright).
 */
export const uxScenarioSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1),
  description: z.string().optional(),
  sceneId: z.string().min(1),
  when: z.array(uxCommandSchema).default([]),
  then: uxExpectationSchema,
});

export type UxScenario = z.infer<typeof uxScenarioSchema>;
export type UxCommand = z.infer<typeof uxCommandSchema>;

export function parseUxScenario(raw: unknown): UxScenario {
  return uxScenarioSchema.parse(raw);
}
