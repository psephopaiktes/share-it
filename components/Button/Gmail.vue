<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Gmail.label;
const run = () => {
  if (!$store.textSettingsLoaded || $store.textSettingsErrors.Gmail) return;
  window.open(
    shareActions.Gmail.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Gmail ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/gmail.svg";
</script>

<template>
	<VButton :label @click="run()" :img :disabled="!$store.textSettingsLoaded || Boolean($store.textSettingsErrors.Gmail)" :title="$store.textSettingsError || $store.textSettingsErrors.Gmail || undefined" />
</template>
