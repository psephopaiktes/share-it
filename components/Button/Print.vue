<script lang="ts" setup>
// Label
const label = {
  ja: "印刷",
  en: "Print",
  "zh-cn": "打印",
  es: "Imprimir",
};

// Action
import $store from "@/entrypoints/popup/store";

const run = async () => {
  const tabId = $store.tab?.id;
  if (tabId == null) return;
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      func: () => {
        window.print();
      },
    });
  } catch (error) {
    console.error("Could not print this tab:", error);
  }
};

// Image
const img = "/img/print.svg";
</script>

<template>
	<VButton :label @click="run()" :img />
</template>
