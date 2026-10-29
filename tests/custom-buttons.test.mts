import assert from "node:assert/strict";
import { test } from "node:test";
import { Script } from "node:vm";
import { defaultButtonList } from "../components/defaultButtonList";
import { normalizeButtons } from "../lib/button-options";
import {
  CUSTOM_BUTTON_PREFIX,
  type CustomButton,
  customButtonDefaults,
  deleteCustomButton,
  loadCustomButtons,
  MAX_CUSTOM_BUTTONS,
  normalizeCustomButton,
  readSharePageData,
  renderShareUrl,
  saveCustomButton,
  templateError,
} from "../lib/custom-buttons";
import { loadButtons, saveButtons } from "../lib/settings";

const first: CustomButton = {
  id: "custom-one",
  name: "My service",
  urlTemplate: "https://share.example/compose?url={{url}}&text={{title}}",
};
function fixture(data: Record<string, unknown> = {}) {
  return {
    data,
    async get(key: string | null) {
      return structuredClone(key === null ? data : { [key]: data[key] });
    },
    async set(values: Record<string, unknown>) {
      Object.assign(data, structuredClone(values));
    },
    async remove(key: string) {
      delete data[key];
    },
  };
}

test("templates encode page values exactly once without introducing new URL parameters", () => {
  const page = {
    url: "https://example.test/page?a=1&b=2#片段",
    title: "日本語 & # ? = {{url}}",
  };
  const url = new URL(renderShareUrl(first.urlTemplate, page));
  assert.equal(url.origin, "https://share.example");
  assert.equal(url.searchParams.get("url"), page.url);
  assert.equal(url.searchParams.get("text"), page.title);
  assert.equal(url.searchParams.has("b"), false);
});

test("OG images, selection, descriptions and arbitrary meta fields can be combined", () => {
  const url = new URL(
    renderShareUrl(
      "https://share.example/?image={{ogImage}}&text={{selection}}&description={{description}}&site={{meta:og:site_name}}&canonical={{canonicalUrl}}",
      {
        url: "https://example.test/?tracking=1",
        title: "Title",
        selection: "quote\n& more",
        ogImage: "https://example.test/image.jpg?a=1&b=2",
        description: "A description",
        meta: { "og:site_name": "Example & Co" },
      },
    ),
  );
  assert.equal(
    url.searchParams.get("image"),
    "https://example.test/image.jpg?a=1&b=2",
  );
  assert.equal(url.searchParams.get("text"), "quote\n& more");
  assert.equal(url.searchParams.get("description"), "A description");
  assert.equal(url.searchParams.get("site"), "Example & Co");
  assert.equal(
    url.searchParams.get("canonical"),
    "https://example.test/?tracking=1",
  );
});

test("missing metadata is empty, literal newlines can use %0A, and replacement is not recursive", () => {
  const url = new URL(
    renderShareUrl(
      "https://share.example/?text={{title}}%0A{{url}}&image={{ogImage}}&meta={{meta:not-present}}",
      { url: "https://example.test/", title: "{{selection}}" },
    ),
  );
  assert.equal(
    url.searchParams.get("text"),
    "{{selection}}\nhttps://example.test/",
  );
  assert.equal(url.searchParams.get("image"), "");
  assert.equal(url.searchParams.get("meta"), "");
});

test("templates reject executable URLs, variable destinations, credentials and unknown syntax", () => {
  for (const template of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "file:///etc/passwd",
    "https://{{title}}/share",
    "https://user:password@example.test/?url={{url}}",
    "https://share.example/?x={{unknown}}",
    "https://share.example/?x={{url}",
    "https:{{title}}",
    "https://share.example/\n?x=y",
  ]) {
    assert.notEqual(templateError(template), null, template);
    assert.throws(() =>
      renderShareUrl(template, {
        url: "https://example.test/",
        title: "example.test",
      }),
    );
  }
  assert.equal(templateError("http://localhost:3000/share?url={{url}}"), null);
  const mail = new URL(
    renderShareUrl("mailto:me@example.test?subject={{title}}&body={{url}}", {
      title: "Title & bcc=other",
      url: "https://example.test/",
    }),
  );
  assert.equal(mail.searchParams.get("subject"), "Title & bcc=other");
  assert.equal(mail.searchParams.has("bcc"), false);
});

test("custom CRUD preserves unrelated Sync values and cannot revive a concurrently deleted button", async () => {
  const storage = fixture({
    options: { buttons: [], future: true },
    "button-text:Gmail:recipient": "me@example.test",
  });
  const saved = await saveCustomButton(storage, first);
  assert.deepEqual(await loadCustomButtons(storage), [saved]);
  const renamed = await saveCustomButton(
    storage,
    { ...saved, name: "Updated" },
    saved,
  );
  await assert.rejects(
    saveCustomButton(storage, { ...saved, name: "Stale" }, saved),
    /conflict/,
  );
  await assert.rejects(deleteCustomButton(storage, saved), /conflict/);
  await deleteCustomButton(storage, renamed);
  await assert.rejects(saveCustomButton(storage, renamed, renamed), /conflict/);
  assert.deepEqual(storage.data, {
    options: { buttons: [], future: true },
    "button-text:Gmail:recipient": "me@example.test",
  });
});

test("built-in and custom buttons retain mixed order and enabled state through editing and renaming", async () => {
  const storage = fixture();
  await saveCustomButton(storage, first);
  const builtins = [
    { componentName: "X", enable: true },
    { componentName: "Gmail", enable: true },
  ];
  const defaults = [...builtins, ...customButtonDefaults([first])];
  const mixed = [
    { componentName: `custom:${first.id}`, enable: false },
    ...builtins,
  ];
  await saveButtons(storage, mixed, defaults);
  await saveCustomButton(storage, { ...first, name: "Renamed" }, first);
  assert.deepEqual(await loadButtons(storage, defaults), mixed);
  await deleteCustomButton(storage, { ...first, name: "Renamed" });
  assert.deepEqual(normalizeButtons(mixed, builtins), builtins);
});

test("malformed, mismatched and unrelated Sync records do not become custom actions", async () => {
  const storage = fixture({
    [`${CUSTOM_BUTTON_PREFIX}${first.id}`]: first,
    [`${CUSTOM_BUTTON_PREFIX}wrong-id`]: first,
    [`${CUSTOM_BUTTON_PREFIX}unsafe`]: {
      id: "unsafe",
      name: "Unsafe",
      urlTemplate: "javascript:alert(1)",
    },
    [`${CUSTOM_BUTTON_PREFIX}broken`]: null,
    options: { buttons: [] },
  });
  assert.deepEqual(await loadCustomButtons(storage), [first]);
  assert.equal(normalizeCustomButton({ ...first, id: "__proto__" }), null);
  assert.equal(normalizeCustomButton({ ...first, name: " " }), null);
});

test("save and delete failures keep the existing definition and allow retry", async () => {
  const storage = fixture();
  await saveCustomButton(storage, first);
  const offline = {
    ...storage,
    async set(): Promise<void> {
      throw new Error("quota");
    },
    async remove(): Promise<void> {
      throw new Error("offline");
    },
  };
  await assert.rejects(
    saveCustomButton(offline, { ...first, name: "Edited" }, first),
    /quota/,
  );
  await assert.rejects(deleteCustomButton(offline, first), /offline/);
  assert.deepEqual(await loadCustomButtons(storage), [first]);
  await saveCustomButton(storage, { ...first, name: "Edited" }, first);
  assert.equal((await loadCustomButtons(storage))[0]?.name, "Edited");
});

test("the custom button limit keeps a complete mixed ordering within Sync's item quota", async () => {
  const buttons = Array.from({ length: MAX_CUSTOM_BUTTONS }, (_, index) => ({
    ...first,
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
  }));
  const storage = fixture(
    Object.fromEntries(
      buttons.map((button) => [`${CUSTOM_BUTTON_PREFIX}${button.id}`, button]),
    ),
  );
  await assert.rejects(saveCustomButton(storage, first), /limit/);
  const existing = buttons[0];
  assert.ok(existing);
  await saveCustomButton(storage, { ...existing, name: "Renamed" }, existing);
  const defaults = [...defaultButtonList, ...customButtonDefaults(buttons)];
  const order = normalizeButtons(defaults, defaults);
  assert(
    new TextEncoder().encode(JSON.stringify({ options: { buttons: order } }))
      .length < 8192,
  );
});

test("the page collector works after serialization and resolves relative OG and canonical URLs", () => {
  const metas = [
    { property: "og:image", content: "../images/cover.png" },
    { property: "og:site_name", content: "Example" },
    { name: "description", content: "Page description" },
    { name: "unrequested-token", content: "not-returned" },
  ];
  const result = new Script(
    `(${readSharePageData.toString()})(["og:site_name"])`,
  ).runInNewContext({
    URL,
    window: {
      location: { href: "https://example.test/articles/item" },
      getSelection: () => "Selected text",
    },
    document: {
      baseURI: "https://example.test/articles/item",
      title: "Page title",
      querySelectorAll: () =>
        metas.map((meta) => ({
          content: meta.content,
          getAttribute: (name: string) =>
            name === "property"
              ? meta.property
              : name === "name"
                ? meta.name
                : null,
        })),
      querySelector: () => ({ getAttribute: () => "/canonical" }),
    },
  });
  assert.equal(result.ogImage, "https://example.test/images/cover.png");
  assert.equal(result.canonicalUrl, "https://example.test/canonical");
  assert.equal(result.meta["og:site_name"], "Example");
  assert.equal(Object.hasOwn(result.meta, "unrequested-token"), false);
  assert.equal(result.selection, "Selected text");
});
