import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeButtons } from "../lib/button-options";

const defaults = [
  { componentName: "X", enable: true },
  { componentName: "Mastodon", enable: false },
  { componentName: "NewButton", enable: true },
];

test("stored order and enabled state survive while new buttons are appended", () => {
  assert.deepEqual(
    normalizeButtons(
      [
        { componentName: "Mastodon", enable: true },
        { componentName: "X", enable: false },
        { componentName: "RemovedButton", enable: true },
      ],
      defaults,
    ),
    [
      { componentName: "Mastodon", enable: true },
      { componentName: "X", enable: false },
      { componentName: "NewButton", enable: true },
    ],
  );
});

test("malformed and duplicate Sync entries cannot break the button list", () => {
  assert.deepEqual(
    normalizeButtons(
      [
        null,
        1,
        "X",
        {},
        { componentName: "X", enable: "false" },
        { componentName: "X", enable: false },
        { componentName: "__proto__", enable: true },
      ],
      defaults,
    ),
    defaults,
  );
  for (const saved of [undefined, null, "broken", {}, 42]) {
    assert.deepEqual(normalizeButtons(saved, defaults), defaults);
  }
});

test("editing loaded defaults cannot mutate the original defaults", () => {
  const loaded = normalizeButtons(undefined, defaults);
  assert.ok(loaded[0]);
  assert.ok(defaults[0]);
  loaded[0].enable = false;
  assert.equal(defaults[0].enable, true);
});
