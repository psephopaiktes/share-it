<script lang="ts" setup>
// Label
const label = {
  ja: "Markdownでリンクをコピー",
  en: "Copy link as Markdown",
  "zh-cn": "复制Markdown格式链接",
  es: "Copiar enlace como Markdown",
};

// Action
import $store from "@/entrypoints/popup/store";
import { copyToClipboard } from "@/lib/clipboard";

const run = () =>
  copyToClipboard(() =>
    navigator.clipboard.writeText(
      `[${$store.tab?.title ?? ""}](${$store.tab?.url ?? ""})`,
    ),
  );

// Image
const img = "/img/md.svg";
</script>

<template>
	<VButton :label @click="run()" :img darkLogo />
</template>
