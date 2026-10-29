import {
  type ButtonConfig,
  defaultButtonList,
} from "../components/defaultButtonList";
import {
  CUSTOM_BUTTON_PREFIX,
  customButtonDefaults,
  getTemplateVariables,
  loadCustomButtons,
  readSharePageData,
  renderShareUrl,
  type SharePageData,
} from "./custom-buttons";
import i18n from "./i18n";
import notify from "./notify";
import {
  readingListLabel,
  readingListMessages,
  requestReadingListPermission,
  saveToReadingList,
} from "./reading-list";
import { loadButtons, textSetting } from "./settings";
import { getShareAction } from "./share-actions";

const prefix = "share-it:";
type ClickData = Pick<
  chrome.contextMenus.OnClickData,
  "linkUrl" | "selectionText" | "pageUrl" | "frameUrl" | "frameId"
> & { linkText?: string };
type ClickTab = Pick<chrome.tabs.Tab, "id" | "url" | "title">;
const shareError = {
  en: "Could not share. Check your button settings and try again.",
  ja: "共有できませんでした。ボタンの設定を確認して、もう一度お試しください。",
  "zh-cn": "无法分享。请检查按钮设置后重试。",
  es: "No se pudo compartir. Revisa los ajustes del botón e inténtalo de nuevo.",
};

function isWebUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function getContextTarget(info: ClickData, tab: ClickTab = {}) {
  if (info.linkUrl) {
    if (!isWebUrl(info.linkUrl)) return null;
    return {
      kind: "link" as const,
      page: {
        url: info.linkUrl,
        title: info.linkText?.trim() || info.linkUrl,
        selection: "",
      } satisfies SharePageData,
    };
  }
  if (!info.selectionText?.trim()) return null;
  const url = [info.frameUrl, info.pageUrl, tab.url].find(
    (value) => value && isWebUrl(value),
  );
  if (!url) return null;
  return {
    kind: "selection" as const,
    page: {
      url,
      title: (url === tab.url ? tab.title : "") || url,
      selection: info.selectionText,
    } satisfies SharePageData,
  };
}

async function removeMenus() {
  // Promise support for this Chrome API starts at 123; Reading List starts at 120.
  if (import.meta.env?.BROWSER === "chrome") {
    await new Promise<void>((resolve, reject) =>
      browser.contextMenus.removeAll(() => {
        const error = browser.runtime.lastError;
        if (error) reject(new Error(error.message));
        else resolve();
      }),
    );
  } else await browser.contextMenus.removeAll();
}

async function createMenu(properties: chrome.contextMenus.CreateProperties) {
  await new Promise<void>((resolve, reject) =>
    browser.contextMenus.create(properties, () => {
      const error = browser.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    }),
  );
}

export function createContextMenus(
  defaults: readonly ButtonConfig[] = defaultButtonList,
) {
  let revision = 0;
  let pending = Promise.resolve();

  async function snapshot() {
    const custom = await loadCustomButtons(browser.storage.sync);
    const buttons = await loadButtons(browser.storage.sync, [
      ...defaults,
      ...customButtonDefaults(custom),
    ]);
    return { custom, buttons };
  }

  function refresh() {
    const request = ++revision;
    pending = pending
      .catch(() => {})
      .then(async () => {
        const { custom, buttons } = await snapshot();
        if (request !== revision) return;
        await removeMenus();
        const entries = buttons
          .filter((button) => button.enable)
          .flatMap((button) => {
            const action = getShareAction(button.componentName);
            const title = button.componentName.startsWith("custom:")
              ? custom.find(
                  (item) => `custom:${item.id}` === button.componentName,
                )?.name
              : button.componentName === "ReadingList"
                ? i18n.t(readingListLabel)
                : action
                  ? i18n.t(action.label)
                  : undefined;
            return title ? [{ name: button.componentName, title }] : [];
          });
        if (!entries.length || request !== revision) return;
        await createMenu({
          id: "share-it",
          title: "Share-it",
          contexts: ["link", "selection"],
        });
        for (const entry of entries) {
          if (request !== revision) return;
          await createMenu({
            id: prefix + entry.name,
            parentId: "share-it",
            title: entry.title,
            contexts: ["link", "selection"],
          });
        }
      });
    return pending;
  }

  async function click(
    info: chrome.contextMenus.OnClickData & { linkText?: string },
    tab?: ClickTab,
  ) {
    if (
      typeof info.menuItemId !== "string" ||
      !info.menuItemId.startsWith(prefix)
    )
      return;
    const name = info.menuItemId.slice(prefix.length);
    const target = getContextTarget(info, tab);
    if (!target) {
      await notify(
        {
          en: "Choose a web link or selected text on a web page.",
          ja: "Webページのリンク、または選択したテキストを共有してください。",
          "zh-cn": "请选择网页链接或网页上的文字。",
          es: "Elige un enlace web o texto seleccionado en una página web.",
        },
        false,
      );
      return;
    }
    // Chrome's optional permission prompt must retain the menu click's user gesture.
    const permission =
      name === "ReadingList" &&
      defaults.some((button) => button.componentName === name)
        ? requestReadingListPermission().catch(() => false)
        : undefined;
    const { custom, buttons } = await snapshot();
    if (
      !buttons.some((button) => button.componentName === name && button.enable)
    )
      return;
    if (name === "ReadingList") {
      if (!permission) return;
      const result = await saveToReadingList(target.page, permission);
      await notify(readingListMessages[result], false);
      return;
    }
    let url: string;
    if (name.startsWith("custom:")) {
      const button = custom.find((item) => `custom:${item.id}` === name);
      if (!button) return;
      let page: SharePageData = target.page;
      if (
        target.kind === "selection" &&
        tab?.id !== undefined &&
        getTemplateVariables(button.urlTemplate).some(
          (key) => !["url", "title", "selection"].includes(key),
        )
      ) {
        try {
          const [result] = await browser.scripting.executeScript({
            target: {
              tabId: tab.id,
              ...(info.frameId !== undefined
                ? { frameIds: [info.frameId] }
                : {}),
            },
            func: readSharePageData,
            args: [
              getTemplateVariables(button.urlTemplate)
                .filter((key) => key.startsWith("meta:"))
                .map((key) => key.slice(5)),
            ],
          });
          if (
            result?.result &&
            new URL(result.result.url).href === new URL(page.url).href
          )
            page = {
              ...result.result,
              url: page.url,
              selection: page.selection,
            };
        } catch {
          /* Restricted frames keep the captured URL and selection. */
        }
      }
      url = renderShareUrl(button.urlTemplate, page);
    } else {
      const action = getShareAction(name);
      if (!action) return;
      const fields =
        defaults.find((button) => button.componentName === name)?.settings
          ?.fields ?? [];
      const settings = Object.fromEntries(
        await Promise.all(
          fields.map(async (field) => {
            const raw = await textSetting(
              browser.storage.sync,
              name,
              field.id,
              field.defaultValue,
            ).get();
            const value = field.normalize ? field.normalize(raw) : raw;
            if (value === null) throw new Error("settings");
            return [field.id, value];
          }),
        ),
      );
      url = action.url(target.page, settings, browser.i18n.getUILanguage());
    }
    await browser.tabs.create({ url });
  }

  return { refresh, click };
}

export function startContextMenus() {
  const menus = createContextMenus();
  const refresh = () => {
    void menus
      .refresh()
      .catch((error) =>
        console.error("Could not update context menus:", error),
      );
  };
  browser.contextMenus.onClicked.addListener((info, tab) => {
    void menus.click(info, tab).catch(async (error) => {
      console.error("Could not share from context menu:", error);
      await notify(shareError, false);
    });
  });
  browser.runtime.onInstalled.addListener(refresh);
  browser.runtime.onStartup.addListener(refresh);
  browser.storage.onChanged.addListener((changes, area) => {
    if (
      area === "sync" &&
      Object.keys(changes).some(
        (key) => key === "options" || key.startsWith(CUSTOM_BUTTON_PREFIX),
      )
    )
      refresh();
  });
  refresh();
}
