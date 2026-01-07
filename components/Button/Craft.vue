<script lang="ts" setup>
// Label
const label = {
  ja: "Craftに保存",
  en: "Save to Craft",
  "zh-cn": "保存到Craft",
  es: "Guardar en Craft",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = async () => {
  const params = new URLSearchParams({
    title: `${$store.tab?.title}`,
    content: `${$store.tab?.url}`,
    folderId: "",
  }).toString();

  window.open(`craftdocs://createdocument?${params}`);
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
