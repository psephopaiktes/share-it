import type { ButtonConfig } from "../components/defaultButtonList";

export function normalizeButtons(
  saved: unknown,
  defaults: readonly ButtonConfig[],
): ButtonConfig[] {
  const available = new Map(
    defaults.map((button) => [button.componentName, button]),
  );
  const result: ButtonConfig[] = [];
  if (Array.isArray(saved)) {
    for (const value of saved) {
      if (!value || typeof value !== "object") continue;
      const button = available.get(value.componentName);
      if (!button) continue;
      result.push({
        componentName: button.componentName,
        enable:
          typeof value.enable === "boolean" ? value.enable : button.enable,
      });
      available.delete(button.componentName);
    }
  }
  return [
    ...result,
    ...Array.from(available.values(), (button) => ({ ...button })),
  ];
}
