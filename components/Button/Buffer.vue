<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Buffer.label;
const run = () => {
  window.open(
    shareActions.Buffer.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Buffer ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/buffer.svg";
</script>

<template>
	<VButton :img :label @click="run()" darkLogo />
</template>
