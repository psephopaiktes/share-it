<script lang="ts" setup>
// Label
const label = {
  ja: "Weiboで共有",
  en: "Share on Weibo",
  "zh-cn": "分享到微博",
  es: "Compartir en Weibo",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = () => {
  const params = new URLSearchParams({
    title: $store.tab?.title || "",
    url: $store.tab?.url || "",
  }).toString();

  window.open(`https://service.weibo.com/share/share.php?${params}`);
};

// Image
const img = "/img/weibo.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
