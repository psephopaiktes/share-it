import assert from "node:assert/strict";
import { test } from "node:test";

test("clipboard feedback waits for writing, handles failures and uses a real icon", async () => {
  const events: string[] = [];
  let notificationFails = false;
  Object.assign(globalThis, {
    browser: {
      runtime: {
        getManifest: () => ({ default_locale: "en" }),
        getURL: (path: string) => `chrome-extension://test${path}`,
      },
      i18n: { getUILanguage: () => "en" },
      notifications: {
        create: async (_id: string, options: { iconUrl: string }) => {
          assert.equal(
            options.iconUrl,
            "chrome-extension://test/icons/128.png",
          );
          events.push("notify");
          if (notificationFails) throw new Error("notifications unavailable");
        },
      },
    },
    window: { close: () => events.push("close") },
    alert: () => events.push("alert"),
  });
  const { copyToClipboard } = await import("../lib/clipboard");
  let finish!: () => void;
  const writing = copyToClipboard(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  assert.deepEqual(events, []);
  finish();
  await writing;
  assert.deepEqual(events, ["notify", "close"]);

  events.length = 0;
  const originalError = console.error;
  console.error = () => {};
  try {
    await copyToClipboard(async () => {
      throw new Error("clipboard permission denied");
    });
    assert.deepEqual(events, ["alert"]);
    events.length = 0;
    notificationFails = true;
    await copyToClipboard(async () => {});
    assert.deepEqual(events, ["notify", "close"]);
  } finally {
    console.error = originalError;
  }
});
