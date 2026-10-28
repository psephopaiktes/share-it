# share-it

![Hero Image](design/cover.png)

A browser extension that allows you to share and copy web pages in various ways.



## Get the Extension

- [Chrome Web Store](https://chrome.google.com/webstore/detail/kmfmfcdigkgfhmnopjfdnaikhjkmmplm)
- [Add-ons for Firefox](https://addons.mozilla.org/firefox/addon/share-it/)
<!-- * [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/02e8d660-94a7-4081-b540-3425b3621bbb) -->



## Development

Use Node.js 22.12 or newer (Node.js 24 is recommended; see `.nvmrc`).
```zsh
npm ci
npm start
```

Load `.output/chrome-mv3-dev` as an unpacked extension after starting the dev
server. Firefox development uses `npm run dev:firefox` and
`.output/firefox-mv2-dev`. Development requires a browser that permits unpacked
extensions.

The optional `web-ext` browser launcher is intentionally not installed: its
current dependency tree includes an unpatched `deepmerge` advisory
([GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)).
WXT falls back to manual extension loading without it. This changes development
browser startup, not the packaged extension.

```sh
npm run biome          # Read-only formatting/lint checks
npm run format         # Explicitly apply formatting/lint fixes
npm run compile        # Type checking
npm test               # Regression tests
npm run build          # Chrome MV3 production build
npm run build:firefox  # Firefox MV2 production build
npm audit              # Check installed dependencies for known advisories
```

Build and zip commands do not rewrite source files. Safari packaging requires
macOS and Xcode command-line tools. Browser auto-launch is optional; WXT supports
an ignored `web-ext.config.ts` with `defineWebExtConfig({ disabled: true })`.



## For Firefox review team

To review the source code and build it, please run the following command:
```zsh
npm run build:firefox
```
