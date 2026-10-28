# Maintenance review — 2026-10-28

Reviewed all button actions, popup components, settings and localization helpers,
the extension manifest, dependency manifests, build scripts, and project guidance.
This is a maintenance proposal; new sharing features belong in follow-up PRs.

## Dependency changes

| Package | Previous lock | Updated lock |
| --- | --- | --- |
| Vue | 3.5.23 | 3.5.44 |
| WXT | 0.20.11 | 0.21.5 |
| Vite | 7.2.1 | 7.3.7, explicitly declared as a WXT peer |
| Biome | 2.3.4 | 2.6.3 |
| vue-tsc | 3.1.3 | 3.3.13 |
| Chrome types | 0.1.27 | 0.3.7 |
| Auto icons | 1.1.0 | 1.1.2 |

TypeScript remains at 5.9.3. Moving to TypeScript 7 or Vite 8 should receive its
own compatibility review instead of being coupled to advisory remediation.
Node.js now requires 22.12 or newer; `.nvmrc` recommends Node.js 24.

The original full `npm audit` reported 29 affected package entries: 3 critical,
22 high, and 4 moderate, including propagated findings. The updated full audit
reports zero. These counts include development tooling and are not a count of
independently exploitable extension vulnerabilities. Advisories can change after
this review.

WXT no longer bundles the old browser launcher. Its optional replacement,
`web-ext@10.8.0`, was evaluated but excluded because its `addons-linter` dependency
still requires an affected `deepmerge` version
([GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)).
Development uses WXT's supported manual extension loading instead. No forced
major-version dependency overrides or disabled integrity checks were used.

## Fixes and refactoring

- HTML and rich-text copies share escaping and protocol handling. Unsupported or
  executable URL schemes produce plain text. Plain-text clipboard destinations
  receive readable title/URL text rather than HTML markup.
- Clipboard writes are awaited before success feedback. Failures leave the popup
  open with a localized error. Notification failure does not undo a successful
  copy, and the notification references the actual generated `icons/128.png`.
- Amazon detection reacts to asynchronously loaded tab data, recognizes product
  paths, rejects lookalike domains, and handles non-product/invalid URLs safely.
- Stored button preferences are normalized, deduplicated and copied so malformed
  Sync data cannot corrupt defaults. Saves preserve unrelated option fields and
  only leave edit mode after success. Failed loads cannot silently overwrite
  existing preferences; load and save failures support retry.
- Popup initialization handles missing tabs and rejected tab queries. Buttons
  wait for tab data; arrow navigation skips hidden/disabled buttons and leaves
  native input navigation intact. Keyboard listeners are removed on unmount.
- Regional UI locales fall back to supported base languages, and the document
  language follows the selected translation.
- Share destinations previously using HTTP use HTTPS; PageSpeed receives an
  encoded URL parameter. Print actions handle rejected execution requests.
- Build/zip commands no longer rewrite source. Formatting has an explicit
  command. Biome respects ignored files and uses its migrated configuration.
- Regression tests and a read-only-permissions CI matrix cover Node.js 22/24;
  official GitHub Actions are pinned to verified v6 commit SHAs.
- The security policy now explains user-initiated sharing, the external QR-code
  service, and browser preference synchronization.

## Validation and limits

- Clean `npm ci`, full dependency audit, Biome, and type checking passed.
- All 11 regression tests executed and passed on Node.js 24.19 and 22.12.
- Chrome MV3 and Firefox MV2 production builds passed on both Node versions.
- Updated WXT development startup and local HTML/JavaScript requests passed.
- The built popup passed Chromium checks with mocked extension APIs: delayed tab
  loading, Amazon visibility, regional locale, HTML/rich-text copies, settings
  persistence, preservation of other fields, load/save failures, and retry.
- This cloud browser prohibits loading unpacked extensions. Mocked API checks do
  not establish real extension permissions, native clipboard behavior, OS
  notifications, browser Sync transport, or third-party account integrations.
- Firefox packaging warns about Mozilla's data-collection declaration for new
  submissions. Store submission and Safari/macOS packaging were not tested.
- CI was configured; a hosted GitHub Actions run is separate validation.

## Follow-up proposals

1. Add separately keyed, validated text preferences to browser Sync, beginning
   with Mastodon instance selection (#25) and a self-email recipient (#26/#28).
   Preserve existing button order/state; add length limits, defaults, migrations,
   and explicit save feedback. This PR preserves unrelated keys but does not add
   those new settings or the self-email feature.
2. Extract share actions from Vue components into a shared action registry before
   adding context menus/selected-text sharing (#18/#21). Keep service URL builders
   independently testable, including missing page metadata and query encoding.
3. Reproduce Edge icon disappearance (#27) on the affected Edge/theme combination.
   It is not confirmed to share a cause with the notification icon path fixed here.
4. Verify all destination flows with real accounts and supported browsers,
   particularly legacy WordPress/Press This and browser-specific clipboard/share
   behavior. Narrow permissions only after that coverage is available.
5. Add store publication automation (#9) after credential setup, and decide the
   Firefox data-collection declaration from actual extension/store requirements.
