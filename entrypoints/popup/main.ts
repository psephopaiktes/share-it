import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import VButton from "@/components/VButton.vue";
import i18n from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";

document.documentElement.lang = resolveLocale(
  browser.i18n.getUILanguage(),
  i18n.locales,
  i18n.default_locale,
);

const app = createApp(App);

app.component("VButton", VButton);
app.mount("#app");
