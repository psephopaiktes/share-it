<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Raindrop.label;
const run = () => {
  window.open(
    shareActions.Raindrop.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Raindrop ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/raindrop.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
