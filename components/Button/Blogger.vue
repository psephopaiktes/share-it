<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Blogger.label;
const run = () => {
  window.open(
    shareActions.Blogger.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Blogger ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/blogger.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
