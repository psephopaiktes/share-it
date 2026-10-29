<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Wappalyzer.label;
const run = () => {
  window.open(
    shareActions.Wappalyzer.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Wappalyzer ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/wappalyzer.svg";

// Tooltip
const tooltip = {
  ja: "Wappalyzerでこのページを構築している技術スタックを分析します",
  en: "Analyze the technology stack that builds this page with Wappalyzer",
  "zh-cn": "使用 Wappalyzer 分析构建此页面的技术栈",
  es: "Analiza la pila de tecnología que construye esta página con Wappalyzer",
};
</script>

<template>
	<VButton :label @click="run()" :img :tooltip />
</template>
