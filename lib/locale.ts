export function resolveLocale(
  language: string,
  translations: object,
  fallback: string,
): string {
  const normalized = language.toLowerCase().replace(/_/g, "-");
  if (Object.hasOwn(translations, normalized)) return normalized;
  const base = normalized.split("-")[0] ?? "";
  return Object.hasOwn(translations, base) ? base : fallback;
}
