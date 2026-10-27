# window-host

A minimal **desk shell**: compose panes with a draggable split, ship as a **static build**, prove architecture with built-in **Scenes** and widgets before embedding homelab iframes.

## Scenes

**Scenes** are named layouts checked into [`scenes/`](scenes/). Each scene picks a **layout** and assigns a **host** per pane (`widget` or `iframe`).

| Scene | Layout | Panes |
| --- | --- | --- |
| **Duet** | `split-horizontal` (resizable) | Zoom out notes · Pomodoro |
| **Rail** | `trinity-rail` (22 / 56 / 22) | Zoom out · Pomodoro · Zoom in |
| **Link** | `split-horizontal` | Bus send · Bus listen (POC) |

Open the desk with `?scene=duet`, `?scene=rail`, or `?scene=link`, or use the scene pills.

Use each pane’s **header menu** (widget name ▾) to pick content; **All panes…** (bottom-right) opens the scene overview and reset. Choices persist in `localStorage` per scene. **Link · send** / **Link · listen** widgets share an in-tab **pane bus** (`BusEnvelope` v1 in `@window-host/core`) — the same contract the plan later bridges to host-runtime GraphQL.

## Packages

| Package | Role |
| --- | --- |
| `@window-host/schema` | Scene manifest (Zod) — 1:1 with JSON |
| `@window-host/core` | Layout math, split clamp, compose storage, pane bus |
| `@window-host/widgets` | Notes, Pomodoro, bus send/listen |
| `@window-host/shell` | `SceneShell` — row, divider, hosts |
| `@window-host/desk` | Vite app — static deploy artifact |

Layer import rules: `npm run test:arch`. No tenant hostnames in `schema` / `core`: `npm run test:arch` includes leak scan.

## Develop

```bash
npm install
npm run dev
```

**Integration spikes** (iframe, ESM remote, web components, mock SSE) live in [`examples/`](examples/) and ship as static pages under `apps/desk/public/examples/` — open `/examples/index.html` during `npm run dev`. Not imported by core packages.

**Agents:** [`AGENTS.md`](AGENTS.md) and [`docs/agents/integration-patterns.md`](docs/agents/integration-patterns.md) — when to use each integration style.

## Test

```bash
npm test
npm run test:e2e -w @window-host/desk
```

## Deploy

`npm run build` → `apps/desk/dist/`. Per environment, swap scene JSON or add `public/` config. Homelab target: `desk.homelab2…` (catalog follow-up). See [life wiki — Window host](https://life.homelab2.vincentdigital.com/docs/plans/window-host-muse-orientation) for Authelia / iframe notes.
