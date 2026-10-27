import { useState } from "react";
import { usePaneBus, usePaneId } from "./bus-context.js";

type Props = { topic: string; label?: string };

export function BusSendWidget({ topic, label = "Link · send" }: Props) {
  const bus = usePaneBus();
  const paneId = usePaneId();
  const [lastId, setLastId] = useState<string | null>(null);

  const send = () => {
    const envelope = bus.publish(paneId, topic, {
      message: "ping",
      from: paneId,
    });
    setLastId(envelope.id);
  };

  return (
    <div className="wh-widget wh-bus">
      <header className="wh-widget-head">{label}</header>
      <p className="wh-bus-topic">
        Topic <code>{topic}</code>
      </p>
      <p className="wh-bus-hint">Messages reach other panes listening on the same topic.</p>
      <div className="wh-bus-actions">
        <button type="button" className="wh-btn" onClick={send}>
          Send ping
        </button>
      </div>
      {lastId ? (
        <p className="wh-bus-meta" aria-live="polite">
          Sent <span className="wh-bus-id">{lastId}</span>
        </p>
      ) : null}
    </div>
  );
}
