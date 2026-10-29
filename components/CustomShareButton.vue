<script lang="ts" setup>
import { ref } from "vue";
import $store from "@/entrypoints/popup/store";
import {
  type CustomButton,
  getTemplateVariables,
  readSharePageData,
  renderShareUrl,
  type SharePageData,
} from "@/lib/custom-buttons";
import i18n from "@/lib/i18n";

const props = defineProps<{ button: CustomButton }>();
const busy = ref(false);

async function run() {
  if (busy.value || $store.editing || !$store.tab) return;
  const tab = $store.tab;
  const template = props.button.urlTemplate;
  busy.value = true;
  try {
    let page: SharePageData = { url: tab.url ?? "", title: tab.title ?? "" };
    const variables = getTemplateVariables(template);
    if (
      tab.id !== undefined &&
      variables.some((variable) => !["url", "title"].includes(variable))
    ) {
      try {
        const [result] = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: readSharePageData,
          args: [
            variables
              .filter((variable) => variable.startsWith("meta:"))
              .map((variable) => variable.slice(5)),
          ],
        });
        if (result?.result) page = result.result;
      } catch {
        /* Restricted pages still support their tab URL and title. */
      }
    }
    await browser.tabs.create({ url: renderShareUrl(template, page) });
  } catch {
    window.alert(
      i18n.t({
        en: "Could not open this sharing link. Check the custom button settings and try again.",
        ja: "共有先を開けませんでした。カスタムボタンの設定を確認して、もう一度お試しください。",
        "zh-cn": "无法打开分享链接。请检查自定义按钮设置后重试。",
        es: "No se pudo abrir el enlace. Revisa el botón personalizado e inténtalo de nuevo.",
      }),
    );
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <VButton :label="{ en: button.name }" img="/img/link.svg" dark-logo :disabled="busy" @click="run" />
</template>
