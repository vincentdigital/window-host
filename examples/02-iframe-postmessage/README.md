# 02 — iframe + postMessage

- **Guest** (inside iframe): [`guest.html`](./guest.html) — button sends `window-host-bus` messages to `parent`.
- **Parent harness**: [iframe-harness.html](../../apps/desk/public/examples/02-iframe-harness.html) — iframe + listener that prints envelopes (stand-in for future `IframeBusBridge` in shell).
- **Snippet**: [`parent-bridge.example.js`](./parent-bridge.example.js) — copy into shell when you wire real iframes.

Manual desk test: use [scene-snippets/iframe-listen.scene.json](../scene-snippets/iframe-listen.scene.json) with guest URL `/examples/02-iframe-guest.html` (same origin).
