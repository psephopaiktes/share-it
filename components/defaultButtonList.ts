import {
  type ButtonSettings,
  normalizeEmailRecipient,
  normalizeMastodonInstance,
} from "../lib/settings";

const recipientField = {
  id: "recipient",
  type: "email" as const,
  defaultValue: "",
  normalize: normalizeEmailRecipient,
  label: {
    en: "Recipient",
    ja: "送信先",
    "zh-cn": "收件人",
    es: "Destinatario",
  },
  description: {
    en: "Leave blank to choose a recipient when composing the message.",
    ja: "空欄にすると、メール作成時に送信先を指定できます。",
    "zh-cn": "留空可在撰写邮件时指定收件人。",
    es: "Déjalo en blanco para elegir el destinatario al redactar el mensaje.",
  },
  invalidMessage: {
    en: "Enter one email address, or leave this field blank.",
    ja: "メールアドレスを1つ入力するか、空欄にしてください。",
    "zh-cn": "请输入一个电子邮件地址，或将此字段留空。",
    es: "Introduce una dirección de correo o deja este campo en blanco.",
  },
};

export interface ButtonConfig {
  componentName: string;
  enable: boolean;
  // Only buttons with actual configurable fields get a settings shortcut.
  settings?: ButtonSettings;
}

export const defaultButtonList: ButtonConfig[] = [
  { componentName: "X", enable: true },
  { componentName: "Bluesky", enable: false },
  { componentName: "Threads", enable: false },
  {
    componentName: "Mastodon",
    enable: false,
    settings: {
      icon: "/img/mastodon.svg",
      title: {
        en: "Mastodon",
        ja: "Mastodon",
        "zh-cn": "Mastodon",
        es: "Mastodon",
      },
      fields: [
        {
          id: "instance",
          defaultValue: "mstdn.jp",
          normalize: normalizeMastodonInstance,
          label: {
            en: "Instance",
            ja: "インスタンス",
            "zh-cn": "实例",
            es: "Instancia",
          },
          description: {
            en: "Enter a domain or HTTPS URL, such as mastodon.social. Leave blank to use mstdn.jp.",
            ja: "mastodon.social などのドメイン名、またはHTTPS URLを入力してください。空欄の場合は mstdn.jp を使います。",
            "zh-cn":
              "请输入域名或 HTTPS URL，例如 mastodon.social。留空则使用 mstdn.jp。",
            es: "Introduce un dominio o URL HTTPS, como mastodon.social. En blanco se usará mstdn.jp.",
          },
          invalidMessage: {
            en: "Enter an instance domain or HTTPS URL without a path, query or login information.",
            ja: "インスタンスのドメイン名、またはHTTPS URLを入力してください。パス・クエリ・ログイン情報は含められません。",
            "zh-cn": "请输入不含路径、查询或登录信息的实例域名或 HTTPS URL。",
            es: "Introduce un dominio de instancia o URL HTTPS sin ruta, consulta ni credenciales.",
          },
        },
      ],
    },
  },
  { componentName: "Facebook", enable: false },
  { componentName: "Instapaper", enable: false },
  { componentName: "Pinterest", enable: false },
  { componentName: "Blogger", enable: false },
  { componentName: "Craft", enable: true },
  {
    componentName: "Gmail",
    enable: true,
    settings: {
      icon: "/img/gmail.svg",
      title: { en: "Gmail", ja: "Gmail", "zh-cn": "Gmail", es: "Gmail" },
      fields: [recipientField],
    },
  },
  { componentName: "GoogleCalendar", enable: true },
  { componentName: "GoogleTranslate", enable: true },
  { componentName: "Outlook", enable: false },
  { componentName: "AmazonShorter", enable: true },
  { componentName: "Messenger", enable: false },

  // System
  { componentName: "CopyLinkAsRichText", enable: true },
  { componentName: "CopyTitle", enable: false },
  { componentName: "CopyTitleUrl", enable: true },
  { componentName: "CopyLinkAsHtml", enable: false },
  { componentName: "CopyLinkAsMd", enable: false },
  {
    componentName: "Email",
    enable: false,
    settings: {
      icon: "/img/email.svg",
      title: { en: "Email", ja: "メール", "zh-cn": "邮件", es: "Correo" },
      fields: [recipientField],
    },
  },
  { componentName: "Sms", enable: true },
  { componentName: "Print", enable: false },
  { componentName: "Other", enable: true },
  { componentName: "QR", enable: true },

  // LLM
  { componentName: "ChatGPT", enable: true },
  { componentName: "Claude", enable: false },
  // { componentName: "Gemini", enable: false },
  //     There is no Query URL for Gemini.
  //     https://github.com/psephopaiktes/share-it/issues/17
  { componentName: "Grok", enable: true },
  { componentName: "Copilot", enable: false },
  { componentName: "Perplexity", enable: true },

  // For Developers
  { componentName: "RaycastNote", enable: false },
  { componentName: "Reddit", enable: true },
  { componentName: "HackerNews", enable: false },
  { componentName: "PageSpeed", enable: true },
  { componentName: "WaybackMachine", enable: true },
  { componentName: "Wappalyzer", enable: false },
  { componentName: "Trello", enable: false },
  { componentName: "WordPress", enable: false },

  // Non major, Local
  { componentName: "Raindrop", enable: false },
  { componentName: "Buffer", enable: false },
  { componentName: "Snapchat", enable: false },
  { componentName: "Telegram", enable: false },
  { componentName: "LinkedIn", enable: false },
  { componentName: "Feedly", enable: false },
  { componentName: "Hatebu", enable: false },
  { componentName: "Note", enable: false },
  { componentName: "LINE", enable: false },
  { componentName: "Tumblr", enable: false },
  { componentName: "Digg", enable: false },
  { componentName: "Flipboard", enable: false },
  { componentName: "Plurk", enable: false },
  { componentName: "Refind", enable: false },
  { componentName: "VKontakte", enable: false },
  { componentName: "Weibo", enable: false },
  { componentName: "WhatsApp", enable: false },
  { componentName: "Viber", enable: false },
  { componentName: "ArchiveToday", enable: false },
];
