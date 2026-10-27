# 01 — Widget + pane bus

Production reference: desk **Link** scene (`scenes/link.scene.json`, `?scene=link`) and RTL test `packages/shell/src/link-bus.test.tsx`.

Standalone vanilla twin (no React):

- Open [vanilla-bus.html](../../apps/desk/public/examples/01-vanilla-bus.html) while `npm run dev` (or serve `apps/desk/public/examples`).

Two “panes” are divs sharing one `createMiniBus()` from [`_shared/mini-bus.js`](../_shared/mini-bus.js).
