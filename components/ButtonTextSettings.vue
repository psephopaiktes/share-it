<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import i18n from "@/lib/i18n";
import {
  type ButtonSettings,
  type TextSettingField,
  textSetting,
} from "@/lib/settings";
import { useSnackbar } from "@/lib/snackbar";

const props = defineProps<{ buttonId: string; settings: ButtonSettings }>();
const values = reactive<Record<string, string>>({});
const initial = reactive<Record<string, string>>({});
const fieldErrors = reactive<Record<string, string>>({});
const loaded = ref(false);
const saving = ref(false);
const feedback = useSnackbar();
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
const conflictMessage = i18n.t({
  en: "Settings changed in another window. Reload before editing again.",
  ja: "別の画面で設定が変更されました。再読み込みしてから編集してください。",
  "zh-cn": "设置已在另一个窗口更改。请重新加载后再编辑。",
  es: "La configuración cambió en otra ventana. Recarga antes de editar de nuevo.",
});
const errorMessage = i18n.t({
  en: "Could not load or save settings. Please try again.",
  ja: "設定を読み込み、または保存できませんでした。もう一度お試しください。",
  "zh-cn": "无法加载或保存设置，请重试。",
  es: "No se pudo cargar o guardar la configuración. Inténtalo de nuevo.",
});

function showFailure(
  run: () => unknown,
  message = errorMessage,
  reload = false,
) {
  feedback.show(`${i18n.t(props.settings.title)}: ${message}`, {
    error: true,
    action: {
      label: i18n.t(
        reload
          ? {
              en: "Reload",
              ja: "再読み込み",
              "zh-cn": "重新加载",
              es: "Recargar",
            }
          : { en: "Retry", ja: "再試行", "zh-cn": "重试", es: "Reintentar" },
      ),
      run,
    },
  });
}

function validateField(field: TextSettingField) {
  const raw = values[field.id] ?? "";
  const value = field.normalize ? field.normalize(raw) : raw;
  fieldErrors[field.id] =
    value === null
      ? i18n.t(
          field.invalidMessage ?? {
            en: "Enter a valid value.",
            ja: "有効な値を入力してください。",
            "zh-cn": "请输入有效值。",
            es: "Introduce un valor válido.",
          },
        )
      : "";
  return value;
}

async function load() {
  loaded.value = false;
  try {
    const entries = await Promise.all(
      items.map(async (item) => [item.id, await item.storage.get()] as const),
    );
    Object.assign(values, Object.fromEntries(entries));
    Object.assign(initial, values);
    for (const field of items) fieldErrors[field.id] = "";
    loaded.value = true;
    feedback.dismiss();
    conflict.value = false;
  } catch {
    showFailure(load, errorMessage, true);
  }
}

async function save() {
  if (!loaded.value || saving.value || conflict.value || !dirty.value) return;
  const normalized: Record<string, string> = {};
  let invalidId: string | undefined;
  for (const field of items) {
    const value = validateField(field);
    if (value === null) invalidId ??= field.id;
    else normalized[field.id] = value;
  }
  if (invalidId) {
    await nextTick();
    document.getElementById(`setting-${props.buttonId}-${invalidId}`)?.focus();
    return;
  }
  saving.value = true;
  try {
    await browser.storage.sync.set(
      Object.fromEntries(
        items
          .filter((item) => normalized[item.id] !== initial[item.id])
          .map((item) => [item.storage.key, normalized[item.id] ?? ""]),
      ),
    );
    Object.assign(values, normalized);
    Object.assign(initial, values);
    feedback.show(
      `${i18n.t(props.settings.title)}: ${i18n.t({ en: "Saved", ja: "保存しました", "zh-cn": "已保存", es: "Guardado" })}`,
    );
  } catch {
    showFailure(save);
  } finally {
    saving.value = false;
  }
}

async function reset(fieldId: string) {
  const item = items.find((item) => item.id === fieldId);
  if (!item || !loaded.value || saving.value || conflict.value) return;
  saving.value = true;
  try {
    await item.storage.reset();
    values[item.id] = item.defaultValue ?? "";
    initial[item.id] = item.defaultValue ?? "";
    fieldErrors[item.id] = "";
    feedback.show(
      `${i18n.t(props.settings.title)}: ${i18n.t({ en: "Reset to default", ja: "初期値に戻しました", "zh-cn": "已恢复默认值", es: "Se restableció el valor predeterminado" })}`,
    );
  } catch {
    showFailure(() => reset(fieldId));
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
  if (dirty.value) {
    if (conflict.value) return;
    conflict.value = true;
    showFailure(load, conflictMessage, true);
  } else void load();
}

onMounted(() => {
  browser.storage.onChanged.addListener(onStorageChanged);
  void load();
});
onUnmounted(() => browser.storage.onChanged.removeListener(onStorageChanged));
</script>

<template>
  <section :aria-labelledby="`button-settings-${buttonId}`">
    <h2 :id="`button-settings-${buttonId}`" tabindex="-1">
      <img v-if="settings.icon" :src="settings.icon" alt="" width="24" height="24" />
      {{ i18n.t(settings.title) }}
    </h2>

    <button
      v-if="!loaded || conflict"
      class="reloadSettings"
      type="button"
      :title="conflict ? conflictMessage : undefined"
      @click="load"
    >
      {{ i18n.t({ en: "Reload", ja: "再読み込み", "zh-cn": "重新加载", es: "Recargar" }) }}
    </button>

    <form @submit.prevent="save">
      <fieldset :disabled="!loaded || saving || conflict">
        <div v-for="field in settings.fields" :key="field.id" class="field">
          <label :for="`setting-${buttonId}-${field.id}`">
            {{ i18n.t(field.label) }}
          </label>

          <div class="inputRow">
            <input
              :id="`setting-${buttonId}-${field.id}`"
              :name="field.id"
              v-model="values[field.id]"
              :type="field.type ?? 'text'"
              :aria-invalid="fieldErrors[field.id] ? true : undefined"
              :aria-describedby="[
                field.description ? `hint-${buttonId}-${field.id}` : '',
                fieldErrors[field.id] ? `error-${buttonId}-${field.id}` : '',
              ]
                .filter(Boolean)
                .join(' ') || undefined"
              @input="fieldErrors[field.id] = ''"
              @blur="validateField(field)"
            />

            <button
              type="button" @click="reset(field.id)"
              :title="i18n.t({ en: 'Reset', ja: '初期値に戻す', 'zh-cn': '恢复默认值', es: 'Restablecer' })" >
              <img src="/img/reset.svg" alt="icon" />
            </button>
          </div>

          <p v-if="field.description" :id="`hint-${buttonId}-${field.id}`" class="hint">
            {{ i18n.t(field.description) }}
          </p>

          <p
            v-if="fieldErrors[field.id]"
            :id="`error-${buttonId}-${field.id}`"
            class="fieldError"
            role="alert"
          >
            {{ fieldErrors[field.id] }}
          </p>
        </div>

        <button type="submit" class="primary" :disabled="!dirty">
          {{ i18n.t({ en: "Save", ja: "保存", "zh-cn": "保存", es: "Guardar" }) }}
        </button>
      </fieldset>
    </form>

  </section>
</template>

<style scoped>
section {
  margin-block: 32px 48px;
}

h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  scroll-margin-top: 24px;
}

h2 img {
  flex: none;
}

fieldset {
  border: 0;
  min-inline-size: 0;
}

.field {
  margin-block: 8px;
}

.hint {
  margin-top: 8px;
  color: rgb(var(--color-main) / 0.7);
}

.fieldError {
  margin-top: 8px;
  color: #b3261e;
}

@media (prefers-color-scheme: dark) {
  .fieldError {
    color: #ffb4ab;
  }
}

label {
  display: block;
  margin-bottom: 8px;
}

.inputRow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

input {
  flex: 1 1 240px;
  min-inline-size: 0;
  padding: 10px 12px;
  border: 1px solid rgb(var(--color-main) / 0.3);
  border-radius: 6px;
  background: rgb(var(--color-base));
  color: inherit;
  font: inherit;
}

button {
  padding: 8px;
  border: 1px solid rgb(var(--color-main) / 0.2);
  border-radius: 6px;
  color: inherit;
  font: inherit;
  img {
    margin: 0;
  }
  &.primary {
    padding: 8px 16px;
    background: rgb(var(--color-theme));
    color: rgb(var(--color-base));
  }
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
