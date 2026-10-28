import assert from "node:assert/strict";
import { test } from "node:test";
import { createHtmlLink, escapeHtml } from "../lib/link";

test("HTML copies escape page-controlled titles and URL attributes", () => {
  const html = createHtmlLink(
    '<img src=x onerror="alert(1)"> & news',
    'https://example.com/?q="quoted"&page=1',
  );
  assert.equal(
    html,
    '<a href="https://example.com/?q=&quot;quoted&quot;&amp;page=1" target="_blank" rel="noopener noreferrer">&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; news</a>',
  );
  assert.equal(escapeHtml("'"), "&#039;");
});

test("executable, embedded-data and malformed links become plain text", () => {
  for (const url of [
    "javascript:alert(1)",
    "\tjava\nscript:alert(1)",
    "data:text/html,test",
    "vbscript:msgbox(1)",
    "",
    "not a URL",
  ]) {
    assert.equal(createHtmlLink("<title>", url), "&lt;title&gt;");
  }
});

test("regular links and title-less pages remain useful", () => {
  for (const url of [
    "https://example.com/",
    "http://localhost/",
    "file:///tmp/page.html",
    "ftp://example.com/file",
  ]) {
    assert.ok(createHtmlLink("", url).includes(`>${url}</a>`));
  }
});
