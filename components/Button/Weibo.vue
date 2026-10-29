<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Weibo.label;
const run = () => {
  window.open(
    shareActions.Weibo.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Weibo ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/weibo.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
