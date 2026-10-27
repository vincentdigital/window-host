# Frontend control — debug & TDD

How to **observe** and **drive** the desk SPA from agents, Playwright, or the browser console — without a single global Redux store.

## Is there central state?

**Not one store.** Desk state is layered on purpose:

| Layer | What | Where |
| --- | --- | --- |
| Canonical scene | Layout + default pane hosts | `scenes/*.scene.json` |
| Session UI | Split ratio, compose overrides | `localStorage` + React (`SceneShell`) |
| Ephemeral | Pane bus messages | In-memory `createPaneBus()` per scene |
| Widget-local | Notes text, pomodoro timer | Widget `localStorage` keys |

**Scene overview** (Overview panel) shows live **`getSnapshot()` JSON** plus bus debug — same object grandparent tests assert.

**Production direction (life wiki):** durable / cross-tab state via **host-runtime** (GraphQL), not a growing `window` object.

## Workspace vs desk

| | **Workspace (catalog guest)** | **Desk (window-host)** |
| --- | --- | --- |
| Observe slot, apps, jobs | `GET /context` on broker `:8791` | N/A — static SPA |
| Drive remint / deploy | `POST /projects/{id}/up` | Rebuild + sync static |
| Observe **browser UI** | Not via broker | DOM, Playwright, **`window.__windowHost`** |
| Cross-pane messages (today) | — | Pane bus + iframe `postMessage` |

Workspace agents do **not** read desk React state through `/context`. The analogue for TDD is a **desk session API** in the browser plus Playwright — same *idea* (contract + commands), different transport.

## `window.__windowHost` (desk session API)

Registered while `SceneShell` is mounted (desk app).

### Read snapshot

```js
window.__windowHost.getSnapshot()
```

Returns: `sceneId`, `layout`, `split`, effective `panes[]`, compose override ids, `recentBus` (last envelopes), counts.

### Subscribe to changes

```js
const off = window.__windowHost.subscribe((snap) => console.log(snap.sceneId, snap.busMessageCount))
// later: off()
```

### Send commands

```js
window.__windowHost.dispatch({ type: "bus.publish", topic: "demo.ping", payload: { message: "test" } })
window.__windowHost.dispatch({ type: "scene.set", sceneId: "playground" })
window.__windowHost.dispatch({ type: "compose.reset" })
window.__windowHost.dispatch({
  type: "compose.setPane",
  paneId: "listen",
  host: { kind: "widget", widgetId: "bus-listen", props: { topic: "demo.ping" } },
})
```

Bus commands use the same **`BusEnvelope` v1** shape as panes ([`examples/protocol.md`](../../examples/protocol.md)).

## UX without Playwright (grandparent tests)

Declarative flows live in [`scenes/ux/`](../../scenes/ux/). Vitest runs them against `__windowHost` — see [`ux-grandparent-tdd.md`](./ux-grandparent-tdd.md). **Agents: change UX → update scenario JSON first.**

## TDD layers (recommended)

1. **Unit / RTL** — `packages/*` tests (bus, shell, widgets). Fast, no browser.
2. **Grandparent UX** — `test/grandparent.test.tsx` + `scenes/ux/*.json` (required for scene/bus UX).
3. **Desk session** — `packages/shell/src/desk-session.test.ts`; assert snapshot + dispatch.
4. **Playwright** — layout/drag or optional checks; prefer session API over selectors:

```ts
await page.goto("/?scene=playground");
await page.evaluate(() =>
  window.__windowHost!.dispatch({ type: "bus.publish", topic: "demo.ping", payload: { message: "e2e" } }),
);
await expect(page.getByText("e2e")).toBeVisible();
```

4. **Integration lab** (`/examples/00-integration-lab.html`) — protocol spikes **outside** core; embed in panes via **Example · …** widgets.

## Receiving messages *from* the frontend

Today:

- **Subscribe:** `window.__windowHost.subscribe(...)` (snapshot includes new bus traffic).
- **Bus topic:** widgets and iframes publish; session `dispatch` injects as pane `session`.

Future:

- host-runtime subscriptions mirrored into pane bus;
- optional `desk-session` event stream over SSE for headless runners.

## Agents

- Prefer **`getSnapshot()`** before asserting UI.
- Use **`dispatch`** to set scene/pane/bus without brittle selectors when testing integration.
- Do not rely on `__windowHost` in production feature code — debug and tests only.
