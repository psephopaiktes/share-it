import assert from "node:assert/strict";
import { test } from "node:test";
import { getDefaultButtonList } from "../components/defaultButtonList";
import { CUSTOM_BUTTON_PREFIX, type CustomButton } from "../lib/custom-buttons";
import { getShareAction, shareActions } from "../lib/share-actions";

const tab = { id: 7, url: "https://source.test/article", title: "Source page" };
const custom: CustomButton = {
  id: "test-button",
  name: "My service",
  urlTemplate:
    "https://share.test/?url={{url}}&title={{title}}&image={{ogImage}}&selection={{selection}}",
};
const clicked = (name: string, extra: object = {}) => ({
  menuItemId: `share-it:${name}`,
  editable: false,
  pageUrl: tab.url,
  linkUrl: "https://destination.test/unopened?a=1&b=2",
  ...extra,
});

async function fixture(data: Record<string, unknown> = {}) {
  const opened: string[] = [],
    notices: string[] = [],
    events: string[] = [];
  const menus = new Map<string, chrome.contextMenus.CreateProperties>();
  const listeners: Record<string, unknown> = {};
  const api = {
    runtime: {
      id: "test",
      getManifest: () => ({ default_locale: "en" }),
      getURL: (path: string) => `chrome-extension://test${path}`,
      lastError: undefined as { message: string } | undefined,
      onInstalled: {
        addListener: (fn: unknown) => {
          listeners.install = fn;
        },
      },
      onStartup: {
        addListener: (fn: unknown) => {
          listeners.startup = fn;
        },
      },
    },
    i18n: { getUILanguage: () => "en" },
    tabs: {
      create: async ({ url }: { url: string }) => {
        opened.push(url);
      },
    },
    notifications: {
      create: async (_id: string, value: { message: string }) => {
        notices.push(value.message);
      },
    },
    permissions: {
      request: async () => {
        events.push("permission");
        return true;
      },
    },
    readingList: {
      query: async () => [],
      addEntry: async (entry: chrome.readingList.AddEntryOptions) => {
        events.push(`reading:${entry.url}`);
      },
    },
    storage: {
      sync: {
        get: async (key: string | null) => {
          events.push("read");
          return structuredClone(key === null ? data : { [key]: data[key] });
        },
        set: async (value: Record<string, unknown>) => {
          Object.assign(data, value);
        },
        remove: async (key: string) => {
          delete data[key];
        },
      },
      onChanged: {
        addListener: (fn: unknown) => {
          listeners.storage = fn;
        },
      },
    },
    contextMenus: {
      removeAll: async () => {
        menus.clear();
      },
      create: (
        properties: chrome.contextMenus.CreateProperties,
        callback: () => void,
      ) => {
        menus.set(String(properties.id), properties);
        callback();
        return properties.id;
      },
      onClicked: {
        addListener: (fn: unknown) => {
          listeners.click = fn;
        },
      },
    },
    scripting: {
      executeScript: async (
        _request: unknown,
      ): Promise<
        {
          result: {
            url: string;
            title: string;
            ogImage: string;
            selection: string;
          };
        }[]
      > => {
        throw new Error("restricted");
      },
    },
  };
  Object.assign(globalThis, {
    browser: api,
    window: {
      close: () => {
        throw new Error("background must not close a window");
      },
    },
  });
  const module = await import("../lib/context-menu");
  return { api, data, menus, opened, notices, events, listeners, ...module };
}

test("right-click targets distinguish unopened links, anchor text and selected quotes without borrowing the source title", async () => {
  const f = await fixture();
  const link = f.getContextTarget(clicked("X"), tab);
  assert.equal(link?.page.title, "https://destination.test/unopened?a=1&b=2");
  assert.equal(link?.page.url, "https://destination.test/unopened?a=1&b=2");
  assert.equal(
    f.getContextTarget(
      clicked("X", {
        linkText: " Read this ",
        selectionText: "Unrelated text",
      }),
      tab,
    )?.page.title,
    "Read this",
  );
  assert.equal(
    f.getContextTarget(clicked("X", { selectionText: "Unrelated text" }), tab)
      ?.page.selection,
    "",
  );
  const selection = f.getContextTarget(
    { pageUrl: tab.url, selectionText: "A quote 日本語 & <b>text</b>" },
    tab,
  );
  assert.equal(selection?.kind, "selection");
  assert.equal(selection?.page.title, tab.title);
  assert.equal(selection?.page.url, tab.url);
  assert.equal(
    f.getContextTarget(
      { pageUrl: tab.url, selectionText: "quote" },
      { ...tab, url: "https://another.test/", title: "Unrelated new page" },
    )?.page.title,
    tab.url,
  );
  assert.equal(selection?.page.selection, "A quote 日本語 & <b>text</b>");
  assert.equal(
    f.getContextTarget(
      {
        frameUrl: "https://frame.test/page",
        pageUrl: tab.url,
        selectionText: "quote",
      },
      tab,
    )?.page.title,
    "https://frame.test/page",
  );
  for (const linkUrl of [
    "javascript:alert(1)",
    "data:text/html,hi",
    "file:///a",
    "broken",
  ])
    assert.equal(f.getContextTarget({ linkUrl }, tab), null);
});

test("context menus follow saved order and switches, include custom names and omit page-only operations", async () => {
  const f = await fixture({
    [`${CUSTOM_BUTTON_PREFIX}${custom.id}`]: custom,
    options: {
      buttons: [
        { componentName: `custom:${custom.id}`, enable: true },
        { componentName: "X", enable: false },
        { componentName: "Instapaper", enable: true },
        { componentName: "Print", enable: true },
        { componentName: "CopyTitle", enable: true },
      ],
    },
  });
  const controller = f.createContextMenus([
    { componentName: "X", enable: true },
    { componentName: "Instapaper", enable: false },
    { componentName: "Print", enable: false },
    { componentName: "CopyTitle", enable: false },
  ]);
  await controller.refresh();
  assert.deepEqual(
    [...f.menus.keys()],
    ["share-it", `share-it:custom:${custom.id}`, "share-it:Instapaper"],
  );
  assert.equal(f.menus.get(`share-it:custom:${custom.id}`)?.title, custom.name);
  assert.deepEqual(f.menus.get("share-it")?.contexts, ["link", "selection"]);
  f.data.options = {
    buttons: [
      { componentName: "X", enable: true },
      { componentName: "Instapaper", enable: false },
    ],
  };
  delete f.data[`${CUSTOM_BUTTON_PREFIX}${custom.id}`];
  await controller.refresh();
  assert.deepEqual([...f.menus.keys()], ["share-it", "share-it:X"]);
});

test("context sharing sends captured URLs and quotes through the same actions as the popup", async () => {
  const f = await fixture();
  const controller = f.createContextMenus();
  await controller.click(clicked("X"), tab);
  let result = new URL(f.opened[0] ?? "");
  assert.equal(
    result.searchParams.get("url"),
    "https://destination.test/unopened?a=1&b=2",
  );
  assert.equal(result.searchParams.get("text"), "");
  await controller.click(
    clicked("X", {
      linkUrl: undefined,
      selectionText: "Quote & url=malicious 日本語",
    }),
    tab,
  );
  result = new URL(f.opened[1] ?? "");
  assert.equal(result.searchParams.get("text"), "Quote & url=malicious 日本語");
  assert.equal(result.searchParams.get("url"), tab.url);
  assert.equal(getShareAction("__proto__"), undefined);
  for (const action of Object.values(shareActions))
    assert.doesNotThrow(
      () =>
        new URL(
          action.url(
            { url: tab.url, title: tab.title },
            { instance: "mstdn.jp" },
            "en",
          ),
        ),
    );
});

test("context sharing reads the latest instance and recipients and blocks invalid or unavailable settings", async () => {
  const f = await fixture({
    options: {
      buttons: [
        { componentName: "Mastodon", enable: true },
        { componentName: "Gmail", enable: true },
        { componentName: "Email", enable: true },
      ],
    },
    "button-text:Mastodon:instance": "https://MASTODON.SOCIAL/",
    "button-text:Gmail:recipient": "me+tag&reply=?@example.test",
    "button-text:Email:recipient": "other@example.test",
  });
  const controller = f.createContextMenus();
  await controller.click(clicked("Mastodon"), tab);
  await controller.click(clicked("Gmail"), tab);
  await controller.click(
    clicked("Email", {
      linkUrl: undefined,
      selectionText: "Selected quotation",
    }),
    tab,
  );
  assert.equal(new URL(f.opened[0] ?? "").origin, "https://mastodon.social");
  assert.equal(
    new URL(f.opened[1] ?? "").searchParams.get("to"),
    "me+tag&reply=?@example.test",
  );
  const mail = new URL(f.opened[2] ?? "");
  assert.equal(decodeURIComponent(mail.pathname), "other@example.test");
  assert.equal(
    mail.searchParams.get("body"),
    `Selected quotation\n\n${tab.url}`,
  );
  f.data["button-text:Gmail:recipient"] = "invalid";
  await assert.rejects(controller.click(clicked("Gmail"), tab), /settings/);
  f.api.storage.sync.get = async () => {
    throw new Error("Sync unavailable");
  };
  await assert.rejects(
    controller.click(clicked("Mastodon"), tab),
    /Sync unavailable/,
  );
  assert.equal(f.opened.length, 3);
});

test("custom link templates never fetch or attach source-page metadata; selected quotes can use their own frame", async () => {
  const f = await fixture({ [`${CUSTOM_BUTTON_PREFIX}${custom.id}`]: custom });
  let injections = 0;
  f.api.scripting.executeScript = async () => {
    injections++;
    return [
      {
        result: {
          url: tab.url,
          title: "Collected title",
          ogImage: "https://source.test/image.png",
          selection: "changed selection",
        },
      },
    ];
  };
  const controller = f.createContextMenus();
  await controller.click(clicked(`custom:${custom.id}`), tab);
  let result = new URL(f.opened[0] ?? "");
  assert.equal(result.searchParams.get("image"), "");
  assert.equal(
    result.searchParams.get("title"),
    "https://destination.test/unopened?a=1&b=2",
  );
  assert.equal(injections, 0);
  await controller.click(
    clicked(`custom:${custom.id}`, {
      linkUrl: undefined,
      selectionText: "Captured selection",
      frameId: 0,
    }),
    tab,
  );
  result = new URL(f.opened[1] ?? "");
  assert.equal(result.searchParams.get("selection"), "Captured selection");
  assert.equal(
    result.searchParams.get("image"),
    "https://source.test/image.png",
  );
  assert.equal(injections, 1);
  f.api.scripting.executeScript = async () => {
    throw new Error("restricted frame");
  };
  await controller.click(
    clicked(`custom:${custom.id}`, {
      linkUrl: undefined,
      selectionText: "Still shareable",
    }),
    tab,
  );
  result = new URL(f.opened[2] ?? "");
  assert.equal(result.searchParams.get("url"), tab.url);
  assert.equal(result.searchParams.get("selection"), "Still shareable");
  assert.equal(result.searchParams.get("image"), "");
  delete f.data[`${CUSTOM_BUTTON_PREFIX}${custom.id}`];
  await controller.click(clicked(`custom:${custom.id}`), tab);
  assert.equal(f.opened.length, 3);
});

test("Reading List menu clicks request permission before storage awaits and do not close browser windows", async () => {
  const f = await fixture({
    options: { buttons: [{ componentName: "ReadingList", enable: true }] },
  });
  const controller = f.createContextMenus(getDefaultButtonList("chrome"));
  await controller.click(clicked("ReadingList"), tab);
  assert.equal(f.events[0], "permission");
  assert(
    f.events.includes("reading:https://destination.test/unopened?a=1&b=2"),
  );
  assert.equal(f.notices[0], "Saved to Reading List.");
  f.api.permissions.request = async () => false;
  await controller.click(clicked("ReadingList"), tab);
  assert.equal(f.notices[1], "Allow access to Reading List to save this link.");
});

test("stale disabled menu items cannot open a sharing destination", async () => {
  const f = await fixture({
    options: { buttons: [{ componentName: "X", enable: false }] },
  });
  const controller = f.createContextMenus();
  await controller.click(clicked("X"), tab);
  await controller.click(
    clicked("X", { menuItemId: "another-extension:X" }),
    tab,
  );
  assert.deepEqual(f.opened, []);
});

test("text-capable destinations preserve a selected quote and its source URL", () => {
  const target = {
    url: tab.url,
    title: tab.title,
    selection: "A quote 日本語 & ? #\nNext line",
  };
  for (const [name, parameter] of [
    ["Sms", "body"],
    ["Craft", "content"],
    ["RaycastNote", "fallbackText"],
    ["Outlook", "body"],
    ["GoogleCalendar", "details"],
  ]) {
    assert.ok(name && parameter);
    const action = getShareAction(name);
    assert.ok(action);
    const text = new URL(action.url(target, {}, "ja-JP")).searchParams.get(
      parameter,
    );
    assert(text?.includes(target.selection), name);
    assert(text?.includes(target.url), name);
  }
  const translation = new URL(
    shareActions.GoogleTranslate.url(target, {}, "ja-JP"),
  );
  assert.equal(translation.searchParams.get("text"), target.selection);
  assert.equal(translation.searchParams.get("tl"), "ja");
});

test("menu rebuilding recovers from API failure and collapses overlapping refreshes to the latest settings", async () => {
  const f = await fixture({
    options: { buttons: [{ componentName: "X", enable: true }] },
  });
  const defaults = [
    { componentName: "X", enable: false },
    { componentName: "Instapaper", enable: false },
  ];
  const controller = f.createContextMenus(defaults);
  const create = f.api.contextMenus.create;
  f.api.contextMenus.create = (properties, callback) => {
    f.api.runtime.lastError = { message: "Creation failed" };
    callback();
    f.api.runtime.lastError = undefined;
    return properties.id;
  };
  await assert.rejects(controller.refresh(), /Creation failed/);
  f.api.contextMenus.create = create;
  const first = controller.refresh();
  f.data.options = {
    buttons: [
      { componentName: "Instapaper", enable: true },
      { componentName: "X", enable: false },
    ],
  };
  const second = controller.refresh();
  await Promise.all([first, second]);
  assert.deepEqual([...f.menus.keys()], ["share-it", "share-it:Instapaper"]);
});
