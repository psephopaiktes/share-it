<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Viber.label;
const run = () => {
  window.open(
    shareActions.Viber.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Viber ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/viber.svg";

// Tooltip
const tooltip = {
  ja: "Viberアプリで送信します。viber.comからアプリのダウンロードが必要です。",
  en: "Send with Viber app. Download the app from viber.com.",
  "zh-cn": "使用Viber应用程序发送。请从viber.com下载应用程序。",
  es: "Enviar con la aplicación Viber. Descargue la aplicación desde viber.com.",
};
</script>

<template>
	<VButton :label @click="run()" :img :tooltip />
</template>
