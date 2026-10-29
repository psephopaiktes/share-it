<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.WordPress.label;
const run = () => {
  window.open(
    shareActions.WordPress.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.WordPress ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/wordpress.svg";
</script>

<template>
	<VButton :img :label @click="run()" darkLogo />
</template>
