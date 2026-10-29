<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Tumblr.label;
const run = () => {
  window.open(
    shareActions.Tumblr.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Tumblr ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/tumblr.svg";
</script>

<template>
	<VButton :label @click="run()" :img darkLogo />
</template>
