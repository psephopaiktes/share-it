<script lang="ts" setup>
// Label
const label = {
  ja: "archive.todayに保存",
  en: "Save to archive.today",
  "zh-cn": "保存到archive.today",
  es: "Guardar en archive.today",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = () => {
  const url = $store.tab?.url || "";

  window.open(`https://archive.ph/${url}`);
};

// Image
const img = "/img/archivetoday.png";
</script>

<template>
  <VButton :label @click="run()" :img />
</template>
