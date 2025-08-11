export interface ButtonConfig {
  componentName: string;
  enable: boolean;
}

export const defaultButtonList: ButtonConfig[] = [
  { componentName: "X", enable: true },
  { componentName: "Bluesky", enable: false },
  { componentName: "Threads", enable: false },
  { componentName: "Mastodon", enable: false },
  { componentName: "Facebook", enable: false },
  { componentName: "Instapaper", enable: false },
  { componentName: "Pinterest", enable: false },
  { componentName: "Blogger", enable: false },
  { componentName: "Gmail", enable: true },
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
  { componentName: "Email", enable: false },
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
];
