import { paneHostSchema, type PaneHost, type Scene } from "@window-host/schema";
import { z } from "zod";

export type ComposeOverrides = Record<string, PaneHost>;

const overridesSchema = z.record(z.string(), paneHostSchema);

export function storageKeyForCompose(sceneId: string): string {
  return `window-host.compose.${sceneId}`;
}

export function readComposeOverrides(sceneId: string): ComposeOverrides | null {
  try {
    const raw = localStorage.getItem(storageKeyForCompose(sceneId));
    if (!raw) return null;
    const parsed = overridesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeComposeOverrides(sceneId: string, overrides: ComposeOverrides): void {
  localStorage.setItem(storageKeyForCompose(sceneId), JSON.stringify(overrides));
}

export function clearComposeOverrides(sceneId: string): void {
  localStorage.removeItem(storageKeyForCompose(sceneId));
}

export function sceneWithCompose(scene: Scene, overrides: ComposeOverrides | null): Scene {
  if (!overrides || Object.keys(overrides).length === 0) return scene;
  return {
    ...scene,
    panes: scene.panes.map((p) => ({
      ...p,
      host: overrides[p.id] ?? p.host,
    })),
  };
}

/** Build overrides map from per-pane hosts (only entries that differ from scene defaults). */
export function overridesFromHosts(
  scene: Scene,
  hosts: Record<string, PaneHost>,
): ComposeOverrides {
  const out: ComposeOverrides = {};
  for (const pane of scene.panes) {
    const host = hosts[pane.id];
    if (!host) continue;
    if (JSON.stringify(host) !== JSON.stringify(pane.host)) {
      out[pane.id] = host;
    }
  }
  return out;
}
