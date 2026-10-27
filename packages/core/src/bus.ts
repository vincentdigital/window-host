export type BusEnvelope<T = unknown> = {
  v: 1;
  id: string;
  topic: string;
  source: { paneId: string };
  payload: T;
  correlationId?: string;
  at: number;
};

export type BusListener = (envelope: BusEnvelope) => void;

export type PaneBus = {
  publish: (paneId: string, topic: string, payload: unknown, correlationId?: string) => BusEnvelope;
  subscribe: (topic: string, listener: BusListener) => () => void;
  history: (topic?: string) => readonly BusEnvelope[];
};

let seq = 0;

function nextId(): string {
  seq += 1;
  return `bus-${Date.now()}-${seq}`;
}

export function createPaneBus(): PaneBus {
  const listeners = new Map<string, Set<BusListener>>();
  const log: BusEnvelope[] = [];
  const maxLog = 200;

  const publish = (
    paneId: string,
    topic: string,
    payload: unknown,
    correlationId?: string,
  ): BusEnvelope => {
    const envelope: BusEnvelope = {
      v: 1,
      id: nextId(),
      topic,
      source: { paneId },
      payload,
      at: Date.now(),
      correlationId,
    };
    log.push(envelope);
    if (log.length > maxLog) log.shift();
    const set = listeners.get(topic);
    if (set) {
      for (const fn of set) fn(envelope);
    }
    return envelope;
  };

  const subscribe = (topic: string, listener: BusListener): (() => void) => {
    let set = listeners.get(topic);
    if (!set) {
      set = new Set();
      listeners.set(topic, set);
    }
    set.add(listener);
    return () => set!.delete(listener);
  };

  const history = (topic?: string): readonly BusEnvelope[] =>
    topic ? log.filter((e) => e.topic === topic) : [...log];

  return { publish, subscribe, history };
}
