import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveLocale } from "../lib/locale";

test("regional languages use an existing base translation before English", () => {
  const translations = {
    en: "English",
    ja: "日本語",
    es: "Español",
    "zh-cn": "中文",
  };
  assert.equal(resolveLocale("ja-JP", translations, "en"), "ja");
  assert.equal(resolveLocale("es-MX", translations, "en"), "es");
  assert.equal(resolveLocale("zh_CN", translations, "en"), "zh-cn");
  assert.equal(resolveLocale("en-US", translations, "en"), "en");
  assert.equal(resolveLocale("fr-FR", translations, "en"), "en");
  assert.equal(resolveLocale("", translations, "en"), "en");
  assert.equal(resolveLocale("constructor", translations, "en"), "en");
});
