# Architecture

Async Ripple UI is organized around small feature modules rather than a single page component.

## Application Shell

`src/App.vue` composes the application and wires together state from composables. It should stay small and avoid owning domain logic.

## Components

- `components/layout`: shell and navigation primitives.
- `components/documentation`: AsyncAPI rendering sections.
- `components/tools`: source editor and realtime client panels.
- `components/common`: reusable UI elements shared across features.

## Composables

- `useAsyncApiDocument`: parses YAML/JSON, resolves local references and exposes normalized document collections.
- `useEchoClient`: owns Socket.IO connection state, subscriptions, wildcard subscription matching and event logs. Laravel Echo channel conventions are supported as compatibility behavior, not as the whole product scope.
- `useColorMode`: owns persisted color mode.
- `useResizablePanels`: owns panel sizing and persistence.

## Styling

CSS is split by responsibility under `src/assets/styles`. `src/assets/main.css` is only an import manifest.

## Production Notes

- Generated `dist` output is ignored and should be produced by CI or release pipelines.
- Runtime secrets are not persisted by the app.
- The realtime client uses `socket.io-client` 4.x. Legacy Socket.IO 2 servers may require compatibility work before production use.
