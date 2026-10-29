import i18n from "@/lib/i18n";

const defaultMessage = {
  ja: "コピーしました",
  en: "Copied.",
  "zh-cn": "已复制",
  es: "Copiado",
};

const notify = async (message = defaultMessage, closeWindow = true) => {
  try {
    await browser.notifications.create("", {
      type: "basic",
      title: "Share-it",
      message: i18n.t(message),
      iconUrl: browser.runtime.getURL("/icons/128.png"),
    });
  } catch (error) {
    console.error("Notification failed:", error);
  }
  if (closeWindow) window.close();
};

export default notify;
