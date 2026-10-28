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

## Publishing updates

In a release PR, run `npm version patch --no-git-tag-version` (or `minor` / `major`)
and commit both `package.json` and `package-lock.json`. After merging into `main`,
the **Check** workflow must pass on Node.js 22 and 24 before **Publish to stores**
submits Chrome and Firefox ZIPs for review. Merges without a version change skip
store submission. Store approval determines when the update becomes public.
No Git tags or GitHub Releases are created.
The new version must also exceed versions already submitted to either store.

Configure these repository settings under **Settings → Secrets and variables →
Actions** before the first version bump:

| Type     | Name                                  | Value                                                                            |
| -------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| Variable | `CHROME_PUBLISHER_ID`                 | Publisher ID from the Chrome Web Store developer dashboard                       |
| Variable | `CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL` | Google service account email authorized to publish this extension                |
| Secret   | `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`  | Its JSON key's `private_key` field, including the PEM header/footer and newlines |
| Secret   | `FIREFOX_JWT_ISSUER`                  | AMO API key / JWT issuer                                                         |
| Secret   | `FIREFOX_JWT_SECRET`                  | AMO API secret                                                                   |

Chrome uses Web Store **API v2**: enable the Chrome Web Store API in the service
account's Google Cloud project and grant the account access to the existing
publisher/extension in the developer dashboard. Firefox credentials are available
at <https://addons.mozilla.org/developers/addon/api/key/>. Existing listing IDs are
already set in the workflow. Credentials belong in Actions settings, not in Git.
If you use `npx wxt submit init` locally, `.env.submit` is ignored by Git.

This workflow-only PR does not bump the extension version. Once it is merged and
credentials are configured, select **Actions → Publish to stores → Run workflow**
on `main`, leave **dry_run** enabled, and test both stores' authentication. This
does not upload ZIPs or request review. Then merge a version-bump PR to submit.

The stores run independently. If one fails, use **Re-run failed jobs** on the
original run to retry only that store at the original commit. Manual runs can also
select a single store; disabling **dry_run** performs a real submission from the
current `main` version. A store may reject a version that is already submitted or
under review; the workflow does not cancel pending reviews automatically.

Chrome's extension ZIP and Firefox's extension/source ZIPs are retained as Actions
artifacts for 14 days. Firefox's source ZIP must remain rebuildable with `npm ci`
and `npm run build:firefox` as described above.
