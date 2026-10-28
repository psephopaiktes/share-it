# Working in this repository

- This is a Vue 3 / TypeScript browser extension built with WXT. Use the existing
  checkout and create a focused branch from the latest `main`; do not create an
  additional Git worktree unless requested.
- Keep changes small. Reuse existing components and conventions. Keep logic used
  by one component in that component; extract shared code when multiple callers
  need it. Avoid adding dependencies or tool-specific configuration unless needed
  for the requested work.
- Do not edit `README.md` unless explicitly requested. Explain setup and
  operational steps in the conversation instead of adding unsolicited documents.

## UI and assets

- The popup lives in `entrypoints/popup/`; `components/ButtonList.vue` renders the
  sharing list, settings, and links at the bottom. Individual sharing actions live
  in `components/Button/`, with defaults in `components/defaultButtonList.ts`.
- Add icons to `public/img/`. Preserve provided SVG artwork.
- Use `i18n.t` and include English, Japanese, Simplified Chinese (`zh-cn`), and
  Spanish for new UI text. Preserve keyboard navigation and accessible labels.
- Escape page-controlled text when generating HTML. Use `URLSearchParams` for
  query parameters and `rel="noopener noreferrer"` on links opened in a new tab.

## Development and verification

- Follow the Node.js requirement in `package.json`; install with `npm ci`.
- Use `npm start` for WXT development. The ignored `web-ext.config.ts` contains
  machine-specific browser settings; do not overwrite a user's local settings.
- Run the checks relevant to the change: `npm test`, `npm run compile`,
  `npm run build`, and `npm run build:firefox`. For UI changes, also check the
  rendered popup when browser tooling is available.
- `npm run biome` writes fixes, and build/zip scripts invoke it. Review `git diff`
  afterward and avoid unrelated formatting changes. Use
  `npx --no-install biome check` for a read-only check.
- Test behavior rather than duplicating implementation or adding trivial checks.
  Keep generated `.wxt/`, `.output/`, and `node_modules/` out of commits.
- Keep credentials out of source, logs, and chat. `.env.submit` is local only;
  publishing credentials belong in GitHub Actions repository secrets/variables.

## Publishing

- Write GitHub release notes in English and keep them concise.
- Perform version bumps, merges, store submissions, tags, and GitHub Releases when
  requested. A version-bump PR must update both `package.json` and
  `package-lock.json`; use `npm version patch --no-git-tag-version` (or minor/major).
- Merging a version change into `main` triggers store submissions after CI passes.
  Unchanged versions skip submission. The workflow does not create tags or GitHub
  Releases. Use the publishing workflow's `dry_run` for authentication checks.
- Distinguish successful submission from store approval or public availability.
