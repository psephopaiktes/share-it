<script lang="ts" setup>
// Label
const label = {
  ja: "WordPressに投稿",
  en: "Post to WordPress",
  "zh-cn": "发布到WordPress",
  es: "Publicar en WordPress",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = () => {
  const params = new URLSearchParams({
    t: $store.tab?.title || "",
    u: $store.tab?.url || "",
  }).toString();

  window.open(`https://wordpress.com/wp-admin/press-this.php?${params}`);
};

// Image
const img = "/img/wordpress.svg";
</script>

<template>
	<VButton :img :label @click="run()" darkLogo />
</template>
