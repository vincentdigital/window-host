# Example wire protocol (aligns with core `BusEnvelope` v1)

These examples use the same JSON shape as `@window-host/core` `BusEnvelope` so a future shell adapter can translate without redesign.

```json
{
  "v": 1,
  "id": "bus-1730000000000-1",
  "topic": "demo.ping",
  "source": { "paneId": "send" },
  "payload": { "message": "ping" },
  "at": 1730000000000
}
```

## `postMessage` wrapper (iframe ↔ parent)

```json
{
  "channel": "window-host-bus",
  "direction": "publish",
  "envelope": { /* BusEnvelope */ }
}
```

Parent should verify `event.origin` against an allowlist before forwarding into the pane bus.
