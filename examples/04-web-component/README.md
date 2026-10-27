# 04 — Web component

[`wh-demo-card.js`](./wh-demo-card.js) defines `<wh-demo-card>` — listens for `topic` attribute, button dispatches `wh-bus-request` (bubbles).

Harness: [wc-harness.html](../../apps/desk/public/examples/04-wc-harness.html).

Shell could mount custom elements in pane content and listen on the pane root for `wh-bus-request`.
