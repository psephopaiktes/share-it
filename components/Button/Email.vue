<script lang="ts" setup>
// Label
const label = {
  ja: "メールで送信",
  en: "Send via Email",
  "zh-cn": "通过邮件发送",
  es: "Enviar por correo",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = () => {
  if (!$store.textSettingsLoaded || $store.textSettingsErrors.Email) return;
  const params = new URLSearchParams({
    subject: $store.tab?.title || "",
    body: $store.tab?.url || "",
  }).toString();

  const recipient = $store.buttonText.Email?.recipient || "";
  window.open(
    `mailto:${encodeURIComponent(recipient)}?${params}`,
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
