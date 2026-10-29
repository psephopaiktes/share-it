<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Facebook.label;
const run = () => {
  window.open(
    shareActions.Facebook.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Facebook ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/facebook.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
