import { createApp } from "vue";
import "@/style/index.css";
import VButton from "@/components/VButton.vue";
import i18n from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";
import App from "./App.vue";

document.documentElement.lang = resolveLocale(
  browser.i18n.getUILanguage(),
  i18n.locales,
  i18n.default_locale,
);
createApp(App).component("VButton", VButton).mount("#app");
