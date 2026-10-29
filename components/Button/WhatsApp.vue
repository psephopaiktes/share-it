<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.WhatsApp.label;
const run = () => {
  window.open(
    shareActions.WhatsApp.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.WhatsApp ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/whatsapp.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
