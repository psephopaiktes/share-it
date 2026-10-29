<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.RaycastNote.label;
const run = () => {
  window.open(
    shareActions.RaycastNote.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.RaycastNote ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/raycast.svg";

// Tooltip
const tooltip = {
  ja: "Raycastアプリでノートを作成します。raycast.comからアプリのダウンロードが必要です。",
  en: "Create a note in Raycast app. Download the app from raycast.com.",
  "zh-cn": "在 Raycast 应用程序中创建笔记。请从 raycast.com 下载应用程序。",
  es: "Cree una nota en la aplicación Raycast. Descargue la aplicación desde raycast.com.",
};
</script>

<template>
	<VButton :label @click="run()" :img :tooltip />
</template>
