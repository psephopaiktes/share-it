import type { ButtonConfig } from "../components/defaultButtonList";

export const CUSTOM_BUTTON_PREFIX = "custom-button:";
// Keep the combined built-in/custom ordering within Sync’s per-item limit.
export const MAX_CUSTOM_BUTTONS = 50;
export interface CustomButton {
  id: string;
  name: string;
  urlTemplate: string;
}

export interface SharePageData {
  url: string;
  title: string;
  ogImage?: string;
  description?: string;
  selection?: string;
  canonicalUrl?: string;
  meta?: Record<string, string>;
}

const variables = [
  "url",
  "title",
  "ogimage",
  "description",
  "selection",
  "canonicalurl",
];
export const templateVariables = [
  "url",
  "title",
  "ogImage",
  "description",
  "selection",
  "canonicalUrl",
];

export function getTemplateVariables(template: string): string[] {
  return Array.from(template.matchAll(/\{\{([^{}]+)\}\}/g), (match) =>
    (match[1] ?? "").trim().toLowerCase(),
  );
}

export function templateError(
  template: string,
): "length" | "variable" | "url" | "destination" | null {
  if (template.length > 2048) return "length";
  template = template.trim();
  if (!/^(?:https?:\/\/|mailto:)/i.test(template)) return "url";
  const skeleton = template.replace(/\{\{([^{}]+)\}\}/g, "value");
  if (
    /[{}]/.test(skeleton) ||
    getTemplateVariables(template).some(
      (key) => !variables.includes(key) && !/^meta:[a-z0-9_:.-]+$/.test(key),
    )
  )
    return "variable";
  if (/^https?:\/\/[^/?#]*\{\{/i.test(template)) return "destination";
  if (
    Array.from(template).some(
      (char) =>
        char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 || char === "\\",
    )
  )
    return "url";
  try {
    const url = new URL(skeleton);
    if (
      !["https:", "http:", "mailto:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return "url";
    return null;
  } catch {
    return "url";
  }
}

export function renderShareUrl(template: string, page: SharePageData): string {
  const error = templateError(template);
  if (error) throw new Error(error);
  const values: Record<string, string> = {
    url: page.url,
    title: page.title,
    ogimage: page.ogImage ?? "",
    description: page.description ?? "",
    selection: page.selection ?? "",
    canonicalurl: page.canonicalUrl || page.url,
  };
  const result = template.replace(
    /\{\{([^{}]+)\}\}/g,
    (_match, token: string) => {
      const key = token.trim().toLowerCase();
      const value = key.startsWith("meta:")
        ? Object.hasOwn(page.meta ?? {}, key.slice(5))
          ? page.meta?.[key.slice(5)]
          : ""
        : values[key];
      // TextEncoder replaces lone surrogates in page text before URL encoding.
      return encodeURIComponent(
        new TextDecoder().decode(new TextEncoder().encode(value ?? "")),
      );
    },
  );
  return new URL(result).href;
}

export function normalizeCustomButton(value: unknown): CustomButton | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== "string" ||
    !/^[a-z0-9][a-z0-9-]{0,63}$/.test(v.id) ||
    typeof v.name !== "string" ||
    !v.name.trim() ||
    v.name.trim().length > 60 ||
    typeof v.urlTemplate !== "string" ||
    templateError(v.urlTemplate.trim())
  )
    return null;
  return { id: v.id, name: v.name.trim(), urlTemplate: v.urlTemplate.trim() };
}

export function customButtonDefaults(
  buttons: readonly CustomButton[],
): ButtonConfig[] {
  return buttons.map((button) => ({
    componentName: `custom:${button.id}`,
    enable: true,
  }));
}

interface CustomStorage {
  get(key: string | null): Promise<Record<string, unknown>>;
  set(values: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
}

export async function loadCustomButtons(
  storage: CustomStorage,
): Promise<CustomButton[]> {
  const values = await storage.get(null);
  return Object.entries(values)
    .flatMap(([key, value]) => {
      if (!key.startsWith(CUSTOM_BUTTON_PREFIX)) return [];
      const button = normalizeCustomButton(value);
      return button && key === `${CUSTOM_BUTTON_PREFIX}${button.id}`
        ? [button]
        : [];
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function saveCustomButton(
  storage: CustomStorage,
  input: CustomButton,
  expected?: CustomButton,
) {
  const button = normalizeCustomButton(input);
  if (!button) throw new Error("invalid");
  const key = `${CUSTOM_BUTTON_PREFIX}${button.id}`;
  if (new TextEncoder().encode(key + JSON.stringify(button)).length > 8192)
    throw new Error("quota");
  const current = (await storage.get(key))[key];
  if (JSON.stringify(current) !== JSON.stringify(expected))
    throw new Error("conflict");
  if (
    !expected &&
    (await loadCustomButtons(storage)).length >= MAX_CUSTOM_BUTTONS
  )
    throw new Error("limit");
  await storage.set({ [key]: button });
  return button;
}

export async function deleteCustomButton(
  storage: CustomStorage,
  expected: CustomButton,
) {
  const key = `${CUSTOM_BUTTON_PREFIX}${expected.id}`;
  const current = (await storage.get(key))[key];
  if (JSON.stringify(current) !== JSON.stringify(expected))
    throw new Error("conflict");
  await storage.remove(key);
}

// Runs in the page's isolated world. Keep all dependencies inside this function.
export function readSharePageData(extraMetaNames: string[]): SharePageData {
  const wanted = new Set([
    "og:image",
    "twitter:image",
    "description",
    "og:description",
    ...extraMetaNames,
  ]);
  const meta: Record<string, string> = Object.create(null);
  for (const element of document.querySelectorAll<HTMLMetaElement>(
    "meta[content]",
  )) {
    const key = (
      element.getAttribute("property") ||
      element.getAttribute("name") ||
      ""
    ).toLowerCase();
    if (wanted.has(key) && !Object.hasOwn(meta, key))
      meta[key] = element.content;
  }
  const urls: string[] = [];
  for (const value of [
    meta["og:image"] || meta["twitter:image"] || "",
    document
      .querySelector<HTMLLinkElement>('link[rel~="canonical"]')
      ?.getAttribute("href") ?? "",
  ]) {
    let resolved = "";
    if (value) {
      try {
        const url = new URL(value, document.baseURI);
        if (["https:", "http:"].includes(url.protocol)) resolved = url.href;
      } catch {
        /* Invalid image/canonical URLs are treated as missing. */
      }
    }
    urls.push(resolved);
  }
  return {
    url: window.location.href,
    title: document.title,
    ogImage: urls[0] ?? "",
    description: meta.description || meta["og:description"] || "",
    selection: window.getSelection()?.toString() ?? "",
    canonicalUrl: urls[1] || window.location.href,
    meta: { ...meta },
  };
}
