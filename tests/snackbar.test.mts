import assert from "node:assert/strict";
import { test } from "node:test";
import { effectScope } from "vue";
import {
  dismissSnackbar,
  snackbarMessages,
  useSnackbar,
} from "../lib/snackbar";

function caller() {
  const scope = effectScope();
  const feedback = scope.run(useSnackbar);
  assert.ok(feedback);
  return { ...feedback, dispose: () => scope.stop() };
}

test("retries replace a caller's notice and old timers cannot dismiss its replacement", () => {
  const first = caller();
  try {
    first.show("Save failed", { error: true });
    const previous = snackbarMessages.value[0];
    assert.ok(previous);
    first.show("Saved");
    dismissSnackbar(previous.id);
    assert.deepEqual(
      snackbarMessages.value.map((item) => item.message),
      ["Saved"],
    );
    assert.equal(snackbarMessages.value[0]?.error, undefined);
  } finally {
    first.dispose();
  }
});

test("the latest completion replaces earlier ones while unresolved errors take priority", () => {
  const first = caller();
  const second = caller();
  try {
    first.show("Saved");
    second.show("Reset");
    assert.deepEqual(
      snackbarMessages.value.map((item) => item.message),
      ["Reset"],
    );
    first.show("Reload required", { error: true });
    second.show("Saved");
    assert.deepEqual(
      snackbarMessages.value.map((item) => item.message),
      ["Reload required", "Saved"],
    );
    first.dismiss();
    assert.deepEqual(
      snackbarMessages.value.map((item) => item.message),
      ["Saved"],
    );
  } finally {
    first.dispose();
    second.dispose();
  }
});

test("retry actions can replace a persistent failure with a success notice", async () => {
  const first = caller();
  try {
    first.show("Save failed", {
      error: true,
      action: { label: "Retry", run: async () => first.show("Saved") },
    });
    await snackbarMessages.value[0]?.action?.run();
    assert.equal(snackbarMessages.value[0]?.message, "Saved");
    assert.equal(snackbarMessages.value.length, 1);
  } finally {
    first.dispose();
  }
});

test("disposing a caller removes its notices and ignores its late asynchronous results", () => {
  const first = caller();
  first.show("Loading failed", { error: true });
  first.dispose();
  first.show("Late failure", { error: true });
  assert.deepEqual(snackbarMessages.value, []);
});
