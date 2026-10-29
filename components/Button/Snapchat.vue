<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Snapchat.label;
const run = () => {
  window.open(
    shareActions.Snapchat.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Snapchat ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/snapchat.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
