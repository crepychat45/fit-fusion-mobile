/** Safe browser storage helpers: never throw on corrupted or unavailable storage. */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (value == null || value === "") return fallback;
  try {
    const parsed = JSON.parse(value) as unknown;
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    return safeJsonParse<T>(localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
