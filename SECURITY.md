# Security Policy

## Supported Versions

The `main` branch receives security fixes during early development.

## Reporting A Vulnerability

Please do not open a public issue for sensitive security reports.

Send a private report to the project maintainers with:

- Affected version or commit
- Reproduction steps
- Impact
- Suggested fix, if available

## Handling Secrets

Async Ripple UI can handle bearer tokens in the browser while testing realtime subscriptions. Tokens are not intentionally persisted by the application, but they are still visible to the browser runtime. Use short-lived development tokens and avoid production credentials when testing local builds.
