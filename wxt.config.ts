import { defineConfig } from "wxt";

const manifest = {
  name: "__MSG_extName__",
  description: "__MSG_extDescription__",
  default_locale: "en",
  homepage_url: "https://github.com/psephopaiktes/share-it",
  permissions: [
    "storage",
    "tabs",
    "notifications",
    "activeTab",
    "scripting",
    "clipboardWrite",
  ],
  commands: {
    _execute_action: {
      suggested_key: {
        default: "Ctrl+Shift+S",
      },
    },
  },
  browser_specific_settings: {
    gecko: {
      id: "share-it@hira.page",
      strict_min_version: "109.0",
    },
  },
};

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue", "@wxt-dev/auto-icons"],
  webExt: {
    startUrls: [
      "https://www.amazon.com/Nintendo-SwitchTM-Neon-Blue-Joy%E2%80%91ConTM-Switch/dp/B0BFJWCYTL/?_encoding=UTF8&pd_rd_w=QxSJB&content-id=amzn1.sym.41f1b87d-2e7a-4fe4-bfcc-e038cab8f79e&pf_rd_p=41f1b87d-2e7a-4fe4-bfcc-e038cab8f79e&pf_rd_r=CEB3FD1Y9FX6A46QSD4K&pd_rd_wg=BI0HU&pd_rd_r=e9c42154-bcf6-46f6-9db7-7bcd405ef1ef&ref_=pd_hp_d_btf_crs_zg_bs_468642",
      "https://hira.page/blog/2024-best-buy/",
    ],
  },
  manifest,
});
