# Pane integration patterns — agent guide

Use this when adding a new pane host, wiring homelab apps, or choosing how two panes should communicate. **Default:** pick the simplest pattern that meets isolation and deploy constraints; do not embed homelab-specific URLs in `schema` or `core`.

Canonical wire format: [`examples/protocol.md`](../../examples/protocol.md) (`BusEnvelope` v1). In-tab bus today: `@window-host/core` `createPaneBus()`.

## Quick decision

```
Need homelab / third-party URL with own auth cookie?
  └─ yes → iframe (+ postMessage bridge when panes must talk)
  └─ no → Is it shipped inside the desk bundle / same release?
        └─ yes → first-party widget (React in @window-host/widgets)
        └─ no → Same origin as desk, team owns the JS?
              └─ yes → ESM remote mount OR web component (spike in examples first)
              └─ no → Server-mediated (host-runtime / GraphQL / SSE) — panes are clients only
```

## Pattern comparison

| Pattern | Pane host in scene | Cross-pane talk | Isolation | Deploy | In core today? |
| --- | --- | --- | --- | --- | --- |
| **1. First-party widget** | `kind: "widget"`, `widgetId` | Pane bus (same JS realm) | Low (shared bundle) | Static desk build | Yes — widgets, bus POC |
| **2. iframe** | `kind: "iframe"`, `url` | `postMessage` → parent bridge → bus | High (separate document; often cross-origin) | URL per env in scene/config | Render only; **no bridge in shell yet** |
| **3. ESM remote** | (future: widget or loader prop) | `CustomEvent` / bus on mount node | Medium (same origin, separate module) | Host `.mjs` on desk origin or CDN | **examples only** |
| **4. Web component** | (future: custom host kind or widget wrapper) | `wh-bus-request` DOM events | Medium | Script on desk origin | **examples only** |
| **5. Server-mediated** | Any host; subscribers use API | Backend fan-out (GraphQL sub, SSE, etc.) | N/A (no direct pane-to-pane) | host-runtime + network | **examples mock SSE only** |

## When to use which

### 1 — First-party widget (`@window-host/widgets`)

**Use when:**

- UI is part of window-host (notes, timers, desk-native tools).
- You need reliable cross-pane messaging **now** without iframe or network.
- You can accept coupling to the desk release cycle and layer rules (`widgets` → `schema` + `core`).

**Avoid when:**

- The app already runs as a full site (life, muse, jellyfin) with its own login — prefer iframe or server-mediated.
- Bundle size or unrelated dependencies would pollute the desk build.

**Agent actions:**

- Add `widgetId` to `packages/schema/src/widgets.ts` + `WIDGET_CATALOG`.
- Implement in `packages/widgets`, register in `registry.tsx`.
- For bus: use `PaneBusProvider` / `usePaneBus` (shell already wraps scenes).
- Spike UX in `examples/01-widget-bus` only if you need vanilla HTML; production path is React widgets.

**Reference:** `scenes/link.scene.json`, `packages/shell/src/link-bus.test.tsx`.

---

### 2 — iframe + postMessage

**Use when:**

- Embedding an existing HTTPS app (homelab, SaaS) with **minimal fork**.
- You need **strong isolation** (cookies, CSP, separate JS heap).
- Cross-origin is expected; Authelia / forward-auth applies to the iframe URL.

**Avoid when:**

- You need deep DOM integration or shared React context — iframe cannot see sibling panes.
- The embedded app cannot send `postMessage` (you must add a thin shim page).

**Agent actions:**

- Scene: `host: { kind: "iframe", url, title? }` — **no tenant URLs in schema/core**; URLs live in scene JSON or env-specific deploy config.
- Implement shell bridge from [`examples/02-iframe-postmessage/parent-bridge.example.js`](../../examples/02-iframe-postmessage/parent-bridge.example.js): validate `event.origin`, unwrap `channel: "window-host-bus"`, call `bus.publish(paneId, …)`.
- Guest page: [`examples/02-iframe-postmessage/guest.html`](../../examples/02-iframe-postmessage/guest.html).
- Manual desk test: [`examples/scene-snippets/iframe-listen.scene.json`](../../examples/scene-snippets/iframe-listen.scene.json) (register locally in `App.tsx`).

**Do not** widen iframe `sandbox` or disable origin checks to “make it work”.

---

### 3 — ESM remote mount (dynamic `import()`)

**Use when:**

- Same **origin** as desk (or trusted CDN on that origin).
- Team ships a **small mount API** (`export function mount(el)`) without merging into the main Vite bundle.
- You want faster iteration than full monorepo widget PRs, but still no cross-origin iframe.

**Avoid when:**

- Cross-origin deployment — use iframe or server-mediated instead.
- You need SSR or tight React context sharing — prefer first-party widget.

**Agent actions:**

- Prototype in [`examples/03-esm-remote/`](../../examples/03-esm-remote/) and `apps/desk/public/examples/03-mfe-harness.html`.
- Parent listens for `wh-pane-emit` on the mount element and forwards to pane bus (pattern in harness).
- **Do not** import example modules from `@window-host/shell` until product agrees on loader + schema extension.

---

### 4 — Web component

**Use when:**

- You want framework-agnostic pane content (Lit, vanilla, legacy).
- Boundaries are DOM events, not React props.
- Same-origin script load is acceptable.

**Avoid when:**

- You need complex React interop without a wrapper — first-party widget is simpler.
- Shadow DOM styling across the shell is painful for your UI.

**Agent actions:**

- Prototype: [`examples/04-web-component/wh-demo-card.js`](../../examples/04-web-component/wh-demo-card.js), harness `04-wc-harness.html`.
- Shell would listen on pane root for `wh-bus-request` (`composed: true`) and map to bus — **not wired in core yet**.

---

### 5 — Server-mediated (host-runtime)

**Use when:**

- Panes are **different devices**, tabs, or origins and should not talk directly.
- State must be **durable** or authoritative (graph, jobs, muse).
- Multiple clients subscribe to the same topic (GraphQL subscription, SSE, WebSocket).

**Avoid when:**

- Low-latency local UI sync is enough — pane bus is simpler.
- You are only spiking desk UX — use widget bus or examples mock first.

**Agent actions:**

- Local mock: `npm run examples:server`, harness `05-server-harness.html`.
- Map server events to the same `BusEnvelope` shape before teaching widgets to consume them.
- Life wiki / host-runtime plan owns production API; window-host stays a client.

---

## Combining patterns

| Goal | Suggested stack |
| --- | --- |
| Homelab app + desk listener | iframe guest + postMessage bridge + `bus-listen` widget |
| Two desk-native tools | Two widgets + pane bus |
| Remote team module + desk chrome | ESM remote + event bridge (future loader) |
| Muse graph updates a pane | Server-mediated only; no pane-to-pane |
| Quick protocol spike | `examples/` harness — **never** import from `packages/*` |
| **Prove all patterns interoperate** | [`00-integration-lab.html`](../../apps/desk/public/examples/00-integration-lab.html) + `test/integration-lab.test.ts` |

The integration lab uses [`examples/_shared/lab-adapters.js`](../../examples/_shared/lab-adapters.js) to bridge widget, iframe, ESM, web component, and mock SSE into one `demo.ping` bus.

## Layer and repo rules (agents)

1. **`schema` / `core`:** no homelab hostnames (`npm run test:arch` leak scan).
2. **`examples/`:** not imported by packages; copy patterns into shell/widgets when promoting.
3. **Scenes:** checked-in JSON under `scenes/`; compose overrides are `localStorage` only.
4. **Promote path:** example → shell adapter (iframe bridge, loader) → schema host kind if needed → widget optional.

## Related files

| Resource | Path |
| --- | --- |
| Example index | [`examples/README.md`](../../examples/README.md) |
| Dev harness URLs | `apps/desk/public/examples/index.html` |
| Scene schema | `packages/schema/src/scene.ts` |
| Bus implementation | `packages/core/src/bus.ts` |
| Product / homelab plan | life wiki *window-host–muse orientation* (external) |
