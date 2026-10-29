<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.ArchiveToday.label;
const run = () => {
  window.open(
    shareActions.ArchiveToday.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.ArchiveToday ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/archivetoday.png";
</script>

<template>
  <VButton :label @click="run()" :img />
</template>
