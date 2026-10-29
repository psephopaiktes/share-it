<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Threads.label;
const run = () => {
  window.open(
    shareActions.Threads.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Threads ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/threads.svg";
</script>

<template>
	<VButton :label @click="run()" :img darkLogo />
</template>
