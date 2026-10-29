<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Digg.label;
const run = () => {
  window.open(
    shareActions.Digg.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Digg ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/digg.svg";
</script>

<template>
	<VButton :img :label @click="run()" darkLogo />
</template>
