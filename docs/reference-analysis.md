# Diagram reference analysis

All 11 original references were inspected visually. Originals remain unchanged under `references/`; paths in the table are relative to that directory.

| Reference | Composition and lesson | Application in Diagram Studio |
| --- | --- | --- |
| Azion-Old-Diagram-References/Azion Diagram Kit.png | Physical layers contain logical layers; infrastructure boundaries use thin gray rectangles. | Editable labeled platform and origin groups. |
| Azion-Old-Diagram-References/Azion Diagram Kit 2.png | Primary solid, secondary dashed, Azion orange arrows; optional numbered steps. | Solid/dashed connectors, arrowheads, optional numbering. |
| Azion-Old-Diagram-References/Codex Image Sep 11, 2026, 02_17_15 PM.png | Security stages grouped by visibility, protection, governance; dense routing and repeated numbers reduce clarity. | Focused API protection template; unique ordered flow numbers. |
| Cloudflare-Diagram-References/BYO-sandbox.cc63egyA.svg | Repeated tenant boxes and a distinct control plane. | Consistent node grammar and nested boundaries; no unsupported Azion container equivalence. |
| Cloudflare-Diagram-References/ai-platform-sandbox.DziHb_r3.svg | Isolated execution units; preview and control flows separated. | Explicit flow labels and ownership boundaries. |
| Cloudflare-Diagram-References/cf-vibe-plat.hdatWAqi.svg | Broad generation-to-deployment story with left-to-right progression. | Gallery featured composition with an obvious request journey. |
| Cloudflare-Diagram-References/pushed-based-event-notification.NdMYExDK.svg | Numbered event pipeline with named domain groups. | Optional numbering and asynchronous observability flows; no invented storage-trigger feature. |
| Cloudflare-Diagram-References/r2-multi-cloud.jB-KW29c.svg | Hub-and-spoke pattern, external-provider ownership boundaries. | Multi-origin architecture with external cloud/data-center components. |
| Cloudflare-Diagram-References/vibe-hosting-analytics.udVLDrQc.svg | Telemetry is separated from execution and external tooling. | Logs & observability template. |
| Cloudflare-Diagram-References/vibe-hosting-overview.ZFFcirO4.svg | Repeated application units contain related storage resources. | Full-stack application with Functions, SQL Database, and KV Store. |
| Vercel-Diagram-References/workflow-diagram-dark.avif | Low-contrast dark panels; thin borders; clear fan-out. | Dark default canvas, restrained borders, orthogonal branching. |

## Authoritative Azion assets

- `webkit/packages/theme/dist/v4/globals.css`: current Tailwind v4 tokens, light/dark semantics, Sora sans and Proto Mono display typography.
- `webkit/apps/fonts/`: local typefaces, overriding remote font URLs for offline use.
- `webkit/packages/icons/src/svg-raw/{ai,pi}/`: original vector geometry. Legacy filenames map to current labels.
- `webkit/packages/webkit/src/components/`: actual Button, IconButton, InputText, Tag, and Brand components, imported via public exports mapped to this checkout.
- Dashboard-exported text is outlined using original Sora and Proto Mono font files for consistent rendering without installed fonts. The saved diagram model retains editable text.

## Product relationships

Templates are conceptual starting points and preserve explicit architecture notes. Applications can use cloud servers or Object Storage origins ([Applications documentation](https://www.azion.com/en/documentation/products/build/applications/)). Functions integrate with Applications and can access SQL, KV, and storage ([Functions](https://www.azion.com/en/products/functions/)). SQL can be queried through Functions ([SQL Database](https://www.azion.com/en/documentation/products/store/sql-database/)). Observability flow destinations must be configured for the chosen Data Stream source ([Data Stream](https://assets.azion.com/en/products/data-stream/)). No competitor sandbox/queue feature was relabeled as an Azion product.
