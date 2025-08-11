<script lang="ts" setup>
// Label
const label = {
  ja: "リッチテキストでリンクをコピー",
  en: "Copy link as Rich Text",
  "zh-cn": "复制富文本格式链接",
  es: "Copiar enlace como texto enriquecido",
};

// Action
import $store from "@/entrypoints/popup/store";
import notify from "@/lib/notifiy";

const run = async () => {
  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const url = escapeHtml($store.tab?.url ?? "");
  const title = escapeHtml($store.tab?.title ?? "");
  const str = `<a href="${url}">${title}</a>`;

  try {
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([str], { type: "text/html" }),
      "text/plain": new Blob([str], { type: "text/plain" }),
    });

    await navigator.clipboard.write([clipboardItem]);

    notify();
  } catch (e) {
    console.error("Copy Failed:", e);
  }
};

// Image
const img = "/img/richtext.svg";

// Tooltip
const tooltip = {
  ja: "リンクされたリッチテキストでコピーできます。メッセンジャーアプリやメールに貼り付ける際に便利です",
  en: "You can copy the link as rich text. It is useful when pasting into messenger apps or emails",
  "zh-cn": "您可以将链接复制为富文本。在粘贴到通讯应用或电子邮件时很有用",
  es: "Puede copiar el enlace como texto enriquecido. Es útil al pegarlo en aplicaciones de mensajería o correos electrónicos",
};
</script>

<template>
  <VButton :label @click="run()" :img :tooltip />
</template>
