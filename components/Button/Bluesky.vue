<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Bluesky.label;
const run = () => {
  window.open(
    shareActions.Bluesky.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Bluesky ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/bluesky.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
