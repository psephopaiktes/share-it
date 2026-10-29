<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Instapaper.label;
const run = () => {
  window.open(
    shareActions.Instapaper.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Instapaper ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/instapaper.svg";
</script>

<template>
	<VButton :img :label @click="run()" darkLogo />
</template>
