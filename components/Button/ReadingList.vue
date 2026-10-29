<script lang="ts" setup>
import { ref } from "vue";
import $store from "@/entrypoints/popup/store";
import i18n from "@/lib/i18n";
import notify from "@/lib/notify";
import {
  readingListLabel,
  readingListMessages,
  saveToReadingList,
} from "@/lib/reading-list";

const busy = ref(false);
async function run() {
  if (busy.value || $store.editing || !$store.tab) return;
  busy.value = true;
  try {
    const result = await saveToReadingList({
      url: $store.tab.url ?? "",
      title: $store.tab.title ?? "",
    });
    if (result === "added" || result === "exists")
      await notify(readingListMessages[result]);
    else window.alert(i18n.t(readingListMessages[result]));
  } catch {
    window.alert(i18n.t(readingListMessages.failed));
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <VButton :label="readingListLabel" img="/img/readinglist.svg" dark-logo :disabled="busy" @click="run" />
</template>
