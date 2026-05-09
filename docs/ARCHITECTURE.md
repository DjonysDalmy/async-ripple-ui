# Architecture

Async Ripple UI keeps rendering, client state and parsing separate.

## Layout

- `src/App.vue`: shell wiring only.
- `src/components/layout`: navigation and resize handles.
- `src/components/documentation`: AsyncAPI sections.
- `src/components/tools`: source and client panels.
- `src/components/common`: shared components.

## Composables

- `useAsyncApiDocument`: parsing, references and normalized document data.
- `useRealtimeClient`: Socket.IO connection, subscriptions and event log.
- `useColorMode`: light/dark mode.
- `useResizablePanels`: persisted side panel widths.

## Other Folders

- `src/types`: shared TypeScript types.
- `src/utils`: pure helpers.
- `src/fixtures`: bundled AsyncAPI sample.
- `src/assets/styles`: CSS split by surface.
