import assert from "node:assert/strict";
import { test } from "node:test";
import { computed, ref } from "vue";
import { getAmazonProductUrl } from "../lib/amazon";

test("Amazon product URL follows tab data arriving after mount", () => {
  const tabUrl = ref("");
  const shortened = computed(() => getAmazonProductUrl(tabUrl.value));
  assert.equal(shortened.value, null);
  tabUrl.value =
    "https://www.amazon.co.jp/Some-Title/dp/B0BFJWCYTL?tag=example";
  assert.equal(shortened.value, "https://www.amazon.co.jp/dp/B0BFJWCYTL");
});

test("supported Amazon product path variants discard tracking parameters", () => {
  for (const path of [
    "/dp/B0BFJWCYTL",
    "/gp/product/B0BFJWCYTL/",
    "/gp/aw/d/B0BFJWCYTL",
  ]) {
    assert.equal(
      getAmazonProductUrl(`https://www.amazon.com${path}?tag=example#details`),
      "https://www.amazon.com/dp/B0BFJWCYTL",
    );
  }
});

test("Amazon button rejects lookalike domains, non-product pages and invalid URLs", () => {
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
    assert.equal(getAmazonProductUrl(value), null, value);
  }
});
