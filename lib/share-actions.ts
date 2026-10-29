import type { SharePageData } from "./custom-buttons";

export interface ShareAction {
  label: Record<string, string>;
  url: (
    target: SharePageData,
    settings: Record<string, string>,
    language: string,
  ) => string;
}

function shareText(target: SharePageData) {
  const text = target.selection || target.title;
  return text === target.url ? "" : text;
}

function postText(target: SharePageData) {
  const text = target.selection || target.title;
  return text === target.url ? target.url : `${text} ${target.url}`;
}

function shareBody(target: SharePageData) {
  return target.selection ? `${target.selection}\n\n${target.url}` : target.url;
}

// URL actions are shared by the popup and the native context menu.
export const shareActions = {
  ArchiveToday: {
    label: {
      ja: "archive.todayに保存",
      en: "Save to archive.today",
      "zh-cn": "保存到archive.today",
      es: "Guardar en archive.today",
    },
    url: (target, _settings, _language) => {
      const url = target.url;

      return `https://archive.ph/${url}`;
    },
  },
  Blogger: {
    label: {
      ja: "Bloggerに投稿",
      en: "Post to Blogger",
      "zh-cn": "分享到Blogger",
      es: "Publicar en Blogger",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        n: target.title,
        u: target.url,
      }).toString();

      return `https://www.blogger.com/blog-this.g?${params}`;
    },
  },
  Bluesky: {
    label: {
      ja: "Blueskyに投稿",
      en: "Post to Bluesky",
      "zh-cn": "分享到Bluesky",
      es: "Publicar en Bluesky",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: postText(target),
      }).toString();

      return `https://bsky.app/intent/compose?${params}`;
    },
  },
  Buffer: {
    label: {
      ja: "Bufferに投稿",
      en: "Post to Buffer",
      "zh-cn": "分享到Buffer",
      es: "Compartir en Buffer",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        url: target.url,
        text: shareText(target),
      }).toString();

      return `https://buffer.com/add?${params}`;
    },
  },
  ChatGPT: {
    label: {
      ja: "ChatGPTにページを送信",
      en: "Send page to ChatGPT",
      "zh-cn": "将页面发送到ChatGPT",
      es: "Enviar página a ChatGPT",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        q: postText(target),
      }).toString();

      return `https://chatgpt.com/?${params}`;
    },
  },
  Claude: {
    label: {
      ja: "Claudeにページを送信",
      en: "Send page to Claude",
      "zh-cn": "将页面发送到Claude",
      es: "Enviar página a Claude",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        q: postText(target),
      }).toString();

      return `https://claude.ai/new?${params}`;
    },
  },
  Copilot: {
    label: {
      ja: "Microsoft Copilotにページを送信",
      en: "Send page to Microsoft Copilot",
      "zh-cn": "将页面发送到Microsoft Copilot",
      es: "Enviar página a Microsoft Copilot",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        showconv: "1",
        sendquery: "0",
        q: postText(target),
      }).toString();

      return `https://bing.com/search?${params}`;
    },
  },
  Craft: {
    label: {
      ja: "Craftに保存",
      en: "Save to Craft",
      "zh-cn": "保存到Craft",
      es: "Guardar en Craft",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        title: `${target.title}`,
        content: shareBody(target),
        folderId: "",
      }).toString();

      return `craftdocs://createdocument?${params}`;
    },
  },
  Digg: {
    label: {
      ja: "Diggに共有",
      en: "Share on Digg",
      "zh-cn": "分享到Digg",
      es: "Compartir en Digg",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        url: target.url,
      }).toString();

      return `https://digg.com/submit?${params}`;
    },
  },
  Email: {
    label: {
      ja: "メールで送信",
      en: "Send via Email",
      "zh-cn": "通过邮件发送",
      es: "Enviar por correo",
    },
    url: (target, settings, _language) => {
      const params = new URLSearchParams({
        subject: target.title,
        body: shareBody(target),
      }).toString();

      const recipient = settings.recipient || "";
      return `mailto:${encodeURIComponent(recipient)}?${params}`;
    },
  },
  Facebook: {
    label: {
      ja: "Facebookに投稿",
      en: "Share on Facebook",
      "zh-cn": "分享到Facebook",
      es: "Compartir en Facebook",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        u: target.url,
      }).toString();

      return `https://www.facebook.com/sharer/sharer.php?${params}`;
    },
  },
  Feedly: {
    label: {
      ja: "FeedlyでRSSを探す",
      en: "Search RSS on Feedly",
      "zh-cn": "在Feedly中搜索RSS",
      es: "Buscar RSS en Feedly",
    },
    url: (target, _settings, _language) => {
      return `https://feedly.com/i/discover/sources/search/feed/${target.url}`;
    },
  },
  Flipboard: {
    label: {
      ja: "Flipboardに共有",
      en: "Share on Flipboard",
      "zh-cn": "分享到Flipboard",
      es: "Compartir en Flipboard",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        title: target.title,
        url: target.url,
      }).toString();

      return `https://share.flipboard.com/bookmarklet/popout?${params}`;
    },
  },
  Gmail: {
    label: {
      ja: "Gmailで送信",
      en: "Send via Gmail",
      "zh-cn": "通过Gmail发送",
      es: "Enviar por Gmail",
    },
    url: (target, settings, _language) => {
      const params = new URLSearchParams({
        su: target.title,
        body: shareBody(target),
        fs: "1",
        tf: "1",
        view: "cm",
      });
      const recipient = settings.recipient;
      if (recipient) params.set("to", recipient);

      return `https://gmail.google.com/gmail?${params}`;
    },
  },
  GoogleCalendar: {
    label: {
      ja: "Googleカレンダーに追加",
      en: "Add to Google Calendar",
      "zh-cn": "添加到Google日历",
      es: "Añadir a Google Calendar",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: target.title,
        details: shareBody(target),
      }).toString();

      return `https://calendar.google.com/calendar/r/eventedit?${params}`;
    },
  },
  GoogleTranslate: {
    label: {
      ja: "Google翻訳で開く",
      en: "Open with Google Translate",
      "zh-cn": "使用Google翻译打开",
      es: "Abrir con Google Translate",
    },
    url: (target, _settings, language) => {
      const userLang = new Intl.Locale(language).language || "en";

      if (target.selection) {
        return `https://translate.google.com/?${new URLSearchParams({ sl: "auto", tl: userLang, text: target.selection, op: "translate" })}`;
      }

      const params = new URLSearchParams({
        sl: "auto",
        hl: userLang,
        u: target.url,
      }).toString();

      return `https://translate.google.com/translate?${params}`;
    },
  },
  Grok: {
    label: {
      ja: "Grokにページを送信",
      en: "Send page to Grok",
      "zh-cn": "将页面发送到Grok",
      es: "Enviar página a Grok",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: postText(target),
      }).toString();

      return `https://x.com/i/grok?${params}`;
    },
  },
  HackerNews: {
    label: {
      ja: "Hacker Newsに投稿",
      en: "Post to Hacker News",
      "zh-cn": "分享到Hacker News",
      es: "Compartir en Hacker News",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        t: target.title,
        u: target.url,
      }).toString();

      return `https://news.ycombinator.com/submitlink?${params}`;
    },
  },
  Hatebu: {
    label: {
      ja: "はてなブックマーク",
      en: "Hatena Bookmark",
      "zh-cn": "分享到Hatena",
      es: "Guardar en Hatena",
    },
    url: (target, _settings, _language) => {
      return `https://b.hatena.ne.jp/entry/${target.url}`;
    },
  },
  Instapaper: {
    label: {
      ja: "Instapaperに保存",
      en: "Save to Instapaper",
      "zh-cn": "保存到Instapaper",
      es: "Guardar en Instapaper",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        title: target.title,
        url: target.url,
      }).toString();

      return `https://www.instapaper.com/edit?${params}`;
    },
  },
  LINE: {
    label: {
      ja: "LINEで送る",
      en: "Share on LINE",
      "zh-cn": "分享到LINE",
      es: "Compartir en LINE",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: shareText(target),
        url: target.url,
      }).toString();

      return `https://social-plugins.line.me/lineit/share?${params}`;
    },
  },
  LinkedIn: {
    label: {
      ja: "LinkedInに投稿",
      en: "Share on LinkedIn",
      "zh-cn": "分享到LinkedIn",
      es: "Compartir en LinkedIn",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        shareActive: "true",
        text: postText(target),
      }).toString();

      return `https://linkedin.com/feed/?${params}`;
    },
  },
  Mastodon: {
    label: {
      ja: "Mastodonに投稿",
      en: "Post to Mastodon",
      "zh-cn": "分享到Mastodon",
      es: "Publicar en Mastodon",
    },
    url: (target, settings, _language) => {
      const instance = settings.instance || "mstdn.jp";
      const params = new URLSearchParams({
        text: postText(target),
      }).toString();

      return `https://${instance}/share?${params}`;
    },
  },
  Messenger: {
    label: {
      ja: "Messengerで送信",
      en: "Send with Messenger",
      "zh-cn": "使用Messenger发送",
      es: "Enviar con Messenger",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        app_id: "1140274417695873",
        link: target.url,
        redirect_uri: "https://messenger.com/",
      }).toString();

      return `https://www.facebook.com/dialog/send?${params}`;
    },
  },
  Note: {
    label: {
      ja: "noteに投稿",
      en: "Post to note",
      "zh-cn": "发布到note",
      es: "Publicar en note",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        url: target.url,
      }).toString();

      return `https://note.com/intent/post?${params}`;
    },
  },
  Outlook: {
    label: {
      ja: "Outlookで送信",
      en: "Send via Outlook",
      "zh-cn": "通过Outlook发送",
      es: "Enviar por Outlook",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        subject: target.title,
        body: shareBody(target),
      }).toString();

      return `https://outlook.live.com/mail/deeplink/compose?${params}`;
    },
  },
  PageSpeed: {
    label: {
      ja: "PageSpeed Insights で分析",
      en: "Analyze with PageSpeed Insights",
      "zh-cn": "使用 PageSpeed Insights 分析",
      es: "Analizar con PageSpeed Insights",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({ url: target.url });
      return `https://pagespeed.web.dev/analysis?${params}`;
    },
  },
  Perplexity: {
    label: {
      ja: "Perplexityにページを送信",
      en: "Send page to Perplexity",
      "zh-cn": "将页面发送到Perplexity",
      es: "Enviar página a Perplexity",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        q: `${target.title} ${target.url}`,
      }).toString();

      return `https://perplexity.ai/search/new?${params}`;
    },
  },
  Pinterest: {
    label: {
      ja: "Pinterestに保存",
      en: "Save to Pinterest",
      "zh-cn": "保存到Pinterest",
      es: "Guardar en Pinterest",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        description: shareText(target),
        url: target.url,
      }).toString();

      return `https://pinterest.com/pin/create/button/?${params}`;
    },
  },
  Plurk: {
    label: {
      ja: "Plurkに共有",
      en: "Share on Plurk",
      "zh-cn": "分享到Plurk",
      es: "Compartir en Plurk",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        qualifier: "shares",
        status: target.selection
          ? `${target.selection} ${target.url}`
          : target.url,
      }).toString();

      return `https://plurk.com/?${params}`;
    },
  },
  QR: {
    label: {
      ja: "QRコードを表示",
      en: "Show QR code",
      "zh-cn": "显示QR码",
      es: "Mostrar código QR",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        data: target.url,
        format: "svg",
      }).toString();

      return `https://api.qrserver.com/v1/create-qr-code/?${params}`;
    },
  },
  Raindrop: {
    label: {
      ja: "Raindrop.io に保存",
      en: "Save to Raindrop.io",
      "zh-cn": "保存到 Raindrop.io",
      es: "Guardar en Raindrop.io",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        title: target.title,
        link: target.url,
      }).toString();

      return `https://app.raindrop.io/add?${params}`;
    },
  },
  RaycastNote: {
    label: {
      ja: "Raycast Notes に保存",
      en: "Save to Raycast Notes",
      "zh-cn": "保存到 Raycast Notes",
      es: "Guardar en Raycast Notes",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        fallbackText: `${target.selection ? `${target.selection}\n\n` : ""}[${target.title}](${target.url})`,
      }).toString();

      return `raycast://extensions/raycast/raycast-notes/create-note?${params}`;
    },
  },
  Reddit: {
    label: {
      ja: "Redditに投稿",
      en: "Submit to Reddit",
      "zh-cn": "分享到Reddit",
      es: "Compartir en Reddit",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        title: target.title,
        url: target.url,
      }).toString();

      return `https://reddit.com/submit?${params}`;
    },
  },
  Refind: {
    label: {
      ja: "Refindに保存",
      en: "Save to Refind",
      "zh-cn": "保存到Refind",
      es: "Guardar en Refind",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        url: target.url,
      }).toString();

      return `https://refind.com?${params}`;
    },
  },
  Sms: {
    label: {
      ja: "SMSで送信",
      en: "Send via SMS",
      "zh-cn": "通过短信发送",
      es: "Enviar por SMS",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        body: postText(target),
      }).toString();

      return `sms:?${params}`;
    },
  },
  Snapchat: {
    label: {
      ja: "Snapchatで共有",
      en: "Share on Snapchat",
      "zh-cn": "分享到Snapchat",
      es: "Compartir en Snapchat",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        attachmentUrl: target.url,
      }).toString();

      return `https://snapchat.com/scan?${params}`;
    },
  },
  Telegram: {
    label: {
      ja: "Telegramで共有",
      en: "Share on Telegram",
      "zh-cn": "分享到Telegram",
      es: "Compartir en Telegram",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: shareText(target),
        url: target.url,
        to: "",
      }).toString();

      return `https://t.me/share/url?${params}`;
    },
  },
  Threads: {
    label: {
      ja: "Threadsに投稿",
      en: "Post to Threads",
      "zh-cn": "分享到Threads",
      es: "Publicar en Threads",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: postText(target),
      }).toString();

      return `https://threads.net/intent/post?${params}`;
    },
  },
  Trello: {
    label: {
      ja: "Trelloに追加",
      en: "Add to Trello",
      "zh-cn": "添加到Trello",
      es: "Añadir a Trello",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        mode: "popup",
        desc: shareText(target),
        url: target.url,
      }).toString();

      return `https://trello.com/add-card?${params}`;
    },
  },
  Tumblr: {
    label: {
      ja: "Tumblrに投稿",
      en: "Post to Tumblr",
      "zh-cn": "分享到Tumblr",
      es: "Publicar en Tumblr",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        canonicalUrl: target.url,
        title: target.title,
      }).toString();

      return `https://www.tumblr.com/widgets/share/tool?${params}`;
    },
  },
  VKontakte: {
    label: {
      ja: "VKontakteで共有",
      en: "Share on VKontakte",
      "zh-cn": "分享到VKontakte",
      es: "Compartir en VKontakte",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        url: target.url,
      }).toString();

      return `https://vk.com/share.php?${params}`;
    },
  },
  Viber: {
    label: {
      ja: "Viberで送信",
      en: "Send with Viber",
      "zh-cn": "使用Viber发送",
      es: "Enviar con Viber",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: postText(target),
      }).toString();

      return `viber://forward?${params}`;
    },
  },
  Wappalyzer: {
    label: {
      ja: "Wappalyzer で分析",
      en: "Analyze with Wappalyzer",
      "zh-cn": "使用 Wappalyzer 分析",
      es: "Analizar con Wappalyzer",
    },
    url: (target, _settings, _language) => {
      const url = new URL(target.url);
      const query = url.host + url.pathname;

      return `https://wappalyzer.com/lookup/${encodeURIComponent(query)}`;
    },
  },
  WaybackMachine: {
    label: {
      ja: "Wayback Machineで確認",
      en: "Check in Wayback Machine",
      "zh-cn": "在Wayback Machine中查看",
      es: "Ver en Wayback Machine",
    },
    url: (target, _settings, _language) => {
      return `https://web.archive.org/web/*/${target.url}`;
    },
  },
  Weibo: {
    label: {
      ja: "Weiboで共有",
      en: "Share on Weibo",
      "zh-cn": "分享到微博",
      es: "Compartir en Weibo",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        title: shareText(target),
        url: target.url,
      }).toString();

      return `https://service.weibo.com/share/share.php?${params}`;
    },
  },
  WhatsApp: {
    label: {
      ja: "WhatsAppで共有",
      en: "Share on WhatsApp",
      "zh-cn": "分享到WhatsApp",
      es: "Compartir en WhatsApp",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: target.selection
          ? `${target.selection} ${target.url}`
          : target.url,
      }).toString();

      return `https://web.whatsapp.com/send?${params}`;
    },
  },
  WordPress: {
    label: {
      ja: "WordPressに投稿",
      en: "Post to WordPress",
      "zh-cn": "发布到WordPress",
      es: "Publicar en WordPress",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        t: target.title,
        u: target.url,
      }).toString();

      return `https://wordpress.com/wp-admin/press-this.php?${params}`;
    },
  },
  X: {
    label: {
      ja: "Xに投稿",
      en: "Post to X",
      "zh-cn": "分享到X",
      es: "Compartir en X",
    },
    url: (target, _settings, _language) => {
      const params = new URLSearchParams({
        text: shareText(target),
        url: target.url,
      }).toString();

      return `https://x.com/intent/post?${params}`;
    },
  },
} satisfies Record<string, ShareAction>;

export function getShareAction(name: string): ShareAction | undefined {
  return Object.hasOwn(shareActions, name)
    ? shareActions[name as keyof typeof shareActions]
    : undefined;
}
