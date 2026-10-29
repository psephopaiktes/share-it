<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Pinterest.label;
const run = () => {
  window.open(
    shareActions.Pinterest.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Pinterest ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/pinterest.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
