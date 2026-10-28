<script lang="ts" setup>
// Label
const label = {
  ja: "HTML形式でリンクをコピー",
  en: "Copy link as HTML",
  "zh-cn": "复制HTML格式链接",
  es: "Copiar enlace como HTML",
};

// Action
import $store from "@/entrypoints/popup/store";
import { copyToClipboard } from "@/lib/clipboard";
import { createHtmlLink } from "@/lib/link";

const run = () =>
  copyToClipboard(() =>
    navigator.clipboard.writeText(
      createHtmlLink($store.tab?.title ?? "", $store.tab?.url ?? ""),
    ),
  );

// Image
const img = "/img/html.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
