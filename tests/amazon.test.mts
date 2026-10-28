import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Script } from "node:vm";
import ts from "typescript";
import * as vue from "vue";
import { compileScript, parse } from "vue/compiler-sfc";

// Run the component's actual setup with a controlled tab and window.open.
const filename = new URL(
  "../components/Button/AmazonShorter.vue",
  import.meta.url,
);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "amazon-test" });
const { outputText } = ts.transpileModule(compiled.content, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
  },
});

function createButton() {
  const store = vue.reactive<{ tab: { url: string } | null }>({ tab: null });
  const opened: string[] = [];
  const module = {
    exports: {} as {
      default: {
        setup: (
          props: object,
          context: { expose: () => void },
        ) => {
          productUrl: vue.ComputedRef<string | null>;
          run: () => void;
        };
      };
    },
  };
  new Script(outputText).runInNewContext({
    module,
    exports: module.exports,
    URL,
    window: { open: (url: string) => opened.push(url) },
    require: (name: string) => {
      if (name === "vue") return vue;
      if (name === "@/entrypoints/popup/store") return { default: store };
      throw new Error(`Unexpected component dependency: ${name}`);
    },
  });
  const button = module.exports.default.setup({}, { expose() {} });
  return { store, opened, ...button };
}

test("Amazon product URL follows tab data arriving after mount", () => {
  const button = createButton();
  assert.equal(button.productUrl.value, null);
  button.run();
  assert.deepEqual(button.opened, []);
  button.store.tab = {
    url: "https://www.amazon.co.jp/Some-Title/dp/B0BFJWCYTL?tag=example",
  };
  assert.equal(
    button.productUrl.value,
    "https://www.amazon.co.jp/dp/B0BFJWCYTL",
  );
  button.run();
  assert.deepEqual(button.opened, ["https://www.amazon.co.jp/dp/B0BFJWCYTL"]);
});

test("supported Amazon product path variants discard tracking parameters", () => {
  const button = createButton();
  for (const path of [
    "/dp/B0BFJWCYTL",
    "/gp/product/B0BFJWCYTL/",
    "/gp/aw/d/B0BFJWCYTL",
  ]) {
    button.store.tab = {
      url: `https://www.amazon.com${path}?tag=example#details`,
    };
    assert.equal(
      button.productUrl.value,
      "https://www.amazon.com/dp/B0BFJWCYTL",
    );
  }
});

test("Amazon button rejects lookalike domains, non-product pages and invalid URLs", () => {
  const button = createButton();
  for (const value of [
    "",
    "about:blank",
    "not a URL",
    "https://amazon.com.evil.test/dp/B0BFJWCYTL",
    "https://notamazon.com/dp/B0BFJWCYTL",
    "https://amazon.com/",
    "https://amazon.com/dp/short",
    "https://amazon.com/dp/B0BFJWCYTLextra",
    "ftp://amazon.com/dp/B0BFJWCYTL",
  ]) {
    button.store.tab = { url: value };
    assert.equal(button.productUrl.value, null, value);
    button.run();
    assert.deepEqual(button.opened, []);
  }
});
