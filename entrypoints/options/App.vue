<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import ButtonList from "@/components/ButtonList.vue";
import ButtonTextSettings from "@/components/ButtonTextSettings.vue";
import { defaultButtonList } from "@/components/defaultButtonList";
import i18n from "@/lib/i18n";

const menu = [
  {
    id: "buttons",
    label: i18n.t({
      en: "Edit buttons",
      ja: "ボタン編集",
      "zh-cn": "编辑按钮",
      es: "Editar botones",
    }),
  },
  {
    id: "button-settings",
    label: i18n.t({
      en: "Button settings",
      ja: "ボタン詳細設定",
      "zh-cn": "按钮详细设置",
      es: "Ajustes de botones",
    }),
  },
  {
    id: "custom-buttons",
    label: i18n.t({
      en: "Custom buttons",
      ja: "カスタムボタン",
      "zh-cn": "自定义按钮",
      es: "Botones personalizados",
    }),
  },
];
const section = ref("buttons");
const heading = ref<HTMLHeadingElement>();
const drawer = ref<HTMLDialogElement>();
const title = computed(
  () => menu.find((item) => item.id === section.value)?.label,
);
const settingsButtons = defaultButtonList.flatMap((button) =>
  button.settings?.fields.length
    ? [{ componentName: button.componentName, settings: button.settings }]
    : [],
);
const menuLabel = i18n.t({
  en: "Menu",
  ja: "メニュー",
  "zh-cn": "菜单",
  es: "Menú",
});
const wideScreen = window.matchMedia("(min-width: 761px)");

function closeDrawer() {
  drawer.value?.close();
}
function handleWideScreen() {
  if (wideScreen.matches) closeDrawer();
}
function openButtonSettings(buttonId: string) {
  window.location.hash = `button-settings/${encodeURIComponent(buttonId)}`;
}

async function handleHash() {
  const [page, encodedId] = window.location.hash.slice(1).split("/");
  section.value = menu.find((item) => item.id === page)?.id ?? "buttons";
  document.title = `${title.value} — Share-it`;
  closeDrawer();
  await nextTick();
  let target: HTMLElement | null | undefined;
  if (section.value === "button-settings" && encodedId) {
    try {
      const id = decodeURIComponent(encodedId);
      if (settingsButtons.some((button) => button.componentName === id)) {
        target = document.getElementById(`button-settings-${id}`);
      }
    } catch {
      /* An invalid fragment falls back to the page heading. */
    }
  }
  (target ?? heading.value)?.focus();
  if (target) target.scrollIntoView({ block: "start" });
  else window.scrollTo(0, 0);
}

onMounted(() => {
  window.addEventListener("hashchange", handleHash);
  wideScreen.addEventListener("change", handleWideScreen);
  void handleHash();
});
onUnmounted(() => {
  window.removeEventListener("hashchange", handleHash);
  wideScreen.removeEventListener("change", handleWideScreen);
});
</script>

<template>
  <div class="optionsLayout">
    <aside class="sidebar">
      <p class="brand">Share-it</p>
      <nav :aria-label="menuLabel">
        <a v-for="item in menu" :key="item.id" :href="`#${item.id}`" :aria-current="section === item.id ? 'page' : undefined">{{ item.label }}</a>
      </nav>
    </aside>
    <main>
      <header>
        <button class="menuToggle" type="button" :title="menuLabel" :aria-label="menuLabel" @click="drawer?.showModal()">☰</button>
        <h1 ref="heading" tabindex="-1">{{ title }}</h1>
      </header>
      <ButtonList v-show="section === 'buttons'" standalone @settings="openButtonSettings" />
      <div v-show="section === 'button-settings'">
        <ButtonTextSettings v-for="button in settingsButtons" :key="button.componentName"
          :button-id="button.componentName" :settings="button.settings" />
      </div>
    </main>
    <dialog ref="drawer" :aria-label="menuLabel" @click="($event.target === drawer) && closeDrawer()">
      <div class="drawerContent">
        <div class="drawerHeader">
          <span class="brand">Share-it</span>
          <button type="button" :aria-label="i18n.t({ en: 'Close menu', ja: 'メニューを閉じる', 'zh-cn': '关闭菜单', es: 'Cerrar menú' })" @click="closeDrawer">×</button>
        </div>
        <nav :aria-label="menuLabel">
          <a v-for="item in menu" :key="item.id" :href="`#${item.id}`" :aria-current="section === item.id ? 'page' : undefined" @click="closeDrawer">{{ item.label }}</a>
        </nav>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.optionsLayout { display: grid; grid-template-columns: 248px minmax(0, 1fr); min-height: 100vh; }
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 28px 16px;
  border-right: 1px solid rgb(var(--color-main) / .1);
}
.brand { padding: 0 16px; font-size: 22px; font-weight: 600; }
nav { display: flex; flex-direction: column; gap: 4px; margin-top: 32px; }
nav a {
  padding: 12px 16px;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
}
nav a:hover { background: rgb(var(--color-main) / .06); }
nav a[aria-current] { background: rgb(var(--color-theme) / .12); color: rgb(var(--color-theme)); }
main { min-width: 0; padding: 32px; }
header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
h1 { font-size: 24px; font-weight: 600; }
h1:focus { outline: none; }
button { border: 0; border-radius: 6px; color: inherit; font: inherit; min-width: 40px; min-height: 40px; padding: 8px; }
.menuToggle { display: none; }
dialog {
  width: min(280px, 85vw);
  height: 100vh;
  height: 100dvh;
  max-height: none;
  padding: 0;
  border: 0;
  background: rgb(var(--color-base));
  color: inherit;
}
dialog::backdrop { background: rgb(0 0 0 / .4); }
.drawerContent { min-height: 100%; padding: 16px; }
.drawerHeader { display: flex; justify-content: space-between; align-items: center; }
@media (max-width: 760px) {
  .optionsLayout { grid-template-columns: minmax(0, 1fr); }
  .sidebar { display: none; }
  .menuToggle { display: block; }
  main { padding: 16px 8px; }
  header { padding-inline: 8px; }
}
</style>
