# 05 — Server-mediated (mock)

[`mock-server.mjs`](./mock-server.mjs) — minimal SSE hub:

- `GET /events?topic=demo.ping` — subscribe
- `POST /publish` — JSON body `{ "topic", "payload", "sourcePaneId?" }`

Client: [server-harness.html](../../apps/desk/public/examples/05-server-harness.html).

Run: `npm run examples:server` from repo root.

Real stack: replace with host-runtime GraphQL subscriptions; panes stay dumb clients.
