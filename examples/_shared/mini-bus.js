/** Tiny in-page bus for vanilla examples only — not @window-host/core. */
let seq = 0;

export function createMiniBus() {
  const listeners = new Map();
  const log = [];

  const publish = (paneId, topic, payload) => {
    const envelope = {
      v: 1,
      id: `bus-${Date.now()}-${++seq}`,
      topic,
      source: { paneId },
      payload,
      at: Date.now(),
    };
    log.push(envelope);
    for (const fn of listeners.get(topic) ?? []) fn(envelope);
    return envelope;
  };

  const subscribe = (topic, fn) => {
    const set = listeners.get(topic) ?? new Set();
    set.add(fn);
    listeners.set(topic, set);
    return () => set.delete(fn);
  };

  return { publish, subscribe, history: () => [...log] };
}
