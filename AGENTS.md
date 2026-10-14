# Repository Guidelines

## Project Structure & Module Organization

This repository contains Azion Diagram Studio, a Nuxt architecture diagram dashboard and standalone TypeScript CLI.

- `app/`: Vue pages, editor components, composables, and Tailwind styles.
- `packages/diagram-cli/src/core/`: shared diagram model, templates, validation, geometry, icons, and SVG renderer.
- `packages/diagram-cli/`: npm package, Node renderers, CLI tests, examples, and publishing instructions.
- `@aziontech/webkit`, `@aziontech/theme`, `@aziontech/icons` (npm): Azion design system; import components through their public exports. `src/webkit.css` is the single CSS entry, imported by `app/assets/main.css`.
- `references/`: original Azion, Cloudflare, and Vercel visuals; preserve them.
- `tests/`: Vitest regression tests. `docs/`: design decisions and reference analysis.

## Build, Test, and Development Commands

- `npm ci`: install dashboard dependencies.
- `npm run dev`: start Nuxt on `127.0.0.1:3000`.
- `npm run typecheck` and `npm test`: validate types and shared behavior.
- `npm run build`: production build; `npm run generate`: static output.
- `npm ci --prefix packages/diagram-cli`: install standalone dependencies.
- `npm run cli:test`: build and test the CLI; `npm run cli:pack`: prepare its npm archive.

## Architecture Diagram Design

Prioritize accurate relationships, readable flows, and clear hierarchy. Establish audience, scope, and assumptions. Verify product capabilities before adding connections.

Use labeled actors, services, storage, and deployment/trust boundaries. Label arrows with direction, operation, and relevant protocol. Distinguish asynchronous flows with dashed lines and a legend. Align to an 8px grid, minimize crossings, and split dense systems into overview and detail views.

## Azion Design System

Reuse local Webkit components, semantic tokens, Sora typography, and the dashboard's existing Proto Mono. Preserve original SVG proportions and namespace embedded IDs. Select exact catalog names; label `ai-edge-application` as Applications and `ai-edge-functions` as Functions. Use `pi-*` for generic infrastructure. Never invent icons or edit dependencies.

Keep exports portable with outlined text and embedded editable metadata. Retain license notices; the npm package bundles Sora and accepts an external licensed Proto Mono file.

## Coding Style & Testing

Use only JavaScript or TypeScript, never Python. Use two-space indentation, single quotes, and Prettier. Name Vue components in PascalCase and other files in kebab-case. Add meaningful regression tests for geometry and export changes; inspect real mouse interactions and exports for clipping, missing glyphs, and invalid connections.

## Commit & Pull Request Guidelines

No commit history exists. Use descriptive messages such as `feat(editor): add boundary resizing`. Include purpose, linked issues when applicable, screenshots, validation commands, and relevant assumptions in PRs. Never publish packages or deploy without user authorization.
