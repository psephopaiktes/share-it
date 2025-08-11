<script lang="ts" setup>
// Label
const label = {
  ja: "OSの機能でシェア",
  en: "Share with OS Extensions",
  "zh-cn": "使用系统分享",
  es: "Compartir con extensiones del OS",
};

// Action
import { onMounted, ref } from "vue";
import $store from "@/entrypoints/popup/store";

const isSupported = ref(false);

onMounted(() => {
  if (!navigator.share) return;
  isSupported.value = true;
});

const run = async () => {
  if (!navigator.share) {
    alert("Error: This feature is not supported on your browser.");
    window.close();
    return;
  }

  const title = $store.tab?.title;
  const url = $store.tab?.url;

  try {
    await navigator.share({ title, url });
  } catch (e) {
    if (e instanceof Error) console.error(`Error: ${e.message}`);
  }
};

// Image
const img = "/img/other.svg";

// Tooltip
const tooltip = {
  ja: "OSのネイティブ共有機能を呼び出します。サポートされている場合のみ表示されます。",
  en: "Calls the OS's native share feature. Only shown if supported.",
  "zh-cn": "调用操作系统的原生共享功能。仅在支持时显示。",
  es: "Llama a la función de compartir nativa del SO. Solo se muestra si es compatible.",
};
</script>

<template>
	<VButton :label @click="run()" :img :tooltip :class="{ hide: !isSupported && !$store.editing }" />
</template>

<style scoped>
.hide {
	display: none;
}
</style>
