import type { BusEnvelope, PaneBus } from "@window-host/core";

const CHANNEL = "window-host-bus";

function wrapPublish(envelope: BusEnvelope) {
  return { channel: CHANNEL, direction: "publish", envelope };
}

function unwrapPostMessage(data: unknown): BusEnvelope | null {
  if (!data || typeof data !== "object") return null;
  const msg = data as { channel?: string; direction?: string; envelope?: BusEnvelope };
  if (msg.channel !== CHANNEL || msg.direction !== "publish") return null;
  const envelope = msg.envelope;
  if (!envelope || envelope.v !== 1) return null;
  return envelope;
}

const DEFAULT_TOPICS = ["demo.ping"];

/**
 * Connect same-origin iframe guests to the scene pane bus (postMessage protocol).
 */
export function attachPaneIframeBusBridge(
  bus: PaneBus,
  allowedOrigins: string[],
  getIframes: () => HTMLIFrameElement[],
  topics: string[] = DEFAULT_TOPICS,
): () => void {
  const onMessage = (event: MessageEvent) => {
    if (!allowedOrigins.includes(event.origin)) return;
    const envelope = unwrapPostMessage(event.data);
    if (!envelope) return;
    bus.publish(envelope.source.paneId, envelope.topic, envelope.payload, envelope.correlationId);
  };
  window.addEventListener("message", onMessage);

  const unsubs = topics.map((topic) =>
    bus.subscribe(topic, (envelope) => {
      const targetOrigin = allowedOrigins[0] ?? window.location.origin;
      for (const frame of getIframes()) {
        try {
          frame.contentWindow?.postMessage(wrapPublish(envelope), targetOrigin);
        } catch {
          /* cross-origin or detached */
        }
      }
    }),
  );

  return () => {
    window.removeEventListener("message", onMessage);
    unsubs.forEach((u) => u());
  };
}
