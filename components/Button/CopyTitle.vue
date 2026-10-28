<script lang="ts" setup>
// Label
const label = {
  ja: "タイトルをコピー",
  en: "Copy title",
  "zh-cn": "复制标题",
  es: "Copiar título",
};

// Action
import $store from "@/entrypoints/popup/store";
import { copyToClipboard } from "@/lib/clipboard";

const run = () =>
  copyToClipboard(() => navigator.clipboard.writeText($store.tab?.title || ""));

// Image
const img = "/img/copy.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
