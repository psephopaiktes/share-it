<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.QR.label;
const run = () => {
  window.open(
    shareActions.QR.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.QR ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/qr.svg";

// Tooltip
const tooltip = {
  ja: "このサイトを開くQRコードを表示、保存できます",
  en: "You can show and save a QR code to open this site",
  "zh-cn": "您可以显示和保存一个QR码以打开此站点",
  es: "Puede mostrar y guardar un código QR para abrir este sitio",
};
</script>

<template>
	<VButton :label @click="run()" :img :tooltip />
</template>
