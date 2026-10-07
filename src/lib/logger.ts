/** Central logger. Debug/info are silent in production; sensitive keys are redacted. */
const SENSITIVE = /(password|token|secret|authorization|apikey|api_key|refresh|access)/i;

function redact(arg: unknown): unknown {
  if (!arg || typeof arg !== "object" || arg instanceof Error) return arg;
  try {
    return JSON.parse(
      JSON.stringify(arg, (k, v) => (k && SENSITIVE.test(k) ? "[redacted]" : v)),
    );
  } catch {
    return "[unserializable]";
  }
}

const dev = import.meta.env.DEV;
const out = (fn: (...a: unknown[]) => void) => (...args: unknown[]) => fn(...args.map(redact));

export const logger = {
  debug: dev ? out(console.debug) : () => {},
  info: dev ? out(console.info) : () => {},
  warn: out(console.warn),
  error: out(console.error),
};
