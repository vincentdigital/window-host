import { useEffect, useRef, useState } from "react";
import { pomodoroKey, readText, writeText } from "./storage.js";

const WORK_SEC = 25 * 60;

type State = { remaining: number; running: boolean; endsAt: number | null };

function load(): State {
  try {
    const raw = readText(pomodoroKey());
    if (!raw) return { remaining: WORK_SEC, running: false, endsAt: null };
    const p = JSON.parse(raw) as State;
    if (p.running && p.endsAt) {
      const remaining = Math.max(0, Math.ceil((p.endsAt - Date.now()) / 1000));
      return { remaining, running: remaining > 0, endsAt: remaining > 0 ? p.endsAt : null };
    }
    return {
      remaining: typeof p.remaining === "number" ? p.remaining : WORK_SEC,
      running: false,
      endsAt: null,
    };
  } catch {
    return { remaining: WORK_SEC, running: false, endsAt: null };
  }
}

function save(s: State): void {
  writeText(pomodoroKey(), JSON.stringify(s));
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PomodoroWidget() {
  const [state, setState] = useState(load);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    save(state);
  }, [state]);

  useEffect(() => {
    if (!state.running) {
      if (tickRef.current) window.clearInterval(tickRef.current);
      return;
    }
    tickRef.current = window.setInterval(() => {
      setState((prev) => {
        if (!prev.endsAt) return prev;
        const remaining = Math.max(0, Math.ceil((prev.endsAt - Date.now()) / 1000));
        if (remaining <= 0) return { remaining: WORK_SEC, running: false, endsAt: null };
        return { ...prev, remaining };
      });
    }, 250);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [state.running, state.endsAt]);

  const toggle = () => {
    setState((prev) => {
      if (prev.running) {
        return { ...prev, running: false, endsAt: null };
      }
      const endsAt = Date.now() + prev.remaining * 1000;
      return { ...prev, running: true, endsAt };
    });
  };

  const reset = () => setState({ remaining: WORK_SEC, running: false, endsAt: null });

  return (
    <div className="wh-widget wh-pomodoro">
      <header className="wh-widget-head">Focus</header>
      <p className="wh-pomodoro-time" aria-live="polite">{fmt(state.remaining)}</p>
      <div className="wh-pomodoro-actions">
        <button type="button" className="wh-btn" onClick={toggle}>
          {state.running ? "Pause" : "Start"}
        </button>
        <button type="button" className="wh-btn wh-btn-ghost" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
