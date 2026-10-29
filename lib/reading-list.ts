export const readingListLabel = {
  en: "Save to Reading List",
  ja: "リーディングリストに保存",
  "zh-cn": "保存到阅读清单",
  es: "Guardar en la lista de lectura",
};

export const readingListMessages = {
  added: {
    en: "Saved to Reading List.",
    ja: "リーディングリストに保存しました。",
    "zh-cn": "已保存到阅读清单。",
    es: "Se guardó en la lista de lectura.",
  },
  exists: {
    en: "Already in Reading List.",
    ja: "リーディングリストに保存済みです。",
    "zh-cn": "已在阅读清单中。",
    es: "Ya está en la lista de lectura.",
  },
  denied: {
    en: "Allow access to Reading List to save this link.",
    ja: "保存するにはリーディングリストへのアクセスを許可してください。",
    "zh-cn": "请允许访问阅读清单以保存此链接。",
    es: "Permite el acceso a la lista de lectura para guardar este enlace.",
  },
  unsupported: {
    en: "Reading List is not available in this browser.",
    ja: "このブラウザではリーディングリストを利用できません。",
    "zh-cn": "此浏览器不支持阅读清单。",
    es: "La lista de lectura no está disponible en este navegador.",
  },
  failed: {
    en: "Could not save to Reading List. Please try again.",
    ja: "リーディングリストに保存できませんでした。もう一度お試しください。",
    "zh-cn": "无法保存到阅读清单，请重试。",
    es: "No se pudo guardar en la lista de lectura. Inténtalo de nuevo.",
  },
};

export function requestReadingListPermission() {
  // Request directly from the click handler, before any asynchronous work.
  return browser.permissions.request({ permissions: ["readingList"] });
}

export async function saveToReadingList(
  target: { url: string; title: string },
  permission?: Promise<boolean>,
): Promise<"added" | "exists" | "denied" | "unsupported"> {
  const url = new URL(target.url);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("url");
  if (!(await (permission ?? requestReadingListPermission()))) return "denied";
  if (!browser.readingList) return "unsupported";
  if ((await browser.readingList.query({ url: target.url })).length)
    return "exists";
  try {
    await browser.readingList.addEntry({
      url: target.url,
      title: target.title || target.url,
      hasBeenRead: false,
    });
  } catch (error) {
    // Another click may have added the same URL after the first query.
    if ((await browser.readingList.query({ url: target.url })).length)
      return "exists";
    throw error;
  }
  return "added";
}
