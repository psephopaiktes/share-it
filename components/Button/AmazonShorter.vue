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

const amazonDomain =
  /^(?:www\.|smile\.|m\.)?amazon\.(?:com|ca|com\.mx|com\.br|co\.uk|de|fr|it|es|nl|se|pl|com\.be|ie|co\.jp|in|com\.au|sg|ae|sa|com\.tr|eg|co\.za)$/;

function getAmazonProductUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!amazonDomain.test(url.hostname)) return null;
    const match = url.pathname.match(
      /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:\/|$)/i,
    );
    if (!match) return null;
    return `https://${url.hostname}/dp/${match[1]}`;
  } catch {
    return null;
  }
}

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
