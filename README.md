# Azion Diagram Studio

A Nuxt 4 / Vue 3 / Tailwind 4 architecture diagram dashboard built on Azion Webkit components and theme tokens, with self-hosted Sora and Proto Mono fonts and original SVG icons. JavaScript and TypeScript only.

## Run locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The UI imports real Webkit components from the `@aziontech/webkit` npm package; `src/webkit.css` loads `@aziontech/theme` and registers Webkit with Tailwind. Run `npx @aziontech/webkit doctor` to check the wiring.

## Design and edit

- Start from six architecture templates or a blank canvas.
- Drag nodes and boundary labels; boundaries move enclosed unlocked objects by default. Resize using corner handles.
- Shift-click or drag a selection box, align/distribute components, duplicate, lock, delete, and wrap selections in boundaries.
- Add service cards, rectangles, ellipses, decisions, and text from the library, or search all 402 bundled original icons with ⌘K / Ctrl+K.
- Connect two nodes with the Connect tool, or from the keyboard with the inspector's Connect button. Edit labels, arrowheads, solid/dashed lines, and orthogonal/straight/curved routing.
- Pan, zoom, snap to grid, change canvas size and theme, undo/redo, and use keyboard shortcuts from the toolbar's help button (or press ?).
- Switch the interface between system, light, and dark themes from the sidebar.
- Copy prompts or export SVG, HTML, PNG (1×–3×), and editable JSON. Import JSON or Diagram Studio SVG to continue editing.

Drafts and saved diagrams live in the current browser's local storage. Export JSON for backup or to transfer work to another browser. Arbitrary SVG and draw.io XML are not imported. Automatic connectors do not avoid every obstacle; inspect complex routes before sharing.

## Agent CLI and npm package

The standalone package is in [packages/diagram-cli](packages/diagram-cli/README.md). It shares templates, icon assets, geometry, validation, and SVG rendering with the dashboard.

```sh
npm ci --prefix packages/diagram-cli
npm run cli:build
node packages/diagram-cli/dist/cli.js create --template serverless-app --out diagram.json
node packages/diagram-cli/dist/cli.js validate --input diagram.json
node packages/diagram-cli/dist/cli.js render --input diagram.json --format svg,html,png --out-dir exports
```

Use **Import diagram** to open CLI JSON or SVG in the dashboard. For exact Webkit overline typography, configure the CLI's `AZION_DIAGRAM_MONO_FONT` to your existing licensed Proto Mono file. The distributable package bundles Sora and uses it as its default fallback.

## Validation and build

```sh
npm run typecheck
npm test
npm run build
npm run cli:test
npm run cli:pack
```

`npm run generate` produces a static dashboard in `.output/public/`. Configure your static host to serve the SPA fallback for `/editor/*`. `npm run preview` runs the production Nuxt build. Existing Azion deployment files are preserved; these commands do not deploy.

Vitest covers templates, portable exports, schema validation, boundary movement, resizing, locking, duplication, alignment, deletion, and metadata round trips. The CLI's Node tests exercise stdin, errors, overwrite protection, and rendering. Browser verification covers actual gestures, history, file import, clipboard exports, and responsive layout.

See [reference analysis](docs/reference-analysis.md), [editor features](docs/editor-features.md), and [contributor guidelines](AGENTS.md).
