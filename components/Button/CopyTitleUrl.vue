<script lang="ts" setup>
// Label
const label = {
  ja: "タイトルとURLをコピー",
  en: "Copy title & URL",
  "zh-cn": "复制标题和链接",
  es: "Copiar título y URL",
};

// Action
import $store from "@/entrypoints/popup/store";
import { copyToClipboard } from "@/lib/clipboard";

const run = () =>
  copyToClipboard(() =>
    navigator.clipboard.writeText(
      `${$store.tab?.title ?? ""} ${$store.tab?.url ?? ""}`,
    ),
  );

// Image
const img = "/img/copy.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
