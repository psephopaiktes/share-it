<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Perplexity.label;
const run = () => {
  window.open(
    shareActions.Perplexity.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Perplexity ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/perplexity.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
