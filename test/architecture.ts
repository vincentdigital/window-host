import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export const ARCH_MAX_LINES = 250;

export const LAYERS = ["schema", "core", "widgets", "shell", "desk"] as const;
export type Layer = (typeof LAYERS)[number];

export const ALLOWED: Record<Layer, readonly Layer[]> = {
  schema: [],
  core: ["schema"],
  widgets: ["schema"],
  shell: ["schema", "core", "widgets"],
  desk: ["schema", "core", "shell", "widgets"],
};

const LAYER_PREFIXES: { prefix: string; layer: Layer }[] = [
  { prefix: "packages/schema/", layer: "schema" },
  { prefix: "packages/core/", layer: "core" },
  { prefix: "packages/widgets/", layer: "widgets" },
  { prefix: "packages/shell/", layer: "shell" },
  { prefix: "apps/desk/", layer: "desk" },
];

const IMPORT_RE = /from\s+["'](@window-host\/[^"']+|\.[^"']+)["']/g;

export function layerForFile(rel: string): Layer | null {
  for (const { prefix, layer } of LAYER_PREFIXES) {
    if (rel.startsWith(prefix)) return layer;
  }
  return null;
}

export function resolveImport(
  fromRel: string,
  spec: string,
): { layer: Layer | null } {
  if (spec.startsWith("@window-host/")) {
    const pkg = spec.split("/")[1];
    const map: Record<string, Layer> = {
      schema: "schema",
      core: "core",
      widgets: "widgets",
      shell: "shell",
    };
    return { layer: map[pkg] ?? null };
  }
  if (!spec.startsWith(".")) return { layer: null };
  const fromDir = path.dirname(fromRel);
  const rel = path.normalize(path.join(fromDir, spec));
  return { layer: layerForFile(rel) };
}

export function listTsFiles(root: string, sub: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(path.relative(root, full));
    }
  };
  walk(path.join(root, sub));
  return out;
}

export function forbiddenEdges(root: string): string[] {
  const hits: string[] = [];
  for (const sub of ["packages", "apps"]) {
    for (const rel of listTsFiles(root, sub)) {
      const fromLayer = layerForFile(rel);
      if (!fromLayer) continue;
      const content = readFileSync(path.join(root, rel), "utf8");
      for (const m of content.matchAll(IMPORT_RE)) {
        const spec = m[1];
        const { layer: toLayer } = resolveImport(rel, spec);
        if (!toLayer || toLayer === fromLayer) continue;
        const allowed = ALLOWED[fromLayer];
        if (!allowed.includes(toLayer)) {
          hits.push(`${rel}: ${fromLayer} -> ${toLayer} (${spec})`);
        }
      }
    }
  }
  return hits;
}
