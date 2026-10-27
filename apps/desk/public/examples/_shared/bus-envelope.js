/** postMessage wrapper — matches examples/protocol.md (not @window-host/core). */

export const BUS_CHANNEL = "window-host-bus";

export function wrapPublish(envelope) {
  return { channel: BUS_CHANNEL, direction: "publish", envelope };
}

export function unwrapPostMessage(data) {
  if (!data || data.channel !== BUS_CHANNEL || data.direction !== "publish") return null;
  const envelope = data.envelope;
  if (!envelope || envelope.v !== 1 || typeof envelope.topic !== "string") return null;
  if (!envelope.source?.paneId) return null;
  return envelope;
}
