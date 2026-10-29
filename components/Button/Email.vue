<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import { shareActions } from "@/lib/share-actions";

const label = shareActions.Email.label;
const run = () => {
  if (!$store.textSettingsLoaded || $store.textSettingsErrors.Email) return;
  window.open(
    shareActions.Email.url(
      { url: $store.tab?.url ?? "", title: $store.tab?.title ?? "" },
      $store.buttonText.Email ?? {},
      navigator.language,
    ),
    "_blank",
    "noopener,noreferrer",
  );
};

// Image
const img = "/img/email.svg";
</script>

<template>
	<VButton :label @click="run()" :img :disabled="!$store.textSettingsLoaded || Boolean($store.textSettingsErrors.Email)" :title="$store.textSettingsError || $store.textSettingsErrors.Email || undefined" />
</template>
