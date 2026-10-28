<script lang="ts" setup>
// Label
const label = {
  ja: "Plurkに共有",
  en: "Share on Plurk",
  "zh-cn": "分享到Plurk",
  es: "Compartir en Plurk",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = () => {
  const params = new URLSearchParams({
    qualifier: "shares",
    status: $store.tab?.url || "",
  }).toString();

  window.open(`https://plurk.com/?${params}`);
};

// Image
const img = "/img/plurk.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
