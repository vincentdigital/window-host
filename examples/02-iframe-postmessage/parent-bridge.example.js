/**
 * Example parent bridge — paste/adapt in shell later; not used by core today.
 *
 * @param {import('@window-host/core').PaneBus} bus
 * @param {string} paneId — pane that owns the iframe
 * @param {string[]} allowedOrigins — e.g. [window.location.origin]
 */
export function attachIframeBusBridge(bus, paneId, allowedOrigins) {
  const onMessage = (event) => {
    if (!allowedOrigins.includes(event.origin)) return;
    const data = event.data;
    if (!data || data.channel !== "window-host-bus" || data.direction !== "publish") return;
    const env = data.envelope;
    if (!env || env.v !== 1) return;
    bus.publish(paneId, env.topic, env.payload, env.correlationId);
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
