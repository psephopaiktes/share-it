<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Flipboard.label;
const run = () => {
  window.open(
    shareActions.Flipboard.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Flipboard ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/flipboard.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
