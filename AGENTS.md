# window-host — agent notes

Monorepo desk shell: scenes, pane layouts, widgets, static deploy. Read [`README.md`](README.md) for commands and packages.

## Before you change code

1. Run `npm test` and `npm run test:arch` — layer imports and leak scan are enforced.
2. Do not put tenant hostnames in `packages/schema` or `packages/core`.
3. Homelab iframe URLs belong in **scene JSON** or deploy config, not in shared packages.

## Choosing a pane integration pattern

**Full guide:** [`docs/agents/integration-patterns.md`](docs/agents/integration-patterns.md)

| If you need… | Start with… |
| --- | --- |
| Desk-native UI, local pane-to-pane messages | **First-party widget** + pane bus (`?scene=link`) |
| Embed existing web app (homelab, auth boundary) | **iframe** + `postMessage` bridge (example only until shell wires bridge) |
| Same-origin JS module, not in main bundle | **ESM remote** — `examples/03-esm-remote` |
| Framework-agnostic custom element | **Web component** — `examples/04-web-component` |
| Durable or cross-device sync | **Server-mediated** — `examples/05-server-push`; production = host-runtime |

Spikes live under [`examples/`](examples/) and `apps/desk/public/examples/` — **not imported by `@window-host/*`**. Promote to `shell` / `widgets` only after the pattern is agreed.

Wire format for cross-boundary messages: [`examples/protocol.md`](examples/protocol.md).

## Common tasks

| Task | Where |
| --- | --- |
| New widget | `packages/schema/src/widgets.ts`, `packages/widgets`, `registry.tsx` |
| Example in pane | Picker → **Example · …** (`example-harness` + `props.harness`); paths in `schema/example-harnesses.ts` |
| New scene | `scenes/*.scene.json`, register in `apps/desk/src/App.tsx` |
| Pane compose UX | `packages/shell` (`PaneChrome`, `PaneHostPicker`) |
| iframe bridge (future) | Adapt `examples/02-iframe-postmessage/parent-bridge.example.js` in shell |
| Deploy artifact | `npm run build` → `apps/desk/dist/` |

## Tests worth knowing

| Area | Test |
| --- | --- |
| Pane bus (widgets) | `packages/shell/src/link-bus.test.tsx` |
| Per-pane picker | `packages/shell/src/pane-picker.test.tsx` |
| Architecture | `test/architecture.test.ts`, `test/leak.test.ts` |
| All integration patterns ↔ one bus | `test/integration-lab.test.ts` + `/examples/00-integration-lab.html` |

Individual pattern harnesses: manual via `/examples/index.html`. Full cross-pattern lab: `00-integration-lab.html` (run `npm run examples:server` for pane 5).
