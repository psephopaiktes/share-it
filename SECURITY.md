# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it to us directly. Do not report vulnerabilities in public GitHub issues.

Please submit your report using the GitHub security advisories page: [Create a security advisory](https://github.com/psephopaiktes/share-it/security/advisories/new). We will respond as soon as possible and prioritize a fix.

## Security Considerations

- This extension has no analytics or application backend. When you choose a sharing action, the page URL, title, or other shared content is sent to the selected service. The QR-code action also sends the page URL to an external QR-code service.
- Button preferences are stored using the browser's `storage.sync` API and may sync through the browser vendor when browser sync is enabled.
- Permissions requested are necessary for the extension’s functionality, including interacting with tabs, notifications, and clipboard.

## Responsible Disclosure

We encourage responsible disclosure to ensure that security issues are addressed before being publicly known.
