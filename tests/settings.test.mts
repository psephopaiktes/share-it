import assert from "node:assert/strict";
import { test } from "node:test";
import { loadButtons, saveButtons, textSetting } from "../lib/settings";

function storageFixture(data: Record<string, unknown> = {}) {
  return {
    data,
    async get(key: string) {
      return structuredClone({ [key]: data[key] });
    },
    async set(items: Record<string, unknown>) {
      Object.assign(data, structuredClone(items));
    },
    async remove(key: string) {
      delete data[key];
    },
  };
}

const defaults = [
  { componentName: "X", enable: true },
  { componentName: "Mastodon", enable: false },
];

test("text fields and the existing button list survive independent saves", async () => {
  const storage = storageFixture({
    options: {
      buttons: [{ componentName: "Mastodon", enable: true }, defaults[0]],
      futureOption: { keep: true },
    },
  });
  const instance = textSetting(
    storage,
    "Mastodon",
    "instance",
    "https://mstdn.jp",
  );
  const recipient = textSetting(storage, "SendMailToMyself", "recipient");
  await Promise.all([
    instance.set("https://example.social"),
    recipient.set("me@example.test"),
  ]);
  const buttons = await loadButtons(storage, defaults);
  assert.deepEqual(buttons, [
    { componentName: "Mastodon", enable: true },
    defaults[0],
  ]);
  assert.ok(buttons[0]);
  buttons[0].enable = false;
  await saveButtons(storage, buttons, defaults);
  assert.equal(await instance.get(), "https://example.social");
  assert.equal(await recipient.get(), "me@example.test");
  assert.deepEqual(storage.data.options, {
    buttons: [{ componentName: "Mastodon", enable: false }, defaults[0]],
    futureOption: { keep: true },
  });
});

test("text values preserve empty strings, whitespace, Unicode and line breaks on reopen", async () => {
  const storage = storageFixture();
  for (const value of [
    "",
    "  text  ",
    "こんにちは\n🙂\n次の行",
    "<script>text</script>",
  ]) {
    await textSetting(storage, "Example", "text", "fallback").set(value);
    assert.equal(
      await textSetting(storage, "Example", "text", "fallback").get(),
      value,
    );
  }
});

test("reset removes only the selected field and restores its default", async () => {
  const storage = storageFixture();
  const first = textSetting(storage, "Example", "first", "default");
  const second = textSetting(storage, "Example", "second");
  await first.set("");
  await second.set("preserved");
  await first.reset();
  assert.equal(await first.get(), "default");
  assert.equal(Object.hasOwn(storage.data, first.key), false);
  assert.equal(await second.get(), "preserved");
});

test("missing or malformed text values fall back without overwriting Sync storage", async () => {
  const storage = storageFixture();
  const setting = textSetting(storage, "Example", "text", "default");
  assert.equal(await setting.get(), "default");
  assert.deepEqual(storage.data, {});
  for (const value of [null, 42, {}, ["text"]]) {
    storage.data[setting.key] = value;
    assert.equal(await setting.get(), "default");
    assert.deepEqual(storage.data[setting.key], value);
  }
});

test("field identifiers cannot collide through separator characters", async () => {
  const storage = storageFixture();
  const first = textSetting(storage, "a:b", "c");
  const second = textSetting(storage, "a", "b:c");
  await first.set("first");
  await second.set("second");
  assert.equal(await first.get(), "first");
  assert.equal(await second.get(), "second");
});

test("read, quota and reset failures propagate for the UI to report", async () => {
  const failure = new Error("Sync unavailable or quota exceeded");
  const storage = {
    async get(): Promise<Record<string, unknown>> {
      throw failure;
    },
    async set(): Promise<void> {
      throw failure;
    },
    async remove(): Promise<void> {
      throw failure;
    },
  };
  const setting = textSetting(storage, "Example", "text");
  await assert.rejects(setting.get(), failure);
  await assert.rejects(setting.set("draft"), failure);
  await assert.rejects(setting.reset(), failure);
  await assert.rejects(loadButtons(storage, defaults), failure);
  await assert.rejects(saveButtons(storage, defaults, defaults), failure);
});
