---
name: azion-diagram
description: Create, edit, validate, and render Azion architecture diagrams with the azion-diagram CLI from npm, producing editable Diagram Studio JSON plus SVG, PNG, or HTML in the format Azion expects (official product names and icons, an AZION PLATFORM boundary, left-to-right request flow, dashed async flows, and the template grid). Use when asked to draw, diagram, sketch, or visualize an architecture, request flow, or solution that involves Azion products such as Applications, Functions, Firewall, WAF, Object Storage, SQL Database, KV Store, Data Stream, Load Balancer, or Edge DNS; when turning an architecture description into a diagram; when adapting an official Azion template; when updating a Diagram Studio JSON or SVG export; when re-exporting a diagram in another theme or format; or when checking a diagram for deprecated Azion names. Not for marketing illustrations, hero graphics, or OG images (use azion-illustration).
---

# Azion architecture diagrams

Diagrams are JSON. Lay them out with `scripts/compose.mjs` (in this skill's directory), then validate and render them with the published CLI, `npx -y azion-diagram` (Node.js 22+). SVG, PNG, and HTML are exports; every SVG embeds its JSON, so Diagram Studio and `compose.mjs --extract` can read it back.

## Pick the path

| The user wants                                                                        | Do                                                                                                                          |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| A diagram of their own architecture                                                   | The workflow below                                                                                                          |
| An official template with small changes (title, theme, a few labels)                  | `create --template`, then edit the JSON ("Light variant of an official template" in [references/cli.md](references/cli.md)) |
| Changes to a diagram they already have (JSON, or SVG from Diagram Studio or this CLI) | "Editing an existing diagram" in [references/patterns.md](references/patterns.md)                                           |
| Another format, theme, or size of an existing diagram                                 | `render` with `--format`, `--theme`, `--scale`                                                                              |
| A text brief to rebuild the diagram in another tool                                   | `npx -y azion-diagram prompt --input diagram.json`                                                                          |

## Workflow for a new diagram

1. **Frame the story.** Settle who starts the flow, which Azion products handle it in what order, and what the customer owns at the end. When the request is vague, make sensible assumptions and record them in `notes` rather than asking.
2. **Pick names and icons** from [references/naming.md](references/naming.md). Labels are official product names; the role goes in the subtitle. Don't trust the labels that `icons` prints for legacy icons.
3. **Write a spec.** Start from the closest file in `assets/specs/` (the six official templates) or write one from scratch. The format is in [references/model.md](references/model.md); placement and relationship rules are in [references/patterns.md](references/patterns.md).
4. **Compose** the spec:
   ```sh
   node <skill-dir>/scripts/compose.mjs spec.json --out diagram.json --force
   ```
   Warnings print as JSON on stderr: deprecated names, label/icon mismatches, wrong tones, lines through nodes, covered or overlapping labels, labels on arrowheads, lines that cut another line's bend, missing connection labels, missing notes. Fix each one in the spec and compose again. Errors (exit 1) mean the spec can't be laid out; the message names the fix. compose already straightens same-column connections and draws longer connections first.
5. **Validate and render a review image:**
   ```sh
   npx -y azion-diagram validate --input diagram.json
   npx -y azion-diagram render --input diagram.json --out review.png --scale 1 --force
   ```
6. **Review the image with the Read tool. Zero warnings is not done.** At `--scale 1` the PNG matches the canvas, so canvases up to 2000px wide display without shrinking; crop wider ones to inspect details. Check:
   - Every connection label is readable and clearly belongs to one line.
   - Branches stay attached at forks, and crossings read as crossings.
   - No crowded junctions or large empty areas; rebalance `row` values when needed.
   - The picture tells the architecture the user described, with nothing invented.

   Fix and repeat from step 4.

7. **Export and deliver:**
   ```sh
   npx -y azion-diagram render --input diagram.json --format svg,png --out-dir exports --force
   ```
   Deliver the spec, the JSON, and the exports. Say that the JSON or SVG opens in Diagram Studio through **Import diagram**, and list the assumptions from `notes`. For a diagram in another language, mention that the footer ("Request flow", "Async flow") is fixed English text.

## Rules that make it an Azion diagram

- **Official names only.** "Applications", "Functions", "Firewall", "Object Storage", "SQL Database", "KV Store", "AI Inference", "Orchestrator", "Edge DNS". Never "Edge Application", "Edge Functions", "Edge Storage", "edge nodes", "PoPs", or "Azion Edge Platform". Product names and `AZION PLATFORM` stay in English in every language; patterns.md says what else to translate.
- **Azion products are orange, everything else is gray.** compose.mjs infers `tone`: `azion` for Azion products, `neutral` for users, origins, and third parties. Use `accent` (violet) for at most one highlighted node.
- **One `AZION PLATFORM` boundary** holds the Azion products. Customer-owned parts get their own boundary named by ownership (`CONTENT SOURCES`, `YOUR BACKEND`). Users stay outside.
- **Left to right, solid for requests, dashed for async** (logs, events, streams).
- **Every connection has a short label** naming the operation or protocol (HTTPS, Query, Cache miss, Logs).
- **Only draw connections you can stand behind.** The relationships in patterns.md are verified; confirm anything else in the azion-kb MCP or the Azion docs, or leave it out and say so in `notes`. `validate` checks geometry, not architecture.
- **Never invent an icon.** Use exact catalog names; search with `npx -y azion-diagram icons --search <term>`.

## CLI pitfalls

The full reference (every command, its accepted flags, recipes, and an error-to-fix table) is in [references/cli.md](references/cli.md). The traps that bite most:

- Each command accepts only its own flags: `validate` takes `--input` alone, so `--theme` belongs on `render`.
- With `--out`, let the extension choose the format. `--format png --out diagram.svg` silently writes PNG bytes into a `.svg` file.
- `--out-dir` without `--format` renders SVG only; ask for `--format svg,png`.
- `--out-dir` names files `<id>.<format>`. `create --template` and Diagram Studio produce a UUID `id`; set a slug before exporting.
- Never use `--layout` or `layout` on a diagram with boundaries: they place nodes in plain rows and leave the boundaries behind, and `validate` doesn't notice.
- `render --theme` changes the export only, so one JSON can produce both themes.
- PNG needs a file destination; SVG and HTML can go to stdout.
- Outputs never overwrite existing files without `--force`.
- The CLI can't read SVG input. Use `compose.mjs --extract file.svg --out diagram.json` first.

## compose.mjs commands

| Command                                                  | Does                                           |
| -------------------------------------------------------- | ---------------------------------------------- |
| `compose.mjs spec.json [--out diagram.json] [--force]`   | Lays out a spec on the Azion grid and lints it |
| `compose.mjs --check diagram.json` (or `.svg`)           | Lints any diagram without changing it          |
| `compose.mjs --extract diagram.svg [--out diagram.json]` | Pulls the editable JSON out of an exported SVG |

All three accept `-` to read stdin and print JSON to stdout when `--out` is omitted.
