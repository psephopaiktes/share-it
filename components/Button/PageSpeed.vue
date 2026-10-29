<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.PageSpeed.label;
const run = () => {
  window.open(
    shareActions.PageSpeed.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.PageSpeed ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/pagespeed.svg";

// Tooltip
const tooltip = {
  ja: "Google の PageSpeed Insights (Lighthouse) でこのページのパフォーマンスを分析します",
  en: "Analyze the performance of this page with Google's PageSpeed Insights (Lighthouse)",
  "zh-cn": "使用 Google 的 PageSpeed Insights (Lighthouse) 分析此页面的性能",
  es: "Analiza el rendimiento de esta página con PageSpeed Insights (Lighthouse) de Google",
};
</script>

<template>
	<VButton :label @click="run()" :img :tooltip />
</template>
