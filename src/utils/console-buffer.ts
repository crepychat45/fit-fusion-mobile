/**
 * Lightweight in-memory console ring buffer used by the diagnostic report.
 * Captures the most recent console entries without changing console behaviour.
 */
export interface ConsoleEntry {
  ts: string;
  level: "log" | "info" | "warn" | "error" | "debug";
  message: string;
}

const MAX_ENTRIES = 200;
const buffer: ConsoleEntry[] = [];
let installed = false;

function serialize(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      if (a instanceof Error) return `${a.name}: ${a.message}`;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(" ")
    .slice(0, 1000);
}

export function installConsoleBuffer() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  (["log", "info", "warn", "error", "debug"] as const).forEach((level) => {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      buffer.push({ ts: new Date().toISOString(), level, message: serialize(args) });
      if (buffer.length > MAX_ENTRIES) buffer.shift();
      original(...args);
    };
  });
  window.addEventListener("error", (e) => {
    buffer.push({ ts: new Date().toISOString(), level: "error", message: `window.onerror: ${e.message}` });
  });
  window.addEventListener("unhandledrejection", (e) => {
    buffer.push({
      ts: new Date().toISOString(),
      level: "error",
      message: `unhandledrejection: ${String((e as PromiseRejectionEvent).reason)}`.slice(0, 500),
    });
  });
}

export function getConsoleEntries(limit = 100): ConsoleEntry[] {
  return buffer.slice(-limit);
}

export function clearConsoleEntries() {
  buffer.length = 0;
}
