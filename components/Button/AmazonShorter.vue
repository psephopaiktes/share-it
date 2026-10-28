<script lang="ts" setup>
// Label
const label = {
  ja: "Amazonの短縮URLを開く",
  en: "Open shorten Amazon url",
  "zh-cn": "打开缩短的亚马逊网址",
  es: "Abrir URL de Amazon acortada",
};

// Action
import { computed } from "vue";
import $store from "@/entrypoints/popup/store";
import { getAmazonProductUrl } from "@/lib/amazon";

const productUrl = computed(() => getAmazonProductUrl($store.tab?.url ?? ""));

const run = () => {
  if (productUrl.value)
    window.open(productUrl.value, "_blank", "noopener,noreferrer");
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
	<VButton :label @click="run()" :img :tooltip :class="{ hide: !productUrl && !$store.editing }" />
</template>

<style scoped>
.hide {
	display: none;
}
</style>
