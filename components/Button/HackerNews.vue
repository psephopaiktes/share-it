<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.HackerNews.label;
const run = () => {
  window.open(
    shareActions.HackerNews.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.HackerNews ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/hackernews.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
