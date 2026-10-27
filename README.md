# window-host

A minimal **desk shell**: compose panes with a draggable split, ship as a **static build**, prove architecture with built-in **Scenes** and widgets before embedding homelab iframes.

## Scenes

**Scenes** are named layouts checked into [`scenes/`](scenes/). Each scene picks a **layout** and assigns a **host** per pane (`widget` or `iframe`).

| Scene | Layout | Panes |
| --- | --- | --- |
| **Duet** | `split-horizontal` (resizable) | Zoom out notes · Pomodoro |
| **Rail** | `trinity-rail` (22 / 56 / 22) | Zoom out · Pomodoro · Zoom in |

Open the desk with `?scene=duet` or `?scene=rail`, or use the scene pills.

## Packages

| Package | Role |
| --- | --- |
| `@window-host/schema` | Scene manifest (Zod) — 1:1 with JSON |
| `@window-host/core` | Layout math, split clamp, storage keys |
| `@window-host/widgets` | Notes (zoom-in/out slots), Pomodoro |
| `@window-host/shell` | `SceneShell` — row, divider, hosts |
| `@window-host/desk` | Vite app — static deploy artifact |

Layer import rules: `npm run test:arch`. No tenant hostnames in `schema` / `core`: `npm run test:arch` includes leak scan.

## Develop

```bash
npm install
npm run dev
```

## Test

```bash
npm test
npm run test:e2e -w @window-host/desk
```

## Deploy

`npm run build` → `apps/desk/dist/`. Per environment, swap scene JSON or add `public/` config. Homelab target: `desk.homelab2…` (catalog follow-up). See [life wiki — Window host](https://life.homelab2.vincentdigital.com/docs/plans/window-host-muse-orientation) for Authelia / iframe notes.
