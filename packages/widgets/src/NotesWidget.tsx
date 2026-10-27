import { useEffect, useState } from "react";
import { notesKey, readText, writeText } from "./storage.js";

export function NotesWidget({
  slot = "default",
  label = "Notes",
}: {
  slot?: string;
  label?: string;
}) {
  const key = notesKey(slot);
  const [body, setBody] = useState(() => readText(key));

  useEffect(() => {
    writeText(key, body);
  }, [key, body]);

  return (
    <div className="wh-widget wh-notes">
      <header className="wh-widget-head">{label}</header>
      <textarea
        className="wh-notes-area"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Capture context…"
        aria-label={label}
      />
    </div>
  );
}
