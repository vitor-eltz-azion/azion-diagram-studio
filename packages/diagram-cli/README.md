# azion-diagram

Create, validate, and render Azion architecture diagrams from JSON, on the command line or from JavaScript and TypeScript. It's built for people and AI agents alike: every command reads and writes JSON, and errors come back as machine-readable diagnostics.

- Six ready-made templates and 402 Azion and general infrastructure icons
- Dark and light themes
- Automatic layout for specs without coordinates
- SVG, HTML, and PNG output, with no browser, API key, or network access needed

> This is an independent community project. It is not affiliated with, endorsed by, or supported by Azion Technologies.

## Requirements

Node.js 22 or newer.

## Install

```sh
# Run without installing
npx azion-diagram templates

# Install the command globally
npm install -g azion-diagram

# Add it to a project to use the API
npm install azion-diagram
```

## Quick start

```sh
azion-diagram create --template web-delivery --out diagram.json
azion-diagram validate --input diagram.json
azion-diagram render --input diagram.json --format svg,html,png --out-dir exports
```

`exports/` now holds the diagram as SVG, HTML, and PNG. Run `azion-diagram --help` to see every command and option.

## Workflow for agents

1. Discover the supported identifiers with `azion-diagram templates` and `azion-diagram icons --search storage`.
2. Start from a template, or write a JSON spec and let the CLI place it: `create --spec spec.json --layout --out diagram.json`. Use `--spec -` to read from stdin.
3. Edit the JSON, then run `validate --input diagram.json`. Fix every diagnostic before rendering.
4. Render with `render --input diagram.json --format svg,html,png --out-dir exports`. Use `--scale 1`, `2`, or `3` to set the PNG resolution.
5. To keep editing visually, open the JSON or exported SVG with **Import diagram** in the [Diagram Studio web app](https://github.com/vitor-eltz-azion/azion-diagram-studio), then export JSON for the next CLI run.

A minimal spec for automatic placement:

```json
{
  "id": "my-api",
  "title": "My API",
  "nodes": [
    { "id": "users", "label": "Users", "icon": "pi-users" },
    { "id": "app", "label": "Applications", "icon": "ai-edge-application" }
  ],
  "edges": [{ "id": "request", "from": "users", "to": "app", "label": "HTTPS" }]
}
```

Without `--layout`, every node needs `x` and `y`. `layout --input diagram.json --out arranged.json` places unlocked components in rows, accounts for their dimensions, and expands the canvas height. It keeps existing boundaries and locked positions, so review boundary membership and connector crossings afterward.

## Commands

| Command                                       | Result                                                                |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `templates`                                   | JSON list of template IDs, titles, categories, and node counts        |
| `icons --search term --family Azion`          | JSON icon names and current product labels (`General` also supported) |
| `schema --out schema.json`                    | JSON Schema for editor tooling and agent structured output            |
| `create --template blank --title "My design"` | Normalized editable JSON on stdout                                    |
| `validate --input -`                          | JSON validation result; reads stdin                                   |
| `layout --input file.json`                    | Arranged editable JSON                                                |
| `prompt --input file.json --json`             | JSON object containing a reusable architecture prompt                 |
| `render --input file.json --out diagram.svg`  | Rendered file; the format comes from the extension                    |

| Option                   | Effect                                          |
| ------------------------ | ----------------------------------------------- |
| `--out FILE`             | Write one file; `-` writes text to stdout       |
| `--out-dir DIR`          | Write several rendered formats                  |
| `--theme dark\|light`    | Override the diagram theme                      |
| `--scale 1\|2\|3`        | PNG resolution (default `2`)                    |
| `--force`                | Allow overwriting an existing file              |
| `--help`, `--version`    | Show usage or the installed version             |

### Output contract

- Text output goes to stdout when `--out` is omitted or `-`.
- File writes return a JSON receipt with the path and byte count, one receipt per file.
- Errors are JSON on stderr with exit code 1. Success exits with 0.
- Existing files are never overwritten unless you pass `--force`.
- PNG output needs a destination file.

## Diagram model

The package ships its JSON Schema as `diagram.schema.json` (also exported as `azion-diagram/schema` and printed by `azion-diagram schema`) and six example diagrams in `examples/`.

- IDs must be unique across all objects.
- Each connection references two existing, distinct nodes.
- Use `ai-*` icons for Azion products and `pi-*` icons for general infrastructure.
- Nodes support the `card`, `rectangle`, `ellipse`, `diamond`, and `text` shapes, with adjustable dimensions, accents, and locks.
- Boundaries support position, size, lock, and `moveChildren`.
- Edges support `orthogonal`, `straight`, and `curved` routing; `end`, `both`, or `none` arrowheads; and dashed lines for asynchronous flows.

Limits: the canvas is 640–4096px wide and 480–4096px high; content starts at y=80 and ends 64px above the bottom. A diagram holds up to 300 nodes, 100 boundaries, and 600 edges, and input files are capped at 5 MB.

Validation checks structure and geometry, not whether a product actually offers a capability, so review the architecture itself separately.

SVG exports outline all text, embed the icon paths, and keep the editable JSON in `<metadata id="azion-diagram-model">`. JSON is the canonical source. Importing arbitrary SVG or draw.io XML isn't supported.

## Typography

The package bundles Sora under the SIL Open Font License and uses it for all text by default. To match Webkit's Proto Mono overlines, point to your own licensed copy of the font:

```sh
AZION_DIAGRAM_MONO_FONT=/absolute/path/ProtoMono-Regular.ttf azion-diagram render --input diagram.json --out diagram.svg
```

Proto Mono isn't included in this package. Exported artwork uses vector outlines, so viewers don't need any fonts installed.

## TypeScript API

```ts
import { writeFile } from 'node:fs/promises'
import { createDiagram, templates, renderSvg, parseDiagram } from 'azion-diagram'

const diagram = parseDiagram(createDiagram(templates[0]))
diagram.title = 'My architecture'
await writeFile('diagram.svg', await renderSvg(diagram))
// Optional: renderSvg(diagram, { monoFont: '/absolute/path/ProtoMono-Regular.ttf' })
```

The package exports diagram types, schema validation, templates, icon discovery, geometry operations, prompt generation, and renderers.

## Development

```sh
git clone https://github.com/vitor-eltz-azion/azion-diagram-studio.git
cd azion-diagram-studio/packages/diagram-cli
npm ci
npm run check
```

`npm run check` builds the package and runs the tests. Maintainers can refresh the icons, colors, and Sora font from a Webkit checkout with `node scripts/sync-assets.mjs`, then rebuild.

Found a bug or have an idea? [Open an issue](https://github.com/vitor-eltz-azion/azion-diagram-studio/issues).

## License

MIT © Vitor Eltz. See `LICENSE`.

The bundled Azion Webkit icons and color tokens are MIT-licensed by Azion Technologies, and the Sora font is under the SIL Open Font License 1.1. See `THIRD_PARTY_NOTICES.md` for details. Azion and other product names and logos are trademarks of their respective owners.
