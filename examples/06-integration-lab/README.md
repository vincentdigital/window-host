# 06 — Integration lab (all patterns, one bus)

Every integration style publishes/subscribes on the same in-page bus (`demo.ping`).

## Try it

```bash
npm run dev
# → http://localhost:5173/examples/00-integration-lab.html

# Optional: server pane (pattern 5)
npm run examples:server
```

Use **Fan out ping** in any pane; the unified log and all other panes should update.

## Automated

```bash
npm test -- test/integration-lab.test.ts
```

## Source

- Adapters: [`_shared/lab-adapters.js`](../_shared/lab-adapters.js)
- Duplex iframe guest: [`lab-iframe-guest.html`](../../apps/desk/public/examples/lab-iframe-guest.html)

Not imported by `@window-host/*`.
