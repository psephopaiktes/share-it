<script lang="ts" setup>
// Label
const label = {
  ja: "PageSpeed Insights で分析",
  en: "Analyze with PageSpeed Insights",
  "zh-cn": "使用 PageSpeed Insights 分析",
  es: "Analizar con PageSpeed Insights",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = () => {
  const params = new URLSearchParams({ url: $store.tab?.url ?? "" });
  window.open(`https://pagespeed.web.dev/analysis?${params}`);
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
