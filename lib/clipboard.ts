import i18n from "./i18n";
import notify from "./notify";

export async function copyToClipboard(
  write: () => Promise<void>,
): Promise<void> {
  try {
    await write();
  } catch (error) {
    console.error("Copy failed:", error);
    alert(
      i18n.t({
        en: "Could not copy. Please try again.",
        ja: "コピーできませんでした。もう一度お試しください。",
        "zh-cn": "复制失败，请重试。",
        es: "No se pudo copiar. Inténtalo de nuevo.",
      }),
    );
    return;
  }
  // A notification failure must not report a successful clipboard write as failed.
  await notify();
}
