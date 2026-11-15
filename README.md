# Powerlifting Overlay

Local desktop app (**Tauri v2 + React + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + Zustand**) that drives an OBS lower-third overlay for powerlifting meets.

## Architecture

- **Admin window** (`#/` inside Tauri): the native control room (athletes, attempts, live controls).
- **Local HTTP server** embedded in Rust on `127.0.0.1:4567`:
  - serves the frontend to OBS;
  - exposes `GET /api/state` and `GET /api/events` (SSE) to keep the overlay in sync in real time.
- **OBS overlay** (`#/overlay`): transparent lower-third, fed only through HTTP/SSE.

```
Admin (Tauri invoke) → CompetitionState (Rust Mutex)
                    → competition_data.json (app data)
                    → SSE broadcast
OBS Browser Source → http://localhost:4567/#/overlay
```

## Prerequisites (development)

- [Node.js](https://nodejs.org/) 22+
- [Rust](https://www.rust-lang.org/tools/install) stable
- On Windows: [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (usually already installed)

## Install

```bash
npm install
```

## Run in development

```bash
npm run tauri dev
```

- The control room opens in the Tauri window.
- The overlay server starts on `http://localhost:4567`.
- OBS URL: `http://localhost:4567/#/overlay`

Vite runs on port `5177`. Opening `http://localhost:5177` in a regular browser only shows the overlay: the admin needs the Tauri runtime.

## Build the portable executable

```bash
npm run tauri build
```

This runs `vite build`, copies the overlay assets to `src-tauri/resources/dist`, then produces the binary.

Typical outputs on Windows:

- NSIS/MSI installer in `src-tauri/target/release/bundle/`
- Binary: `src-tauri/target/release/powerlifting-overlay.exe`

The target PC **does not need Node.js**. WebView2 is required (preinstalled on recent Windows 10/11).

## OBS setup

1. Start **Powerlifting Overlay** (`npm run tauri dev` or the executable).
2. In OBS: **Sources → Add → Browser**.
3. URL: `http://localhost:4567/#/overlay`
4. Width / height: `1920` × `1080` (or your canvas resolution).
5. Paste this into the Browser source's **Custom CSS** field:

```css
body { background-color: rgba(0, 0, 0, 0) !important; margin: 0px auto; overflow: hidden; }
```

6. Keep the transparent background option enabled if your OBS version offers it.
7. In the control room: **Copy OBS URL**, then **Put on screen** or the athlete navigation buttons.

> In development, the `:4567` server proxies Vite (port `5177`) so OBS always gets up-to-date CSS. Restart `tauri dev` if the overlay shows up unstyled.

## Data

- On first launch, a demo meet (6 athletes) is created.
- State is saved automatically to `competition_data.json` in the app's AppData folder.
- Import / export JSON from the control room toolbar. **Sample JSON** downloads an example start list.
- Platforms are labelled `Platform 1`, `Platform 2`, … and flights `Flight A`, `Flight B`, …. Data saved or exported by earlier builds with the French labels (`Plateau 1`, `Groupe A`) is renamed automatically when it is loaded or imported.

## UI

- The admin uses [shadcn/ui](https://ui.shadcn.com) components (`radix-nova` style) from `src/components/ui`. Add more with `npx shadcn@latest add <component>`.
- Theme tokens live in `src/index.css`. The admin is dark-only (`class="dark"` on `<html>`) with a yellow primary.
- The overlay keeps its own solid colors and system font so it renders the same in OBS, and stays transparent through the `overlay-mode` class set in `index.html`.

## Project layout

```
src/
  components/ui/      # shadcn/ui components
  components/admin/   # control room panels
  components/overlay/ # OBS lower-third
  pages/              # AdminPage, OverlayPage
  store/              # Zustand store
src-tauri/src/        # Rust (models, commands, SSE server)
  models.rs
  commands.rs
  server.rs
  lib.rs
```
