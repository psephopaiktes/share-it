import assert from "node:assert/strict";
import { test } from "node:test";
import { getDefaultButtonList } from "../components/defaultButtonList";
import { saveToReadingList } from "../lib/reading-list";

const target = {
  url: "https://example.test/article?a=1&b=2",
  title: "An article 日本語",
};

function fixture() {
  const events: string[] = [];
  const entries: chrome.readingList.ReadingListEntry[] = [];
  const api = {
    permissions: {
      request: async () => {
        events.push("permission");
        return true;
      },
    },
    readingList: {
      query: async ({ url }: { url: string }) => {
        events.push("query");
        return entries.filter((entry) => entry.url === url);
      },
      addEntry: async (entry: chrome.readingList.AddEntryOptions) => {
        events.push("add");
        entries.push({ ...entry, creationTime: 1, lastUpdateTime: 1 });
      },
    },
  };
  Object.assign(globalThis, { browser: api });
  return { api, events, entries };
}

test("Reading List is registered only in Chrome builds, initially disabled", () => {
  assert.deepEqual(
    getDefaultButtonList("chrome").filter(
      (button) => button.componentName === "ReadingList",
    ),
    [{ componentName: "ReadingList", enable: false }],
  );
  for (const browser of ["firefox", "edge", "safari"])
    assert.equal(
      getDefaultButtonList(browser).some(
        (button) => button.componentName === "ReadingList",
      ),
      false,
    );
});

test("Reading List requests permission from the click before awaiting it and saves unread", async () => {
  const f = fixture();
  let allow!: (value: boolean) => void;
  f.api.permissions.request = () => {
    f.events.push("permission");
    return new Promise((resolve) => {
      allow = resolve;
    });
  };
  const saving = saveToReadingList(target);
  assert.deepEqual(f.events, ["permission"]);
  allow(true);
  assert.equal(await saving, "added");
  assert.deepEqual(f.events, ["permission", "query", "add"]);
  assert.deepEqual(f.entries[0], {
    ...target,
    hasBeenRead: false,
    creationTime: 1,
    lastUpdateTime: 1,
  });
});

test("Reading List denial and invalid URLs never write, and missing APIs report unsupported", async () => {
  const f = fixture();
  assert.equal(
    await saveToReadingList(target, Promise.resolve(false)),
    "denied",
  );
  assert.deepEqual(f.events, []);
  for (const url of [
    "javascript:alert(1)",
    "file:///tmp/a",
    "about:blank",
    "not a url",
  ])
    await assert.rejects(saveToReadingList({ ...target, url }));
  assert.deepEqual(f.events, []);
  Object.assign(globalThis, { browser: { permissions: f.api.permissions } });
  assert.equal(await saveToReadingList(target), "unsupported");
});

test("Reading List preserves existing read status and treats duplicate races as already saved", async () => {
  const f = fixture();
  const entry = {
    ...target,
    hasBeenRead: true,
    creationTime: 1,
    lastUpdateTime: 1,
  };
  f.entries.push(entry);
  assert.equal(await saveToReadingList(target), "exists");
  assert.equal(f.events.includes("add"), false);
  assert.deepEqual(f.entries[0], entry);
  f.entries.length = 0;
  f.api.readingList.addEntry = async () => {
    f.entries.push(entry);
    throw new Error("duplicate");
  };
  assert.equal(await saveToReadingList(target), "exists");
  assert.deepEqual(f.entries[0], entry);
});

test("Reading List propagates real storage failures so the user can retry", async () => {
  const f = fixture();
  f.api.readingList.addEntry = async () => {
    throw new Error("unavailable");
  };
  await assert.rejects(saveToReadingList(target), /unavailable/);
  assert.deepEqual(f.entries, []);
});
