import type { BusEnvelope, PaneBus } from "@window-host/core";
import type { PaneHost, Scene } from "@window-host/schema";

/** Read-only desk snapshot for agents, Playwright, and debug UI. */
export type DeskSnapshot = {
  v: 1;
  sceneId: string;
  sceneTitle: string;
  layout: Scene["layout"];
  split?: number;
  panes: Array<{ id: string; host: PaneHost }>;
  composeOverridePaneIds: string[];
  busMessageCount: number;
  recentBus: readonly BusEnvelope[];
};

export type DeskCommand =
  | { type: "bus.publish"; topic: string; payload: unknown; paneId?: string }
  | { type: "compose.reset" }
  | { type: "compose.setPane"; paneId: string; host: PaneHost }
  | { type: "scene.set"; sceneId: string };

export type DeskSessionApi = {
  version: 1;
  getSnapshot: () => DeskSnapshot;
  dispatch: (command: DeskCommand) => { ok: true } | { ok: false; error: string };
  subscribe: (listener: (snapshot: DeskSnapshot) => void) => () => void;
};

export type DeskSessionNav = {
  setSceneId: (id: string) => void;
  allowedSceneIds: () => string[];
};

export type DeskSessionDeps = {
  getScene: () => Scene;
  getEffectiveScene: () => Scene;
  getSplit: () => number;
  getComposeHosts: () => Record<string, PaneHost>;
  bus: PaneBus;
  setComposeHosts: (hosts: Record<string, PaneHost>) => void;
  clearCompose: () => void;
  setSceneId?: (id: string) => void;
  allowedSceneIds?: () => string[];
};

const GLOBAL_KEY = "__windowHost";

declare global {
  interface Window {
    __windowHost?: DeskSessionApi;
  }
}

export function registerDeskSession(deps: DeskSessionDeps): () => void {
  const listeners = new Set<(snapshot: DeskSnapshot) => void>();

  const getSnapshot = (): DeskSnapshot => {
    const scene = deps.getScene();
    const effective = deps.getEffectiveScene();
    const composeHosts = deps.getComposeHosts();
    return {
      v: 1,
      sceneId: scene.id,
      sceneTitle: scene.title,
      layout: scene.layout,
      split: scene.layout.kind === "split-horizontal" ? deps.getSplit() : undefined,
      panes: effective.panes.map((p) => ({ id: p.id, host: p.host })),
      composeOverridePaneIds: Object.keys(composeHosts),
      busMessageCount: deps.bus.history().length,
      recentBus: deps.bus.history().slice(-20),
    };
  };

  const notify = () => {
    const snap = getSnapshot();
    for (const fn of listeners) fn(snap);
  };

  const dispatch = (command: DeskCommand): { ok: true } | { ok: false; error: string } => {
    try {
      switch (command.type) {
        case "bus.publish": {
          deps.bus.publish(command.paneId ?? "session", command.topic, command.payload);
          return { ok: true };
        }
        case "compose.reset": {
          deps.clearCompose();
          notify();
          return { ok: true };
        }
        case "compose.setPane": {
          const next = { ...deps.getComposeHosts(), [command.paneId]: command.host };
          deps.setComposeHosts(next);
          notify();
          return { ok: true };
        }
        case "scene.set": {
          if (!deps.setSceneId) return { ok: false, error: "scene navigation not wired" };
          const allowed = deps.allowedSceneIds?.() ?? [];
          if (allowed.length > 0 && !allowed.includes(command.sceneId)) {
            return { ok: false, error: `unknown scene: ${command.sceneId}` };
          }
          deps.setSceneId(command.sceneId);
          notify();
          return { ok: true };
        }
        default:
          return { ok: false, error: "unknown command" };
      }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "dispatch failed" };
    }
  };

  const api: DeskSessionApi = {
    version: 1,
    getSnapshot,
    dispatch,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  window[GLOBAL_KEY] = api;

  const originalPublish = deps.bus.publish.bind(deps.bus);
  deps.bus.publish = (paneId, topic, payload, correlationId) => {
    const envelope = originalPublish(paneId, topic, payload, correlationId);
    notify();
    return envelope;
  };

  return () => {
    deps.bus.publish = originalPublish;
    listeners.clear();
    if (window[GLOBAL_KEY] === api) delete window[GLOBAL_KEY];
  };
}
