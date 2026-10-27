# Integration examples (non-core)

Minimal, copy-friendly demos for each pane integration style. **Nothing here is imported by `@window-host/*`** — use them to spike protocols and manual tests while the shell stays thin.

**When to use which pattern (agents):** [`docs/agents/integration-patterns.md`](../docs/agents/integration-patterns.md) · summary in [`AGENTS.md`](../AGENTS.md).

| # | Folder | Pattern |
| --- | --- | --- |
| 1 | [01-widget-bus](./01-widget-bus/) | First-party UI + in-tab pane bus (see also desk `?scene=link`) |
| 2 | [02-iframe-postmessage](./02-iframe-postmessage/) | Cross-document `postMessage` ↔ parent bridge |
| 3 | [03-esm-remote](./03-esm-remote/) | Same-origin dynamic `import()` “micro-frontend” |
| 4 | [04-web-component](./04-web-component/) | Custom element + DOM events |
| 5 | [05-server-push](./05-server-push/) | Server-mediated fan-out (mock SSE) |

Shared wire shape: [protocol.md](./protocol.md).

## Quick try

```bash
# Desk dev — open example pages on the same origin as the shell
npm run dev
# → http://localhost:5173/examples/index.html

# Mock push server (example 5 only)
npm run examples:server
# → http://127.0.0.1:9123/events  and  POST /publish
```

To exercise **iframe** inside the real shell, copy a scene snippet from [scene-snippets](./scene-snippets/) into `scenes/` and register it in `apps/desk/src/App.tsx` locally (not required for the standalone harness pages).

**Note:** Runnable HTML/JS for `npm run dev` is mirrored under `apps/desk/public/examples/`. When you edit a harness in `examples/`, update the public copy (or the numbered folder file) so both stay aligned.
