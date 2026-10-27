/**
 * Cross-pattern bridges for the integration lab (examples only).
 * Each adapter ingests a local signal and fans out on the shared mini-bus.
 */

import { unwrapPostMessage, wrapPublish } from "./bus-envelope.js";
import { createMiniBus } from "./mini-bus.js";

export { createMiniBus } from "./mini-bus.js";
export { wrapPublish, unwrapPostMessage, BUS_CHANNEL } from "./bus-envelope.js";

const DEFAULT_TOPIC = "demo.ping";

/** Publish using envelope fields (new id/at from bus). */
export function ingestEnvelope(bus, envelope) {
  return bus.publish(envelope.source.paneId, envelope.topic, envelope.payload);
}

/** iframe guest → parent */
export function bridgePostMessage(bus, event, allowedOrigins) {
  if (!allowedOrigins.includes(event.origin)) return null;
  const envelope = unwrapPostMessage(event.data);
  if (!envelope) return null;
  return ingestEnvelope(bus, envelope);
}

/** Parent → iframe guest (duplex) */
export function postEnvelopeToFrame(iframeEl, envelope, targetOrigin) {
  const win = iframeEl?.contentWindow;
  if (!win) return false;
  win.postMessage(wrapPublish(envelope), targetOrigin);
  return true;
}

/** ESM remote: wh-pane-emit on mount node */
export function ingestPaneEmit(bus, detail, fallbackPaneId = "esm-remote") {
  if (!detail || typeof detail.topic !== "string") return null;
  const paneId = detail.paneId ?? fallbackPaneId;
  return bus.publish(paneId, detail.topic, detail.payload ?? {});
}

/** Web component: wh-bus-request */
export function ingestBusRequest(bus, detail, fallbackPaneId = "web-component") {
  if (!detail || typeof detail.topic !== "string") return null;
  const paneId = detail.paneId ?? fallbackPaneId;
  return bus.publish(paneId, detail.topic, detail.payload ?? {});
}

/** First-party widget stand-in (vanilla button) */
export function publishFromWidget(bus, paneId, topic = DEFAULT_TOPIC, payload = { message: "ping" }) {
  return bus.publish(paneId, topic, payload);
}

/** Mock server SSE JSON body */
export function ingestServerEnvelope(bus, envelope) {
  if (!envelope || envelope.v !== 1) return null;
  return ingestEnvelope(bus, envelope);
}

/**
 * Wire all lab panes to one bus. `onFanout` receives every envelope after ingest
 * (for iframe forward + unified log).
 */
export function createIntegrationLab(options = {}) {
  const topic = options.topic ?? DEFAULT_TOPIC;
  const allowedOrigins = options.allowedOrigins ?? [];
  const bus = createMiniBus();
  const sinks = new Set();

  const notify = (envelope) => {
    for (const fn of sinks) fn(envelope);
  };

  bus.subscribe(topic, (envelope) => notify(envelope));

  const attachUnifiedLog = (fn) => {
    sinks.add(fn);
    return () => sinks.delete(fn);
  };

  const attachIframeBridge = (paneId, getIframe) => {
    const onMessage = (event) => {
      bridgePostMessage(bus, event, allowedOrigins);
    };
    window.addEventListener("message", onMessage);

    const unsub = bus.subscribe(topic, (envelope) => {
      if (envelope.source.paneId === paneId) return;
      const iframe = typeof getIframe === "function" ? getIframe() : getIframe;
      if (iframe) postEnvelopeToFrame(iframe, envelope, allowedOrigins[0] ?? "*");
    });

    return () => {
      window.removeEventListener("message", onMessage);
      unsub();
    };
  };

  return {
    bus,
    topic,
    allowedOrigins,
    attachUnifiedLog,
    attachIframeBridge,
    publishFromWidget,
    ingestPaneEmit,
    ingestBusRequest,
    ingestServerEnvelope,
    bridgePostMessage: (event) => bridgePostMessage(bus, event, allowedOrigins),
  };
}
