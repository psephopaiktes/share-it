<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.GoogleTranslate.label;
const run = () => {
  window.open(
    shareActions.GoogleTranslate.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.GoogleTranslate ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/googletranslate.svg";

// Tooltip
const tooltip = {
  ja: "翻訳されたURLを取得できます。ブラウザのシステム言語に翻訳されます。",
  en: "Get the translated URL. Translated to the browser's system language.",
  "zh-cn": "获取翻译后的URL。翻译为浏览器的系统语言。",
  es: "Obtenga la URL traducida. Traducido al idioma del sistema del navegador.",
};
</script>

<template>
	<VButton :label @click="run()" :img :tooltip />
</template>
