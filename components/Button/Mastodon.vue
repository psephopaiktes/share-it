<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Mastodon.label;
const run = () => {
  if (!$store.textSettingsLoaded || $store.textSettingsErrors.Mastodon) return;
  window.open(
    shareActions.Mastodon.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Mastodon ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/mastodon.svg";
</script>

<template>
	<VButton :label @click="run()" :img :disabled="!$store.textSettingsLoaded || Boolean($store.textSettingsErrors.Mastodon)" :title="$store.textSettingsError || $store.textSettingsErrors.Mastodon || undefined" />
</template>
