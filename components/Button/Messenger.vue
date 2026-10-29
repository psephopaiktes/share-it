<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Messenger.label;
const run = () => {
  window.open(
    shareActions.Messenger.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Messenger ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/messenger.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
