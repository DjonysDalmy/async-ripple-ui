<p align="center">
  <img src="public/async-ripple-ui.svg" alt="Async Ripple UI" width="96" height="96" />
</p>

# Async Ripple UI

AsyncAPI viewer and realtime client for event-driven APIs.

The UI renders channels, messages, schemas and server definitions from AsyncAPI documents. The client connects to Socket.IO servers, subscribes to documented channels, supports wildcard patterns and handles Laravel-style `private-` / `presence-` prefixes when they appear in a contract.

## Features

- AsyncAPI YAML/JSON rendering
- Servers, channels, operations, messages and schemas
- Light and dark mode
- Resizable navigation and tools panels
- Source editor with YAML/JSON import
- Realtime Socket.IO client panel
- Subscription by channel or wildcard pattern, including `*`
- JSON payload highlighting and copy support

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

## Getting Started

```sh
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production Build

```sh
npm run build
npm run preview
```

Run all local verification:

```sh
npm run check
```

## Using The Realtime Client

1. Paste or import an AsyncAPI document.
2. Open the `Client` tab.
3. Select a documented server or enter a Socket.IO server URL manually.
4. Add a bearer token if your channels require authentication.
5. Subscribe from a channel card or use a wildcard pattern in the client panel.

Wildcard examples:

- `*`: subscribe to every ready documented channel
- `private-*`: subscribe to every private channel after prefix resolution
- `*chat*`: subscribe to channels containing `chat`

Channels with unresolved variables are skipped until their variables are filled in the channel card.

The client uses `socket.io-client` 4.x.

## Project Architecture

- `src/App.vue`: screen composition only. It wires state, layout and feature modules.
- `src/components/layout`: reusable shell pieces such as sidebar navigation and resize handles.
- `src/components/documentation`: AsyncAPI rendering sections.
- `src/components/tools`: Source and Client side panels.
- `src/components/common`: shared UI primitives.
- `src/composables`: stateful feature logic.
- `src/types`: shared TypeScript contracts.
- `src/utils`: pure helpers.
- `src/fixtures`: bundled sample documents.
- `src/assets/styles`: CSS split by responsibility. `main.css` only imports style modules.

See `docs/ARCHITECTURE.md` for more detail.

## License

MIT.
