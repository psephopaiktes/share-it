<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.WaybackMachine.label;
const run = () => {
  window.open(
    shareActions.WaybackMachine.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.WaybackMachine ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/waybackmachine.svg";

// Tooltip
const tooltip = {
  ja: "Internet Archive の Wayback Machine でこのページの過去キャッシュを確認します",
  en: "Check this page's past cache in the Internet Archive's Wayback Machine",
  "zh-cn": "在互联网档案馆的Wayback Machine中查看此页面的过去缓存",
  es: "Ver la caché pasada de esta página en la Wayback Machine de Internet Archive",
};
</script>

<template>
  <VButton :label @click="run()" :img :tooltip darkLogo />
</template>
