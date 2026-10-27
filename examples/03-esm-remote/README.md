# 03 — ESM remote mount (micro-frontend spike)

[`remote-pane.mjs`](./remote-pane.mjs) exports `mount(target)` — no bundler required.

Harness: [mfe-harness.html](../../apps/desk/public/examples/03-mfe-harness.html) uses dynamic `import()` against the same origin.

Production direction: shell resolves a URL per pane and calls `mount` on a div instead of an iframe.
