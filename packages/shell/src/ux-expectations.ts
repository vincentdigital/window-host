import type { DeskSnapshot } from "./desk-session.js";
import type { UxScenario } from "@window-host/schema";

function deepMatch(actual: unknown, expected: unknown): boolean {
  if (expected === undefined) return true;
  if (typeof expected !== "object" || expected === null) return actual === expected;
  if (typeof actual !== "object" || actual === null) return false;
  if (Array.isArray(expected)) return false;
  for (const [k, v] of Object.entries(expected as Record<string, unknown>)) {
    if (!deepMatch((actual as Record<string, unknown>)[k], v)) return false;
  }
  return true;
}

export function assertUxExpectation(
  snapshot: DeskSnapshot,
  scenario: UxScenario,
): { ok: true } | { ok: false; error: string } {
  const { then } = scenario;

  if (then.snapshot?.sceneId && snapshot.sceneId !== then.snapshot.sceneId) {
    return {
      ok: false,
      error: `sceneId: expected ${then.snapshot.sceneId}, got ${snapshot.sceneId}`,
    };
  }

  if (then.snapshot?.paneWidgetIds) {
    for (const [paneId, widgetId] of Object.entries(then.snapshot.paneWidgetIds)) {
      const pane = snapshot.panes.find((p) => p.id === paneId);
      const host = pane?.host;
      if (!host || host.kind !== "widget" || host.widgetId !== widgetId) {
        return {
          ok: false,
          error: `pane ${paneId}: expected widget ${widgetId}, got ${JSON.stringify(host)}`,
        };
      }
    }
  }

  if (then.snapshot?.minBusMessages !== undefined) {
    if (snapshot.busMessageCount < then.snapshot.minBusMessages) {
      return {
        ok: false,
        error: `busMessageCount: expected >= ${then.snapshot.minBusMessages}, got ${snapshot.busMessageCount}`,
      };
    }
  }

  if (then.busLast) {
    const last = snapshot.recentBus.filter((e) => e.topic === then.busLast!.topic).at(-1);
    if (!last) {
      return { ok: false, error: `no bus message on topic ${then.busLast.topic}` };
    }
    if (then.busLast.payload !== undefined && !deepMatch(last.payload, then.busLast.payload)) {
      return {
        ok: false,
        error: `bus payload mismatch: ${JSON.stringify(last.payload)} vs ${JSON.stringify(then.busLast.payload)}`,
      };
    }
  }

  return { ok: true };
}
