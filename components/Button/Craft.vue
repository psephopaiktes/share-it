<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Craft.label;
const run = () => {
  window.open(
    shareActions.Craft.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Craft ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/craft.svg";

// Tooltip
const tooltip = {
  ja: "Craftアプリに保存します。craft.do/downloadからアプリのダウンロードが必要です。",
  en: "Save with Craft app. Download the app from craft.do/download.",
  "zh-cn": "使用Craft应用程序保存。请从craft.do/download下载应用程序。",
  es: "Guardar con la aplicación Craft. Descargue la aplicación desde craft.do/download.",
};
</script>

<template>
  <VButton :label @click="run()" :img :tooltip />
</template>
