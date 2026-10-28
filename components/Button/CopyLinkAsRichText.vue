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
import { copyToClipboard } from "@/lib/clipboard";
import { createHtmlLink } from "@/lib/link";

const run = () =>
  copyToClipboard(async () => {
    const title = $store.tab?.title ?? "";
    const url = $store.tab?.url ?? "";
    const html = createHtmlLink(title, url);
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([[title, url].filter(Boolean).join(" ")], {
        type: "text/plain",
      }),
    });

    await navigator.clipboard.write([clipboardItem]);
  });

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
