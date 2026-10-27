# UX grandparent TDD — agent rules

**Grandparent test:** a UX scenario written in plain language and JSON that anyone can read — no Playwright, no CSS selectors. The app is driven through **`window.__windowHost`** (`dispatch` / `getSnapshot`). If the scenario passes in Vitest, the UX contract holds.

Central UX truth is **declarative state**, not the DOM tree.

## State stack (what “central” means)

| Layer | Source of truth | Used for |
| --- | --- | --- |
| **Layout & default hosts** | `scenes/*.scene.json` | What the product ships |
| **UX flows** | `scenes/ux/*.json` | Grandparent tests — “when / then” |
| **Session** | `DeskSnapshot` via `__windowHost` | Runtime + assertions |
| **Commands** | Same `dispatch` types as desk session | Drive without clicking |

Playwright is **optional** (split drag, visual polish). **Grandparent tests are required** when you change cross-pane behavior, scene defaults, or bus flows.

## Agent workflow (mandatory for UX changes)

1. **Write or update** a file in [`scenes/ux/`](../../scenes/ux/) before or with the code change.
   - `name` / `description`: grandparent-readable (what the user cares about).
   - `sceneId`: which scene.
   - `when`: list of `dispatch` commands (usually `bus.publish`, `compose.*`, `scene.set`).
   - `then`: `snapshot` + optional `busLast` — no `getByRole`.

2. **Implement** in shell/widgets/schema so `DeskSnapshot` reflects the UX.

3. **Run** `npm test` — includes [`test/grandparent.test.tsx`](../../test/grandparent.test.tsx).

4. **Do not** weaken scenarios to match broken code; fix the product or the scenario intentionally.

5. **Playwright** only for what scenarios cannot express (e.g. divider drag → `localStorage` split). Add a one-line comment in the spec pointing to the UX limit.

## Scenario format

```json
{
  "version": 1,
  "name": "Human title",
  "description": "Optional sentence a grandparent understands.",
  "sceneId": "playground",
  "when": [
    { "type": "bus.publish", "topic": "demo.ping", "payload": { "message": "hi" }, "paneId": "session" }
  ],
  "then": {
    "snapshot": {
      "sceneId": "playground",
      "paneWidgetIds": { "listen": "bus-listen" },
      "minBusMessages": 1
    },
    "busLast": { "topic": "demo.ping", "payload": { "message": "hi" } }
  }
}
```

Schema: `packages/schema/src/ux-scenario.ts` (`parseUxScenario`).

**Discovery:** drop a new `scenes/ux/*.json` file — `test/grandparent.test.tsx` and `test/ux-scenarios.test.ts` glob it automatically (no manual imports). The UX scenarios test fails if JSON is invalid or `sceneId` is unknown.

## Forcing UX without Playwright

Yes. **`dispatch` is the UX input API**; **`getSnapshot` + `then` blocks** are the assertion API. React re-renders from the same state users get when composing panes or using bus widgets — grandparent tests exercise that path in jsdom.

Iframe-heavy flows: prefer scenarios that `bus.publish` what the iframe *would* send after the shell bridge exists; add iframe integration to grandparent only when bridge is in shell (Playground).

## What not to do

- Do not assert UX only via implementation details (internal React state, module singletons).
- Do not add homelab URLs to scenarios (`test/leak.test.ts` scans `scenes/ux/`).
- Do not skip grandparent tests for “small” bus/scene changes.
- Do not duplicate scenario prose only in PR description — the JSON in `scenes/ux/` is the contract.

## Related

- [`frontend-control.md`](./frontend-control.md) — `__windowHost` API
- [`integration-patterns.md`](./integration-patterns.md) — pane integration
- Life wiki host-runtime — future server-side UX state; grandparent tests remain client contract until then
