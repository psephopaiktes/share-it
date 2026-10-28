# share-it

![Hero Image](design/cover.png)

A browser extension that allows you to share and copy web pages in various ways.



## Get the Extension

- [Chrome Web Store](https://chrome.google.com/webstore/detail/kmfmfcdigkgfhmnopjfdnaikhjkmmplm)
- [Add-ons for Firefox](https://addons.mozilla.org/firefox/addon/share-it/)
<!-- * [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/02e8d660-94a7-4081-b540-3425b3621bbb) -->



## Development

Use Node.js 22.12 or newer.
```zsh
npm ci
npm start
```

`npm start` starts the development server and opens a Chromium-based browser
with the development extension through `web-ext`, which is included in the
development dependencies. Firefox development uses `npm run dev:firefox`.
Development requires a browser that permits unpacked extensions.

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
macOS and Xcode command-line tools.

WXT supports machine-specific browser settings in an ignored `web-ext.config.ts`.
`defineWebExtConfig({ disabled: true })` disables automatic browser startup; remove
that setting to use automatic startup. Use `binaries.chrome` to select Chromium
if the browser executable cannot be detected automatically. When automatic startup
is disabled for a headless environment, load `.output/chrome-mv3-dev` manually
(or `.output/firefox-mv2-dev` for Firefox).

The development browser launcher currently brings in an unpatched low-severity
`deepmerge` advisory through `addons-linter`
([GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)).
This dependency is not bundled into the distributed extension. Keep it visible
in `npm audit` and update it when an upstream fix is available.



## For Firefox review team

To review the source code and build it, please run the following command:
```zsh
npm run build:firefox
```
