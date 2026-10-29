<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from "vue";
import ButtonList from "@/components/ButtonList.vue";
import { defaultButtonList } from "@/components/defaultButtonList";
import i18n from "@/lib/i18n";
import { textSetting } from "@/lib/settings";
import $store from "./store";

const title = computed(() => $store.tab?.title ?? "");
const url = computed(() => $store.tab?.url ?? "");
const favIconUrl = computed(() => $store.tab?.favIconUrl ?? "");

let settingsRevision = 0;
const loadButtonTextSettings = async () => {
  const revision = ++settingsRevision;
  $store.textSettingsLoaded = false;
  try {
    const entries = await Promise.all(
      defaultButtonList.flatMap((button) =>
        (button.settings?.fields ?? []).map(async (field) => {
          const raw = await textSetting(
            browser.storage.sync,
            button.componentName,
            field.id,
            field.defaultValue,
          ).get();
          const value = field.normalize ? field.normalize(raw) : raw;
          return {
            buttonId: button.componentName,
            fieldId: field.id,
            value,
            error:
              value === null ? i18n.t(field.invalidMessage ?? field.label) : "",
          };
        }),
      ),
    );
    if (revision !== settingsRevision) return;
    const values: Record<string, Record<string, string>> = {};
    const errors: Record<string, string> = {};
    for (const entry of entries) {
      if (entry.value === null) {
        errors[entry.buttonId] = entry.error;
        continue;
      }
      const fields = values[entry.buttonId] ?? {};
      fields[entry.fieldId] = entry.value;
      values[entry.buttonId] = fields;
    }
    $store.buttonText = values;
    $store.textSettingsErrors = errors;
    $store.textSettingsError = "";
    $store.textSettingsLoaded = true;
  } catch {
    if (revision !== settingsRevision) return;
    $store.textSettingsError = i18n.t({
      en: "Could not load button settings. Check the settings or reopen the popup.",
      ja: "ボタンの設定を読み込めませんでした。設定を確認するか、Popupを開き直してください。",
      "zh-cn": "无法加载按钮设置。请检查设置或重新打开弹出窗口。",
      es: "No se pudieron cargar los ajustes. Revísalos o vuelve a abrir la ventana emergente.",
    });
  }
};

const handleTextSettingsChange = (
  changes: Record<string, unknown>,
  area: string,
) => {
  if (
    area === "sync" &&
    Object.keys(changes).some((key) => key.startsWith("button-text:"))
  ) {
    void loadButtonTextSettings();
  }
};

const getCurrentTab = async () => {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    $store.tab = tab ?? null;
  } catch (error) {
    console.error("Could not read the active tab:", error);
  }
};

const handleKeyNavigation = (event: KeyboardEvent) => {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  if (
    event.target instanceof HTMLElement &&
    (event.target.matches("input, textarea, select") ||
      event.target.isContentEditable)
  )
    return;

  const focusableButtons = Array.from(
    document.querySelectorAll(
      "button:not(:disabled), a[href], input:not(:disabled)",
    ),
  ).filter((el): el is HTMLElement => {
    const style = getComputedStyle(el);
    return el.getClientRects().length > 0 && style.visibility !== "hidden";
  });
  if (focusableButtons.length === 0) return;

  const activeElement = document.activeElement as HTMLElement | null;
  if (!activeElement || !focusableButtons.includes(activeElement)) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusableButtons[0]?.focus();
    }
    return;
  }

  const currentIndex = focusableButtons.indexOf(activeElement);
  if (currentIndex === -1) return;

  event.preventDefault();

  const nextIndex =
    event.key === "ArrowDown"
      ? (currentIndex + 1) % focusableButtons.length
      : (currentIndex - 1 + focusableButtons.length) % focusableButtons.length;

  focusableButtons[nextIndex]?.focus();
};

onMounted(() => {
  browser.storage.onChanged.addListener(handleTextSettingsChange);
  void loadButtonTextSettings();
  void getCurrentTab();
  document.addEventListener("keydown", handleKeyNavigation);
});

onUnmounted(() => {
  ++settingsRevision;
  browser.storage.onChanged.removeListener(handleTextSettingsChange);
  document.removeEventListener("keydown", handleKeyNavigation);
});
</script>

<template>
  <header v-if="favIconUrl || title || url">
    <img v-if="favIconUrl" :src="favIconUrl" alt="favicon">
    <h1 v-if="title && favIconUrl">{{ title }}</h1>
    <h1 v-else-if="title" class="solo">{{ title }}</h1>
    <p v-if="url">{{ url }}</p>
  </header>

  <ButtonList />
</template>

<style scoped>
header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgb(var(--color-main) / 0.1);

  img {
    vertical-align: top;
    width: 24px;
    height: 24px;
  }

  h1 {
    margin-top: -26px;
    line-height: 26px;
    text-indent: 28px;
    display: -webkit-box;
    overflow: hidden;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 18px;
    font-weight: 600;

    &.solo {
      margin-top: 4px;
      text-indent: 0;
    }
  }

  p {
    margin-top: 4px;
    color: rgb(var(--color-main) / 0.5);
    font-size: 12px;
    display: -webkit-box;
    overflow: hidden;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
