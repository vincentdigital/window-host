import type { BusEnvelope } from "@window-host/core";
import { useEffect, useState } from "react";
import { usePaneBus } from "./bus-context.js";

type Props = { topic: string; label?: string };

export function BusListenWidget({ topic, label = "Link · listen" }: Props) {
  const bus = usePaneBus();
  const [messages, setMessages] = useState<BusEnvelope[]>(() =>
    [...bus.history(topic)].slice(-8).reverse(),
  );

  useEffect(() => {
    return bus.subscribe(topic, (envelope) => {
      setMessages((prev) => [envelope, ...prev].slice(0, 8));
    });
  }, [bus, topic]);

  return (
    <div className="wh-widget wh-bus wh-bus-listen">
      <header className="wh-widget-head">{label}</header>
      <p className="wh-bus-topic">
        Topic <code>{topic}</code>
      </p>
      <ul className="wh-bus-feed" aria-live="polite">
        {messages.length === 0 ? (
          <li className="wh-bus-empty">Waiting for a ping from another pane…</li>
        ) : (
          messages.map((m) => (
            <li key={m.id} className="wh-bus-item">
              <span className="wh-bus-from">{m.source.paneId}</span>
              <span className="wh-bus-payload">
                {typeof m.payload === "object" && m.payload && "message" in m.payload
                  ? String((m.payload as { message: unknown }).message)
                  : JSON.stringify(m.payload)}
              </span>
              <time className="wh-bus-time" dateTime={new Date(m.at).toISOString()}>
                {new Date(m.at).toLocaleTimeString()}
              </time>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
