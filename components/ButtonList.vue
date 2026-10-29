<script lang="ts" setup>
import { type Component, computed, onMounted, onUnmounted, ref } from "vue";
import CustomShareButton from "@/components/CustomShareButton.vue";
import $store from "@/entrypoints/popup/store";
import { normalizeButtons } from "@/lib/button-options";
import {
  CUSTOM_BUTTON_PREFIX,
  type CustomButton,
  customButtonDefaults,
  loadCustomButtons,
} from "@/lib/custom-buttons";
import i18n from "@/lib/i18n";
import { loadButtons, saveButtons } from "@/lib/settings";
import { useSnackbar } from "@/lib/snackbar";
import { type ButtonConfig, defaultButtonList } from "./defaultButtonList";

const props = defineProps<{ standalone?: boolean }>();
const emit = defineEmits<{ settings: [buttonId: string] }>();
// Each extension page has its own store; the options editor stays in edit mode.
if (props.standalone) $store.editing = true;
const dirty = ref(false);
const conflict = ref(false);
const feedback = useSnackbar();
const configurableButtons = new Map(
  defaultButtonList.flatMap((button) =>
    button.settings?.fields.length
      ? [[button.componentName, button.settings] as const]
      : [],
  ),
);
const settingsHint = i18n.t({
  en: "Settings",
  ja: "設定",
  "zh-cn": "设置",
  es: "Configuración",
});
const conflictMessage = i18n.t({
  en: "Settings changed in another window. Reload before editing again.",
  ja: "別の画面で設定が変更されました。再読み込みしてから編集してください。",
  "zh-cn": "设置已在另一个窗口更改。请重新加载后再编辑。",
  es: "La configuración cambió en otra ventana. Recarga antes de editar de nuevo.",
});

const moveTopHint = i18n.t({
  en: "Move to top",
  ja: "最上部へ移動",
  "zh-cn": "移动到顶部",
  es: "Mover al principio",
});
const dragHint = i18n.t({
  en: "Drag to reorder",
  ja: "並び替えるにはドラッグしてください",
  "zh-cn": "拖动以重新排序",
  es: "Arrastra para reordenar",
});
const switchHint = i18n.t({
  ja: "有効/無効を切り替え",
  en: "Enable/Disable",
  "zh-cn": "启用/禁用",
  es: "Activar/Desactivar",
});

const buttons = ref<ButtonConfig[]>([]);
const customButtons = ref<CustomButton[]>([]);
const customButtonMap = computed(
  () =>
    new Map(
      customButtons.value.map((button) => [`custom:${button.id}`, button]),
    ),
);
function hasSettings(name: string) {
  return customButtonMap.value.has(name) || configurableButtons.has(name);
}
function settingsName(name: string) {
  return (
    customButtonMap.value.get(name)?.name ??
    i18n.t(configurableButtons.get(name)?.title ?? { en: name })
  );
}
const settingsLoaded = ref(false);
const saving = ref(false);
const settingsError = ref("");

const settingsErrorMessage = i18n.t({
  en: "Could not load or save settings. Please try again.",
  ja: "設定を読み込み、または保存できませんでした。もう一度お試しください。",
  "zh-cn": "无法加载或保存设置，请重试。",
  es: "No se pudo cargar o guardar la configuración. Inténtalo de nuevo.",
});
const draggingIndex = ref<number | null>(null);

function showFailure(
  run: () => unknown,
  message = settingsErrorMessage,
  reload = false,
) {
  settingsError.value = message;
  if (props.standalone)
    feedback.show(message, {
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

// import all .vue files in the component/Button
const modules = import.meta.glob("./Button/*.vue", { eager: true }) as Record<
  string,
  { default: Component }
>;
const ButtonComponents: Record<string, Component> = Object.fromEntries(
  Object.entries(modules).map(([path, module]) => {
    if (!module?.default) {
      throw new Error(`Failed to load component: ${path}`);
    }
    const match = path.match(/\.\/Button\/(.*)\.vue$/);
    if (!match) {
      throw new Error(`Invalid component path: ${path}`);
    }
    const name = match[1];
    return [name, module.default];
  }),
);

const filteredButtons = computed(() =>
  $store.editing
    ? buttons.value
    : buttons.value.filter((button) => button.enable),
);

let loadRevision = 0;
const loadSettings = async (preserveEdits = false) => {
  const revision = ++loadRevision;
  preserveEdits = preserveEdits && settingsLoaded.value;
  if (!preserveEdits) settingsLoaded.value = false;
  try {
    const nextCustom = await loadCustomButtons(browser.storage.sync);
    const defaults = [
      ...defaultButtonList,
      ...customButtonDefaults(nextCustom),
    ];
    const nextButtons = preserveEdits
      ? normalizeButtons(
          [
            ...customButtonDefaults(
              nextCustom.filter(
                (button) => !customButtonMap.value.has(`custom:${button.id}`),
              ),
            ),
            ...buttons.value,
          ],
          defaults,
        )
      : await loadButtons(browser.storage.sync, defaults);
    if (revision !== loadRevision) return;
    customButtons.value = nextCustom;
    buttons.value = nextButtons;
    if (!preserveEdits) {
      dirty.value = false;
      conflict.value = false;
    }
    settingsLoaded.value = true;
    settingsError.value = "";
    if (!conflict.value) feedback.dismiss();
  } catch (e) {
    if (revision !== loadRevision) return;
    console.error("Failed to retrieve options from storage:", e);
    settingsLoaded.value = false;
    showFailure(() => loadSettings());
  }
};

const onStorageChanged = (changes: Record<string, unknown>, area: string) => {
  if (area !== "sync") return;
  if (
    Object.keys(changes).some((key) => key.startsWith(CUSTOM_BUTTON_PREFIX))
  ) {
    void loadSettings(true);
    return;
  }
  if (!("options" in changes) || saving.value) return;
  if (dirty.value) {
    if (conflict.value) return;
    conflict.value = true;
    if (props.standalone)
      showFailure(() => loadSettings(), conflictMessage, true);
    else window.alert(conflictMessage);
  } else void loadSettings();
};
onMounted(() => {
  browser.storage.onChanged.addListener(onStorageChanged);
  void loadSettings();
});
onUnmounted(() => {
  ++loadRevision;
  browser.storage.onChanged.removeListener(onStorageChanged);
});

const dragstart = (index: number, event: DragEvent) => {
  if (!settingsLoaded.value || saving.value || conflict.value) return;
  draggingIndex.value = index;
  event.dataTransfer?.setData(
    "text/plain",
    buttons.value[index]?.componentName ?? "",
  );
};
const dragover = (e: DragEvent) => {
  e.preventDefault();
  (e.currentTarget as HTMLElement).style.borderTop =
    "4px solid rgb(var(--color-theme) / 0.2)";
};
const dragleave = (e: DragEvent) => {
  (e.currentTarget as HTMLElement).style.borderTop = "";
};
const ondrop = (index: number, e: DragEvent) => {
  e.preventDefault();
  (e.currentTarget as HTMLElement).style.borderTop = "";
  if (
    !settingsLoaded.value ||
    saving.value ||
    conflict.value ||
    draggingIndex.value === null ||
    index === draggingIndex.value
  )
    return;

  const draggedButton = buttons.value[draggingIndex.value];
  if (!draggedButton) return;
  dirty.value = true;
  const moveValue = { ...draggedButton };
  buttons.value.splice(draggingIndex.value, 1);

  if (draggingIndex.value < index) {
    buttons.value.splice(index - 1, 0, moveValue);
  } else {
    buttons.value.splice(index, 0, moveValue);
  }
  draggingIndex.value = null;
};

const movetop = (index: number) => {
  const button = buttons.value[index];
  if (!button) return;
  dirty.value = true;
  const moveValue = { ...button };
  buttons.value.splice(index, 1);
  buttons.value.unshift(moveValue);
};

const changeSwitch = (index: number, e: Event) => {
  const target = e.target as HTMLInputElement;
  const button = buttons.value[index];
  if (button) {
    button.enable = target.checked;
    dirty.value = true;
  }
};

const save = async () => {
  if (saving.value || !settingsLoaded.value || conflict.value) return false;
  saving.value = true;
  try {
    const latestCustom = await loadCustomButtons(browser.storage.sync);
    await saveButtons(browser.storage.sync, buttons.value, [
      ...defaultButtonList,
      ...customButtonDefaults(latestCustom),
    ]);
    dirty.value = false;
    settingsError.value = "";
    if (props.standalone)
      feedback.show(
        i18n.t({
          en: "Saved",
          ja: "保存しました",
          "zh-cn": "已保存",
          es: "Guardado",
        }),
      );
    if (!props.standalone) $store.editing = false;
    return true;
  } catch (error) {
    console.error("Could not save settings:", error);
    showFailure(() => save());
    return false;
  } finally {
    saving.value = false;
  }
};
const openSettings = async (buttonId: string) => {
  // Save pending list edits before the popup loses focus and closes.
  if (!(await save())) return;
  try {
    if (props.standalone) emit("settings", buttonId);
    else
      await browser.tabs.create({
        url: browser.runtime.getURL(
          `/options.html#${buttonId.startsWith("custom:") ? "custom-buttons" : "button-settings"}/${encodeURIComponent(buttonId.startsWith("custom:") ? buttonId.slice(7) : buttonId)}`,
        ),
      });
  } catch (error) {
    console.error("Could not open settings:", error);
    showFailure(() => openSettings(buttonId));
  }
};
</script>

<template>
  <div :class="{ standalone }">
    <p v-if="settingsError && !standalone" role="alert">{{ settingsError }}</p>
    <button v-if="!settingsLoaded && settingsError" @click="loadSettings()">
      {{ i18n.t({ en: "Retry", ja: "再試行", "zh-cn": "重试", es: "Reintentar" }) }}
    </button>
    <button v-if="conflict" class="reloadSettings" type="button" :title="conflictMessage" @click="loadSettings()">
      {{ i18n.t({ en: "Reload", ja: "再読み込み", "zh-cn": "重新加载", es: "Recargar" }) }}
    </button>
    <fieldset :disabled="saving || !settingsLoaded || conflict">
      <ul class="buttonList">
        <template v-for="(button, index) in filteredButtons" :key="button.componentName">
          <li :draggable="$store.editing && settingsLoaded && !saving && !conflict" @dragstart="dragstart(index, $event)" @dragend="draggingIndex = null" @dragover="dragover" @dragleave="dragleave"
            @drop="ondrop(index, $event)" :class="{ disable: !button.enable, configurable: hasSettings(button.componentName) }" :data-button="button.componentName"
            :title="$store.editing ? dragHint : undefined">

            <img v-if="$store.editing" class="handle" src="/img/drag.svg" alt="" />

            <button v-if="$store.editing" type="button" class="movetop" :title="moveTopHint" :aria-label="`${customButtonMap.get(button.componentName)?.name ?? button.componentName}: ${moveTopHint}`" @click="movetop(index)">
              <img src="/img/movetop.svg" alt="" />
            </button>

            <CustomShareButton v-if="customButtonMap.has(button.componentName)" :button="customButtonMap.get(button.componentName)!" :tabindex="$store.editing ? -1 : 0" />
            <component v-else :is="ButtonComponents[button.componentName]" :tabindex="$store.editing ? -1 : 0" />

            <button v-if="$store.editing && hasSettings(button.componentName)"
              type="button" class="settings" :title="settingsHint"
              :aria-label="`${settingsName(button.componentName)}: ${settingsHint}`"
              @click="openSettings(button.componentName)">
              <img src="/img/setting.svg" alt="" />
            </button>

            <input v-if="$store.editing" type="checkbox" :checked="button.enable" :title="switchHint" :aria-label="`${customButtonMap.get(button.componentName)?.name ?? button.componentName}: ${switchHint}`"
              @change="changeSwitch(index, $event)" />

          </li>
        </template>
      </ul>
    </fieldset>

    <a v-if="!standalone" href="https://github.com/psephopaiktes/share-it/issues/new/choose" id="request" class="popupLink" target="_blank" rel="noopener noreferrer">
      {{ i18n.t({ en: "Request new button", ja: "ボタンのリクエスト", "zh-cn": "请求新按钮", es: "Solicitar nuevo botón" }) }}
      <img src="/img/send.svg" alt="icon" />
    </a>

    <a v-if="!standalone" href="https://github.com/sponsors/psephopaiktes?frequency=one-time" id="sponsor" class="popupLink" target="_blank" rel="noopener noreferrer">
      {{ i18n.t({ en: "Support the developer", ja: "開発者を支援する", "zh-cn": "支持开发者", es: "Apoyar al desarrollador" }) }}
      <img src="/img/sponsor.svg" alt="" />
    </a>

    <footer>
      <button v-if="!$store.editing" :disabled="!settingsLoaded" @click="$store.editing = true">
        <img src="/img/setting.svg" alt="icon" />
        {{ i18n.t({ en: "Manage Buttons", ja: "ボタン設定", "zh-cn": "管理按钮", es: "Administrar botones" }) }}
      </button>

      <button v-else @click="save()" :disabled="saving || !settingsLoaded || conflict" class="complete">
        <img src="/img/complete.svg" alt="icon" />
        {{ i18n.t({ en: "Complete", ja: "完了", "zh-cn": "完成", es: "Completar" }) }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
fieldset { border: 0; min-width: 0; }
.standalone {
  padding-bottom: calc(128px + env(safe-area-inset-bottom, 0px));
}
.standalone footer {
  position: fixed;
  left: auto;
  right: 32px;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  width: auto;
  max-width: calc(100vw - 32px);
  border: 0;
  border-radius: 999px;
  background: none;
  box-shadow: 0 8px 24px rgb(0 0 0 / .2), 0 2px 6px rgb(0 0 0 / .15);
  z-index: 10;

  button {
    width: auto;
    min-width: 144px;
    height: 52px;
    padding: 0 28px;
    border-radius: inherit;
    text-indent: 0;
  }

  button.complete {
    background: rgb(var(--color-theme));
  }
}
@media (max-width: 760px) {
  .standalone footer {
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
}
.settings {
  position: absolute;
  top: 8px;
  right: 56px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  img { width: 20px; height: 20px; margin: 2px; }
}
.buttonList :deep(button.hasTooltip) + .settings { right: 88px; }
.configurable :deep(button.edit.hasTooltip) { padding-right: 192px; }
@media (prefers-color-scheme: dark) {
  .settings img { filter: brightness(1.8); }
}

.buttonList {
  margin-top: 8px;
  list-style: none;

  li {
    position: relative;
    cursor: grab;
    background: rgb(var(--color-base));
    margin-top: 4px;

    &.disable :deep(.icon),
    &.disable :deep(.label) {
      opacity: .4;
    }
  }

  .handle {
    position: absolute;
    top: 8px;
    left: 16px;
    width: 24px;
    aspect-ratio: 1;
    opacity: .2;
    pointer-events: none;
  }

  .movetop {
    position: absolute;
    top: 8px;
    left: 44px;
    width: 24px;
    padding: 0;
    border: none;
    opacity: .8;
    border-radius: 50%;

    &:hover {
      opacity: 1;
    }

    img {
      width: 24px;
      aspect-ratio: 1;
    }
  }

  input {
    appearance: none;
    position: absolute;
    right: 24px;
    bottom: 14px;
    width: 28px;
    height: 12px;
    background: rgb(var(--color-main) / .2);
    border-radius: 10px;
    cursor: pointer;
    outline: none;

    &:focus {
      box-shadow: 0 0 0 6px rgb(var(--color-main) / .1);
    }

    &::before {
      content: "";
      display: block;
      position: relative;
      top: -2px;
      left: -2px;
      width: 16px;
      aspect-ratio: 1;
      border-radius: 8px;
      background: rgb(var(--color-base));
      border: 1px solid rgb(var(--color-main) / .05);

      box-shadow: 0 1px 3px rgb(0 0 0 / .2);
      transition: .2s ease-out;
    }

    &:checked {
      background: rgb(var(--color-theme) / .6);

      &::before {
        background: rgb(var(--color-theme));
        left: 14px;
      }
    }
  }
}

.popupLink {
  display: flex;
  gap: .8em;
  margin: 8px 16px 0;
  justify-content: center;
  line-height: 32px;
  background: rgb(var(--color-theme) / .9);
  color: #fff;
  text-decoration: none;
  border-radius: 6px;

  &:hover,
  &:focus {
    background: rgb(var(--color-theme));
  }

  img {
    opacity: .8;
    width: 1.2em;
    aspect-ratio: 1;
  }
}

#request {
  margin-top: 32px;
}

footer {
  position: fixed;
  width: 100vw;
  left: 0;
  bottom: 0;
  background: rgb(var(--color-base));
  border-top: 1px solid rgb(var(--color-main) / 10%);

  button {
    width: 100%;
    height: 48px;
    border: none;
    color: rgb(var(--color-main) / .6);
    text-indent: -.5em;
    transition: .1s ease-out;

    &.complete {
      background: rgb(var(--color-theme) / .9);
      color: #fff;

      &:hover {
        background: rgb(var(--color-theme));
      }
    }
  }
}
</style>
