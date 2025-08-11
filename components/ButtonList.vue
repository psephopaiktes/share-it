<script lang="ts" setup>
import { type Component, computed, onMounted, ref } from "vue";
import $store from "@/entrypoints/popup/store";
import i18n from "@/lib/i18n";
import { type ButtonConfig, defaultButtonList } from "./defaultButtonList";

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
const draggingIndex = ref<number>(0);

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

onMounted(async () => {
  try {
    const data = await browser.storage.sync.get("options");
    const userButtons: ButtonConfig[] = data.options?.buttons || [];

    // Add newly added buttons to the end
    const newButtons = defaultButtonList.filter(
      (defaultButton) =>
        !userButtons.some(
          (browserButton) =>
            browserButton.componentName === defaultButton.componentName,
        ),
    );

    // Exclude removed buttons
    buttons.value = [...userButtons, ...newButtons].filter((button) =>
      defaultButtonList.some(
        (defaultButton) => defaultButton.componentName === button.componentName,
      ),
    );
  } catch (e) {
    console.error("Failed to retrieve options from storage:", e);
    buttons.value = [...defaultButtonList];
  }
});

const dragstart = (index: number) => {
  draggingIndex.value = index;
};
const dragover = (e: DragEvent) => {
  e.preventDefault();
  (e.target as HTMLElement).style.borderTop =
    "4px solid rgb(var(--color-theme) / 0.2)";
};
const dragleave = (e: DragEvent) => {
  (e.target as HTMLElement).style.borderTop = "";
};
const ondrop = (index: number, e: DragEvent) => {
  (e.target as HTMLElement).style.borderTop = "";
  if (index === draggingIndex.value) return;

  const moveValue = { ...buttons.value[draggingIndex.value] };
  buttons.value.splice(draggingIndex.value, 1);

  if (draggingIndex.value < index) {
    buttons.value.splice(index - 1, 0, moveValue);
  } else {
    buttons.value.splice(index, 0, moveValue);
  }
};

const movetop = (index: number) => {
  const moveValue = { ...buttons.value[index] };
  buttons.value.splice(index, 1);
  buttons.value.unshift(moveValue);
};

const changeSwitch = (index: number, e: Event) => {
  const target = e.target as HTMLInputElement;
  buttons.value[index].enable = target.checked;
};

const save = () => {
  $store.editing = !$store.editing;
  browser.storage.sync.set({
    options: {
      buttons: [...buttons.value],
    },
  });
};
</script>

<template>
  <ul class="buttonList">
    <template v-for="(button, index) in filteredButtons" :key="button.componentName">
      <li :draggable="$store.editing" @dragstart="dragstart(index)" @dragover="dragover" @dragleave="dragleave"
        @drop="ondrop(index, $event)" :class="{ disable: !button.enable }"
        :title="$store.editing ? dragHint : undefined">

        <img v-if="$store.editing" class="handle" src="/img/drag.svg" alt="drag" />

        <button v-if="$store.editing" class="movetop" :title="moveTopHint" @click="movetop(index)">
          <img src="/img/movetop.svg" alt="move to top" />
        </button>

        <component :is="ButtonComponents[button.componentName]" :tabindex="index + 1" />

        <input v-if="$store.editing" type="checkbox" :checked="button.enable" :title="switchHint"
          @change="changeSwitch(index, $event)" />

      </li>
    </template>
  </ul>

  <a href="https://github.com/psephopaiktes/share-it/blob/main/CONTRIBUTING.md" id="request" target="_blank">
    {{ i18n.t({ en: "Request new button", ja: "ボタンのリクエスト", "zh-cn": "请求新按钮", es: "Solicitar nuevo botón" }) }}
    <img src="/img/send.svg" alt="icon" />
  </a>

  <footer>
    <button v-if="!$store.editing" @click="$store.editing = !$store.editing">
      <img src="/img/setting.svg" alt="icon" />
      {{ i18n.t({ en: "Manage Buttons", ja: "ボタン設定", "zh-cn": "管理按钮", es: "Administrar botones" }) }}
    </button>

    <button v-else @click="save()" class="complete">
      <img src="/img/complete.svg" alt="icon" />
      {{ i18n.t({ en: "Complete", ja: "完了", "zh-cn": "完成", es: "Completar" }) }}
    </button>
  </footer>
</template>

<style scoped>
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

#request {
  display: flex;
  gap: .8em;
  margin: 32px 16px 0;
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
