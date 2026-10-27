export function readText(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function writeText(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function notesKey(slot: string): string {
  return `window-host.widget.notes.${slot}`;
}

export function pomodoroKey(): string {
  return "window-host.widget.pomodoro";
}
