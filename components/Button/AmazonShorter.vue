<script lang="ts" setup>
// Label
const label = {
  ja: "Amazonの短縮URLを開く",
  en: "Open shorten Amazon url",
  "zh-cn": "打开缩短的亚马逊网址",
  es: "Abrir URL de Amazon acortada",
};

// Action
import { onMounted, ref } from "vue";
import $store from "@/entrypoints/popup/store";

const url = ref("");
const domain = ref("");
const isAmazon = ref(false);

onMounted(() => {
  url.value = $store.tab?.url?.toString() || "";
  if (!url.value) return;

  domain.value = new URL(url.value).hostname;
  isAmazon.value = !!domain.value.match(/amazon/);
});

const run = () => {
  const ID = url.value
    .slice(url.value.search(/(\/product\/|\/dp\/)/))
    .split("/")[2]
    .slice(0, 10);

  window.open(`https://${domain.value}/dp/${ID}`);
};

// Image
const img = "/img/amazon.svg";

// Tooltip
const tooltip = {
  ja: "Amazonでのみ表示されます。商品ページで実行すると、短縮されたURLを開きます。",
  en: "Only shown on Amazon. When executed on a product page, it opens the shortened URL.",
  "zh-cn": "仅在亚马逊上显示。在商品页面上执行时，它会打开缩短的URL。",
  es: "Solo se muestra en Amazon. Cuando se ejecuta en una página de producto, abre la URL acortada.",
};
</script>

<template>
	<VButton :label @click="run()" :img :tooltip :class="{ hide: !isAmazon && !$store.editing }" />
</template>

<style scoped>
.hide {
	display: none;
}
</style>
