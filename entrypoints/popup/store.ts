import { reactive } from "vue";

export interface Store {
  tab: chrome.tabs.Tab | null;
  editing: boolean;
  buttonText: Record<string, Record<string, string>>;
  textSettingsLoaded: boolean;
  textSettingsErrors: Record<string, string>;
  textSettingsError: string;
}

const $store: Store = reactive({
  tab: null,
  editing: false,
  buttonText: {},
  textSettingsLoaded: false,
  textSettingsErrors: {},
  textSettingsError: "",
});

export default $store;
