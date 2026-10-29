<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Plurk.label;
const run = () => {
  window.open(
    shareActions.Plurk.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Plurk ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/plurk.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
