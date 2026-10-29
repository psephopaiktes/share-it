<script lang="ts" setup>
// Label
const label = {
  ja: "Mastodonに投稿",
  en: "Post to Mastodon",
  "zh-cn": "分享到Mastodon",
  es: "Publicar en Mastodon",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = () => {
  if (!$store.textSettingsLoaded || $store.textSettingsErrors.Mastodon) return;
  const instance = $store.buttonText.Mastodon?.instance;
  if (!instance) return;
  const params = new URLSearchParams({
    text: `${$store.tab?.title || ""} ${$store.tab?.url || ""}`,
  }).toString();

  window.open(
    `https://${instance}/share?${params}`,
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
