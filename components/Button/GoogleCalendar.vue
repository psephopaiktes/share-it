<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.GoogleCalendar.label;
const run = () => {
  window.open(
    shareActions.GoogleCalendar.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.GoogleCalendar ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/googlecalendar.svg";
</script>

<template>
	<VButton :img :label @click="run()" />
</template>
