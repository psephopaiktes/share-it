import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Script } from "node:vm";
import ts from "typescript";
import * as vue from "vue";
import { compileScript, parse } from "vue/compiler-sfc";
import { defaultButtonList } from "../components/defaultButtonList";
import * as settings from "../lib/settings";
import { shareActions } from "../lib/share-actions";

const compiled = new Map<string, string>();

function fixture(data: Record<string, unknown> = {}) {
  const opened: string[] = [];
  const store = vue.reactive({
    editing: false,
    tab: {
      title: "Title 日本語 & #",
      url: "https://example.test/?x=1&y=2#part",
    },
    buttonText: {} as Record<string, Record<string, string>>,
    textSettingsLoaded: false,
    textSettingsErrors: {} as Record<string, string>,
    textSettingsError: "",
  });
  const browser = {
    storage: {
      sync: {
        async get(key: string) {
          return { [key]: data[key] };
        },
      },
    },
  };
  function setup(path: string) {
    let code = compiled.get(path);
    if (!code) {
      const { descriptor, errors } = parse(
        readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
      );
      assert.deepEqual(errors, []);
      code = ts.transpileModule(
        compileScript(descriptor, { id: path }).content,
        {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.CommonJS,
          },
        },
      ).outputText;
      compiled.set(path, code);
    }
    const module = {
      exports: {} as {
        default: {
          setup: (
            props: object,
            context: object,
          ) => {
            run: () => void;
            loadButtonTextSettings: () => Promise<void>;
          };
        };
      },
    };
    new Script(code).runInNewContext({
      module,
      exports: module.exports,
      URL,
      URLSearchParams,
      browser,
      navigator: { language: "en" },
      window: { open: (url: string) => opened.push(url) },
      require(name: string) {
        if (name === "vue") return { ...vue, onMounted() {}, onUnmounted() {} };
        if (name === "@/entrypoints/popup/store" || name === "./store")
          return { default: store };
        if (name === "@/lib/settings") return settings;
        if (name === "@/lib/share-actions") return { shareActions };
        if (name === "@/components/defaultButtonList")
          return { defaultButtonList };
        if (name === "@/lib/i18n")
          return {
            default: { t: (labels: Record<string, string>) => labels.en },
          };
        if (name.endsWith(".vue")) return { default: {} };
        throw new Error(`Unexpected dependency: ${name}`);
      },
    });
    return module.exports.default.setup({}, { expose() {} });
  }
  const app = setup("entrypoints/popup/App.vue");
  const actions = ["Mastodon", "Gmail", "Email"].map(
    (name) => setup(`components/Button/${name}.vue`).run,
  );
  return { store, browser, opened, app, actions };
}

test("unset settings preserve mstdn.jp and both existing empty-recipient compose URLs", async () => {
  const f = fixture();
  for (const action of f.actions) action();
  assert.deepEqual(f.opened, []);
  await f.app.loadButtonTextSettings();
  assert.equal(f.store.textSettingsLoaded, true);
  for (const action of f.actions) action();
  const [mastodon, gmail, email] = f.opened.map((url) => new URL(url));
  assert.equal(mastodon?.origin, "https://mstdn.jp");
  assert.equal(mastodon?.pathname, "/share");
  assert.equal(
    mastodon?.searchParams.get("text"),
    `${f.store.tab.title} ${f.store.tab.url}`,
  );
  assert.equal(gmail?.origin, "https://gmail.google.com");
  assert.equal(gmail?.searchParams.has("to"), false);
  assert.equal(gmail?.searchParams.get("su"), f.store.tab.title);
  assert.equal(gmail?.searchParams.get("body"), f.store.tab.url);
  assert.equal(email?.pathname, "");
  assert.equal(email?.searchParams.get("subject"), f.store.tab.title);
  assert.equal(email?.searchParams.get("body"), f.store.tab.url);
});

test("each configured recipient and the normalized Mastodon instance reach their actual actions", async () => {
  const gmailTo = "me+tag&reply=?@example.test";
  const emailTo = "different+tag@example.test";
  const f = fixture({
    "button-text:Mastodon:instance": " https://MASTODON.SOCIAL/ ",
    "button-text:Gmail:recipient": gmailTo,
    "button-text:Email:recipient": emailTo,
  });
  await f.app.loadButtonTextSettings();
  for (const action of f.actions) action();
  const [mastodon, gmail, email] = f.opened.map((url) => new URL(url));
  assert.equal(mastodon?.origin, "https://mastodon.social");
  assert.equal(gmail?.searchParams.get("to"), gmailTo);
  assert.equal(gmail?.searchParams.get("body"), f.store.tab.url);
  assert.equal(email && decodeURIComponent(email.pathname), emailTo);
  assert.equal(email?.searchParams.get("subject"), f.store.tab.title);
  assert.equal(email?.searchParams.has("bcc"), false);
});

test("mailto recipient metacharacters are encoded instead of becoming headers", async () => {
  const recipient = "me?bcc=other&body=changed@example.test";
  const f = fixture({ "button-text:Email:recipient": recipient });
  await f.app.loadButtonTextSettings();
  f.actions[2]?.();
  const email = new URL(f.opened[0] ?? "");
  assert.equal(decodeURIComponent(email.pathname), recipient);
  assert.equal(email.searchParams.has("bcc"), false);
  assert.equal(email.searchParams.get("body"), f.store.tab.url);
});

test("a slower old Sync read cannot replace more recent recipient settings", async () => {
  const f = fixture();
  let release: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  f.browser.storage.sync.get = async () => {
    await pending;
    return {};
  };
  const oldRead = f.app.loadButtonTextSettings();
  f.browser.storage.sync.get = async (key) => ({
    [key]:
      key === "button-text:Gmail:recipient" ? "latest@example.test" : undefined,
  });
  await f.app.loadButtonTextSettings();
  release();
  await oldRead;
  f.actions[1]?.();
  assert.equal(
    new URL(f.opened[0] ?? "").searchParams.get("to"),
    "latest@example.test",
  );
});

test("Sync failures or invalid synced destinations cannot silently open an unconfigured compose window", async () => {
  for (const value of [
    "javascript:alert(1)",
    "https://user:password@mastodon.social/",
  ]) {
    const f = fixture({ "button-text:Mastodon:instance": value });
    await f.app.loadButtonTextSettings();
    assert.equal(f.store.textSettingsLoaded, true);
    assert(f.store.textSettingsErrors.Mastodon);
    f.actions[0]?.();
    assert.deepEqual(f.opened, []);
    f.actions[1]?.();
    f.actions[2]?.();
    assert.equal(f.opened.length, 2);
  }
  const f = fixture();
  f.browser.storage.sync.get = async () => {
    throw new Error("Sync unavailable");
  };
  await f.app.loadButtonTextSettings();
  for (const action of f.actions) action();
  assert.deepEqual(f.opened, []);
  assert.equal(f.store.textSettingsLoaded, false);
});

test("instance input accepts bare domains and HTTPS origins but rejects URLs containing paths or credentials", () => {
  for (const input of ["", "mstdn.jp", " https://mstdn.jp/ "]) {
    assert.equal(settings.normalizeMastodonInstance(input), "mstdn.jp");
  }
  assert.equal(
    settings.normalizeMastodonInstance("https://mastodon.social/"),
    "mastodon.social",
  );
  for (const input of [
    "http://mastodon.social",
    "https://user@mastodon.social",
    "mastodon.social/home",
    "mastodon.social?text=x",
    "mastodon.social#home",
    "not a host",
    "https://mastodon.social\\@evil.test",
  ]) {
    assert.equal(settings.normalizeMastodonInstance(input), null, input);
  }
});

test("recipient input accepts a single address or blank and rejects header injection and address lists", () => {
  assert.equal(settings.normalizeEmailRecipient(""), "");
  assert.equal(
    settings.normalizeEmailRecipient(" me+tag@example.test "),
    "me+tag@example.test",
  );
  for (const input of [
    "not-an-address",
    "me@example.test\r\nBcc: other@example.test",
    "me@example.test,other@example.test",
    "me@example.test;other@example.test",
    "Name <me@example.test>",
    "me@domain?bcc=other",
  ]) {
    assert.equal(settings.normalizeEmailRecipient(input), null, input);
  }
});
