import type { ButtonConfig } from "../components/defaultButtonList";
import { normalizeButtons } from "./button-options";

export interface TextSettingField {
  id: string;
  label: Record<string, string>;
  defaultValue?: string;
  type?: "text" | "email";
  description?: Record<string, string>;
  normalize?: (value: string) => string | null;
  invalidMessage?: Record<string, string>;
}

export interface ButtonSettings {
  title: Record<string, string>;
  fields: readonly TextSettingField[];
}

export function normalizeMastodonInstance(value: string): string | null {
  const input = value.trim();
  if (!input) return "mstdn.jp";
  if (/\s|\\/.test(input)) return null;
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    return url.host;
  } catch {
    return null;
  }
}

export function normalizeEmailRecipient(value: string): string | null {
  const input = value.trim();
  return !input ||
    /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i.test(
      input,
    )
    ? input
    : null;
}

interface SyncStorage {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
}

export async function loadButtons(
  storage: SyncStorage,
  defaults: readonly ButtonConfig[],
) {
  const { options } = await storage.get("options");
  const saved =
    options && typeof options === "object" && "buttons" in options
      ? options.buttons
      : undefined;
  return normalizeButtons(saved, defaults);
}

export async function saveButtons(
  storage: SyncStorage,
  buttons: readonly ButtonConfig[],
  defaults: readonly ButtonConfig[],
) {
  const { options } = await storage.get("options");
  const existing =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  await storage.set({
    options: { ...existing, buttons: normalizeButtons(buttons, defaults) },
  });
}

// Separate keys let a field change without replacing the list or another field.
export function textSetting(
  storage: SyncStorage,
  buttonId: string,
  fieldId: string,
  defaultValue = "",
) {
  const key = `button-text:${encodeURIComponent(buttonId)}:${encodeURIComponent(fieldId)}`;
  return {
    key,
    async get(): Promise<string> {
      const data = await storage.get(key);
      return typeof data[key] === "string" ? data[key] : defaultValue;
    },
    async set(value: string) {
      await storage.set({ [key]: value });
    },
    async reset() {
      await storage.remove(key);
    },
  };
}
