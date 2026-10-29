<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Feedly.label;
const run = () => {
  window.open(
    shareActions.Feedly.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Feedly ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/feedly.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
