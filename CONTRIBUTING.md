# Contributing

Thanks for helping improve Async Ripple UI.

## Development

```sh
npm install
npm run dev
```

Before opening a pull request, run:

```sh
npm run check
```

## Pull Request Guidelines

- Keep changes focused and easy to review.
- Prefer existing component, composable and CSS module boundaries.
- Add or update documentation when behavior changes.
- Avoid committing generated output such as `dist`.
- Do not commit secrets, tokens, private AsyncAPI documents, or local `.env` files.

## Architecture Guidelines

- UI composition belongs in `src/App.vue` and feature components.
- Stateful logic belongs in `src/composables`.
- Shared contracts belong in `src/types`.
- Pure helpers belong in `src/utils`.
- CSS should stay split by responsibility under `src/assets/styles`.

## Reporting Bugs

Include:

- Async Ripple UI version or commit
- Browser and OS
- Minimal AsyncAPI document if possible
- Expected behavior
- Actual behavior
