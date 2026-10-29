<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Hatebu.label;
const run = () => {
  window.open(
    shareActions.Hatebu.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Hatebu ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/hatebu.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
