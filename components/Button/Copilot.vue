<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Copilot.label;
const run = () => {
  window.open(
    shareActions.Copilot.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Copilot ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/copilot.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
