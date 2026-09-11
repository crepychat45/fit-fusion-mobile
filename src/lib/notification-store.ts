/**
 * Local notification inbox store.
 *
 * Holds locally generated notifications (push messages received while the app
 * is open, workout/achievement events, update alerts) and the read/dismissed
 * state for every inbox entry (including remote ones coming from the backend).
 */

export type InboxCategory =
  | "admin"
  | "announcement"
  | "update"
  | "push"
  | "workout"
  | "achievement"
  | "system";

export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  category: InboxCategory;
  link?: string | null;
  createdAt: string;
}

const LOCAL_KEY = "fitfusion.inbox.local";
const READ_KEY = "fitfusion.inbox.read";
const CLEARED_KEY = "fitfusion.inbox.cleared";
const EVENT = "fitfusion-inbox-changed";
const MAX_LOCAL = 100;

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable */
  }
};

export const emitInboxChange = () => {
  window.dispatchEvent(new CustomEvent(EVENT));
};

export const subscribeInbox = (fn: () => void) => {
  const handler = () => fn();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};

export const getLocalNotifications = (): LocalNotification[] =>
  readJSON<LocalNotification[]>(LOCAL_KEY, []);

export const addLocalNotification = (
  input: Omit<LocalNotification, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
): LocalNotification => {
  const item: LocalNotification = {
    id: input.id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    body: input.body,
    category: input.category,
    link: input.link ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  const existing = getLocalNotifications();
  if (existing.some((n) => n.id === item.id)) return item;
  writeJSON(LOCAL_KEY, [item, ...existing].slice(0, MAX_LOCAL));
  emitInboxChange();
  return item;
};

export const getReadIds = (): string[] => readJSON<string[]>(READ_KEY, []);

export const markRead = (ids: string | string[]) => {
  const list = Array.isArray(ids) ? ids : [ids];
  const next = Array.from(new Set([...getReadIds(), ...list])).slice(-500);
  writeJSON(READ_KEY, next);
  emitInboxChange();
};

export const getClearedIds = (): string[] => readJSON<string[]>(CLEARED_KEY, []);

export const clearNotifications = (ids: string[]) => {
  const next = Array.from(new Set([...getClearedIds(), ...ids])).slice(-500);
  writeJSON(CLEARED_KEY, next);
  markRead(ids);
  writeJSON(
    LOCAL_KEY,
    getLocalNotifications().filter((n) => !ids.includes(n.id)),
  );
  emitInboxChange();
};
