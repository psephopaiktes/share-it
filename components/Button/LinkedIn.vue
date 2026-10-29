<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.LinkedIn.label;
const run = () => {
  window.open(
    shareActions.LinkedIn.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.LinkedIn ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/linkedin.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
