<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import i18n from "@/lib/i18n";
import { type ButtonSettings, textSetting } from "@/lib/settings";

const props = defineProps<{ buttonId: string; settings: ButtonSettings }>();
const values = reactive<Record<string, string>>({});
const initial = reactive<Record<string, string>>({});
const loaded = ref(false);
const saving = ref(false);
const error = ref("");
const saved = ref(false);
const conflict = ref(false);
const dirty = computed(() =>
  props.settings.fields.some((field) => values[field.id] !== initial[field.id]),
);
const items = props.settings.fields.map((field) => ({
  ...field,
  storage: textSetting(
    browser.storage.sync,
    props.buttonId,
    field.id,
    field.defaultValue,
  ),
}));
const errorMessage = i18n.t({
  en: "Could not load or save settings. Please try again.",
  ja: "設定を読み込み、または保存できませんでした。もう一度お試しください。",
  "zh-cn": "无法加载或保存设置，请重试。",
  es: "No se pudo cargar o guardar la configuración. Inténtalo de nuevo.",
});

async function load() {
  loaded.value = false;
  try {
    const entries = await Promise.all(
      items.map(async (item) => [item.id, await item.storage.get()] as const),
    );
    Object.assign(values, Object.fromEntries(entries));
    Object.assign(initial, values);
    loaded.value = true;
    error.value = "";
    conflict.value = false;
    saved.value = false;
  } catch {
    error.value = errorMessage;
  }
}

async function save() {
  if (!loaded.value || saving.value || conflict.value || !dirty.value) return;
  saving.value = true;
  saved.value = false;
  try {
    await browser.storage.sync.set(
      Object.fromEntries(
        items
          .filter((item) => values[item.id] !== initial[item.id])
          .map((item) => [item.storage.key, values[item.id] ?? ""]),
      ),
    );
    Object.assign(initial, values);
    error.value = "";
    saved.value = true;
  } catch {
    error.value = errorMessage;
  } finally {
    saving.value = false;
  }
}

async function reset(fieldId: string) {
  const item = items.find((item) => item.id === fieldId);
  if (!item || !loaded.value || saving.value || conflict.value) return;
  saving.value = true;
  saved.value = false;
  try {
    await item.storage.reset();
    values[item.id] = item.defaultValue ?? "";
    initial[item.id] = item.defaultValue ?? "";
    error.value = "";
    saved.value = true;
  } catch {
    error.value = errorMessage;
  } finally {
    saving.value = false;
  }
}

function onStorageChanged(changes: Record<string, unknown>, area: string) {
  if (
    area !== "sync" ||
    saving.value ||
    !items.some((item) => item.storage.key in changes)
  )
    return;
  if (dirty.value) conflict.value = true;
  else void load();
}

onMounted(() => {
  browser.storage.onChanged.addListener(onStorageChanged);
  void load();
});
onUnmounted(() => browser.storage.onChanged.removeListener(onStorageChanged));
</script>

<template>
  <section :aria-labelledby="`button-settings-${buttonId}`">
    <h2 :id="`button-settings-${buttonId}`" tabindex="-1">{{ i18n.t(settings.title) }}</h2>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="conflict" role="alert">{{ i18n.t({
      en: "Settings changed in another window. Reload before editing again.",
      ja: "別の画面で設定が変更されました。再読み込みしてから編集してください。",
      "zh-cn": "设置已在另一个窗口更改。请重新加载后再编辑。",
      es: "La configuración cambió en otra ventana. Recarga antes de editar de nuevo.",
    }) }}</p>
    <button v-if="!loaded || conflict" type="button" @click="load">{{ i18n.t({ en: "Reload", ja: "再読み込み", "zh-cn": "重新加载", es: "Recargar" }) }}</button>
    <form @submit.prevent="save">
      <fieldset :disabled="!loaded || saving || conflict" @input="saved = false">
        <div v-for="field in settings.fields" :key="field.id" class="field">
          <label :for="`setting-${buttonId}-${field.id}`">{{ i18n.t(field.label) }}</label>
          <div class="inputRow">
            <input :id="`setting-${buttonId}-${field.id}`" v-model="values[field.id]" type="text" />
            <button type="button" @click="reset(field.id)">{{ i18n.t({ en: "Reset", ja: "初期値に戻す", "zh-cn": "恢复默认值", es: "Restablecer" }) }}</button>
          </div>
        </div>
        <button type="submit" class="primary" :disabled="!dirty">{{ i18n.t({ en: "Save", ja: "保存", "zh-cn": "保存", es: "Guardar" }) }}</button>
      </fieldset>
    </form>
    <p v-if="saved" role="status">{{ i18n.t({ en: "Saved", ja: "保存しました", "zh-cn": "已保存", es: "Guardado" }) }}</p>
  </section>
</template>

<style scoped>
section { margin-block: 32px; }
h2 { margin-bottom: 24px; scroll-margin-top: 24px; }
fieldset { border: 0; min-inline-size: 0; }
.field { margin-block: 20px; }
label { display: block; margin-bottom: 8px; }
.inputRow { display: flex; flex-wrap: wrap; gap: 8px; }
input {
  flex: 1 1 240px;
  min-inline-size: 0;
  padding: 10px 12px;
  border: 1px solid rgb(var(--color-main) / .3);
  border-radius: 6px;
  background: rgb(var(--color-base));
  color: inherit;
  font: inherit;
}
button {
  padding: 10px 16px;
  border: 1px solid rgb(var(--color-main) / .2);
  border-radius: 6px;
  color: inherit;
  font: inherit;
}
.primary { background: rgb(var(--color-theme)); color: rgb(var(--color-base)); }
button:disabled { opacity: .5; cursor: default; }
</style>
