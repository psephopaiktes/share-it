<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.ChatGPT.label;
const run = () => {
  window.open(
    shareActions.ChatGPT.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.ChatGPT ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/chatgpt.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
