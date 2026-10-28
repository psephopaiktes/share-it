<script lang="ts" setup>
// Label
const label = {
  ja: "Instapaperに保存",
  en: "Save to Instapaper",
  "zh-cn": "保存到Instapaper",
  es: "Guardar en Instapaper",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = () => {
  const params = new URLSearchParams({
    title: $store.tab?.title || "",
    url: $store.tab?.url || "",
  }).toString();

  window.open(`https://www.instapaper.com/edit?${params}`);
};

// Image
const img = "/img/instapaper.svg";
</script>

<template>
	<VButton :img :label @click="run()" darkLogo />
</template>
