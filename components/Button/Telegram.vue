<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Telegram.label;
const run = () => {
  window.open(
    shareActions.Telegram.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Telegram ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/telegram.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
