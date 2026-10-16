import type { Diagram, DiagramNode, DiagramEdge, DiagramGroup, DiagramTemplate } from './types.js'
const n = (
  id: string,
  label: string,
  icon: string,
  x: number,
  y: number,
  subtitle = '',
  tone: DiagramNode['tone'] = 'azion'
): DiagramNode => ({ id, label, icon, x, y, subtitle, tone })
const e = (from: string, to: string, label: string, dashed = false): DiagramEdge => ({
  id: `${from}-${to}`,
  from,
  to,
  label,
  dashed,
})
const g = (
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number
): DiagramGroup => ({ id, label, x, y, width, height })
const defaults = {
  theme: 'dark' as const,
  grid: true,
  numbered: false,
  updatedAt: '',
  notes:
    'Conceptual architecture. Configure authentication, caching rules, and origin access for your workload.',
}
export const templates: DiagramTemplate[] = [
  {
    ...defaults,
    id: 'web-delivery',
    title: 'Secure web delivery',
    category: 'Delivery',
    difficulty: 'Starter',
    featured: true,
    description: 'Protect requests, cache content, and connect your origins through Azion.',
    nodes: [
      n('users', 'Users', 'pi-users', 48, 244, 'Web & mobile', 'neutral'),
      n('firewall', 'Firewall', 'ai-edge-firewall', 288, 244, 'Inspect requests'),
      n('app', 'Applications', 'ai-edge-application', 528, 244, 'Cache & route'),
      n('origin', 'Origin server', 'pi-server', 856, 140, 'Dynamic content', 'neutral'),
      n('storage', 'Object Storage', 'ai-edge-storage', 856, 348, 'Static assets'),
    ],
    edges: [
      e('users', 'firewall', 'HTTPS'),
      e('firewall', 'app', 'Allowed'),
      e('app', 'origin', 'Cache miss'),
      e('app', 'storage', 'Static assets'),
    ],
    groups: [
      g('azion', 'AZION PLATFORM', 248, 104, 472, 388),
      g('origins', 'CONTENT SOURCES', 816, 104, 248, 388),
    ],
  },
  {
    ...defaults,
    id: 'serverless-app',
    title: 'Full-stack application',
    category: 'Compute',
    difficulty: 'Intermediate',
    description: 'Run application logic with Functions and a distributed data layer.',
    nodes: [
      n('users', 'Browser', 'pi-desktop', 48, 244, 'Client', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 288, 244, 'Request routing'),
      n('fn', 'Functions', 'ai-edge-functions', 528, 244, 'Application logic'),
      n('sql', 'SQL Database', 'ai-edge-sql', 856, 140, 'Relational data'),
      n('kv', 'KV Store', 'ai-edge-kv', 856, 348, 'Application state'),
    ],
    edges: [
      e('users', 'app', 'HTTPS'),
      e('app', 'fn', 'Rules Engine'),
      e('fn', 'sql', 'Query'),
      e('fn', 'kv', 'Read / write'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 248, 104, 816, 388)],
  },
  {
    ...defaults,
    id: 'object-delivery',
    title: 'Media & object delivery',
    category: 'Storage',
    difficulty: 'Starter',
    description: 'Store assets once and deliver cached media to your users.',
    nodes: [
      n('users', 'Users', 'pi-users', 48, 244, 'Media consumers', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 320, 244, 'Cache & delivery'),
      n('storage', 'Object Storage', 'ai-edge-storage', 640, 244, 'Images & video'),
      n('upload', 'Upload service', 'pi-cloud', 896, 244, 'Your backend', 'neutral'),
    ],
    edges: [
      e('users', 'app', 'HTTPS'),
      e('app', 'storage', 'Cache miss'),
      e('upload', 'storage', 'Upload'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 272, 144, 544, 300)],
  },
  {
    ...defaults,
    id: 'api-security',
    title: 'API protection',
    category: 'Security',
    difficulty: 'Intermediate',
    description: 'Inspect API traffic before it reaches your application and origin.',
    nodes: [
      n('users', 'API clients', 'pi-code', 48, 140, 'REST / GraphQL', 'neutral'),
      n('bots', 'Automated traffic', 'pi-cog', 48, 348, 'Untrusted requests', 'neutral'),
      n('fw', 'Firewall', 'ai-edge-firewall', 328, 244, 'WAF rules'),
      n('app', 'Applications', 'ai-edge-application', 592, 244, 'Request routing'),
      n('api', 'API origin', 'pi-server', 896, 244, 'Your services', 'neutral'),
    ],
    edges: [
      e('users', 'fw', 'HTTPS'),
      e('bots', 'fw', 'Inspect'),
      e('fw', 'app', 'Allowed'),
      e('app', 'api', 'Forward'),
    ],
    groups: [g('azion', 'AZION SECURITY & DELIVERY', 280, 144, 504, 300)],
    notes:
      'Firewall inspection rejects disallowed requests. Only allowed traffic continues. Configure WAF policies and application authentication separately.',
  },
  {
    ...defaults,
    id: 'observability',
    title: 'Logs & observability',
    category: 'Observability',
    difficulty: 'Intermediate',
    description: 'Stream application and security events into your analytics tools.',
    nodes: [
      n('app', 'Applications', 'ai-edge-application', 96, 140, 'Request logs'),
      n('fw', 'Firewall', 'ai-edge-firewall', 96, 348, 'Security events'),
      n('stream', 'Data Stream', 'ai-data-stream', 464, 244, 'Collect & forward'),
      n('siem', 'Analytics / SIEM', 'pi-chart-line', 856, 140, 'Your destination', 'neutral'),
      n('archive', 'Log archive', 'pi-database', 856, 348, 'Storage endpoint', 'neutral'),
    ],
    edges: [
      e('app', 'stream', 'Logs', true),
      e('fw', 'stream', 'Events', true),
      e('stream', 'siem', 'Stream', true),
      e('stream', 'archive', 'Archive', true),
    ],
    groups: [
      g('azion', 'AZION PLATFORM', 48, 104, 640, 388),
      g('tools', 'YOUR OBSERVABILITY STACK', 816, 104, 248, 388),
    ],
    notes:
      'Configure Data Stream sources and a supported destination for each stream. Dashed arrows represent asynchronous log delivery.',
  },
  {
    ...defaults,
    id: 'multi-origin',
    title: 'Multi-origin architecture',
    category: 'Delivery',
    difficulty: 'Intermediate',
    description: 'Connect a single delivery layer to multiple origin environments.',
    nodes: [
      n('users', 'Users', 'pi-globe', 48, 244, 'Global audience', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 288, 244, 'Request routing'),
      n('lb', 'Load Balancer', 'ai-load-balancer', 528, 244, 'Origin selection'),
      n('cloud', 'Cloud origin', 'pi-cloud', 856, 140, 'Primary origin', 'neutral'),
      n('dc', 'Data center', 'pi-server', 856, 348, 'Secondary origin', 'neutral'),
    ],
    edges: [
      e('users', 'app', 'HTTPS'),
      e('app', 'lb', 'Origin request'),
      e('lb', 'cloud', 'Route'),
      e('lb', 'dc', 'Route'),
    ],
    groups: [
      g('azion', 'AZION PLATFORM', 248, 104, 472, 388),
      g('origins', 'ORIGIN ENVIRONMENTS', 816, 104, 248, 388),
    ],
    notes:
      'Logical origin-selection view. Configure origins, balancing policy, and health checks for the intended routing behavior.',
  },
  {
    ...defaults,
    id: 'static-site-hosting',
    title: 'Static site & SPA hosting',
    category: 'Storage',
    difficulty: 'Starter',
    description:
      'Serve a static site or SPA from Object Storage behind Firewall and cached Applications.',
    nodes: [
      n('users', 'Users', 'pi-users', 48, 244, 'Web & mobile', 'neutral'),
      n('firewall', 'Firewall', 'ai-edge-firewall', 288, 244, 'WAF rules'),
      n('app', 'Applications', 'ai-edge-application', 528, 244, 'Cache & route'),
      n('storage', 'Object Storage', 'ai-edge-storage', 856, 140, 'Site build'),
      n('fn', 'Functions', 'ai-edge-functions', 856, 348, 'API routes'),
    ],
    edges: [
      e('users', 'firewall', 'HTTPS'),
      e('firewall', 'app', 'Allowed'),
      e('app', 'storage', 'Static assets'),
      e('app', 'fn', 'Rules Engine'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 248, 104, 816, 388)],
    notes:
      'Conceptual architecture. Upload the site build to a bucket with any S3-compatible client, set the bucket as the Applications origin, and route API paths to Functions with Rules Engine. Configure WAF rules and cache policies for your workload.',
  },
  {
    ...defaults,
    id: 'user-uploads',
    title: 'User uploads with cached delivery',
    category: 'Storage',
    difficulty: 'Intermediate',
    description:
      'Authorize uploads in Functions, store files in Object Storage, and deliver them through the cache.',
    nodes: [
      n('users', 'Users', 'pi-users', 48, 140, 'Web & mobile', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 288, 140, 'Cache & route'),
      n('storage', 'Object Storage', 'ai-edge-storage', 528, 140, 'User files'),
      n('fn', 'Functions', 'ai-edge-functions', 528, 348, 'Authorize uploads'),
      n('kv', 'KV Store', 'ai-edge-kv', 856, 348, 'Sessions & quotas'),
    ],
    edges: [
      e('users', 'app', 'HTTPS'),
      e('app', 'storage', 'Cache miss'),
      e('app', 'fn', 'Uploads'),
      e('fn', 'storage', 'Write'),
      e('fn', 'kv', 'Check token'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 248, 104, 816, 388)],
    notes:
      'Conceptual architecture. Functions check the session or upload token and per-user quotas in KV Store before writing to the bucket; access logic lives in your function code. Applications serve published files from Object Storage with caching. Configure bucket permissions and cache policies for your workload.',
  },
  {
    ...defaults,
    id: 'read-heavy-api',
    title: 'Read-heavy API',
    category: 'Data',
    difficulty: 'Intermediate',
    description:
      'Answer API reads from KV Store first and fall back to SQL Database read replicas.',
    numbered: true,
    nodes: [
      n('clients', 'API clients', 'pi-code', 48, 244, 'Web & mobile apps', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 288, 244, 'Cache GET responses'),
      n('fn', 'Functions', 'ai-edge-functions', 528, 244, 'API logic'),
      n('kv', 'KV Store', 'ai-edge-kv', 856, 140, 'Hot-key cache'),
      n('sql', 'SQL Database', 'ai-edge-sql', 856, 348, 'Read replicas'),
    ],
    edges: [
      e('clients', 'app', 'HTTPS'),
      e('app', 'fn', 'Rules Engine'),
      e('fn', 'kv', 'Cache lookup'),
      e('fn', 'sql', 'Query on miss'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 248, 104, 816, 388)],
    notes:
      'Conceptual architecture. Functions look up hot keys in KV Store and query SQL Database on a miss, then write the result back with a TTL. SQL Database serves reads from replicas and writes go to the main instance. Configure cache policies and TTLs for your workload.',
  },
  {
    ...defaults,
    id: 'event-ingestion',
    title: 'Event ingestion & analytics',
    category: 'Data',
    difficulty: 'Intermediate',
    description:
      'Collect app and device events with Functions and store them in SQL Database for queries.',
    nodes: [
      n('sources', 'Apps & devices', 'pi-mobile', 48, 140, 'Event sources', 'neutral'),
      n('dashboard', 'Dashboard', 'pi-chart-bar', 48, 348, 'Your analytics UI', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 304, 244, 'Request routing'),
      n('fn', 'Functions', 'ai-edge-functions', 544, 244, 'Validate & ingest'),
      n('sql', 'SQL Database', 'ai-edge-sql', 856, 140, 'Event tables'),
      n('kv', 'KV Store', 'ai-edge-kv', 856, 348, 'Rate counters'),
    ],
    edges: [
      e('sources', 'app', 'Events'),
      e('dashboard', 'app', 'Queries'),
      e('app', 'fn', 'Rules Engine'),
      e('fn', 'sql', 'Read / write'),
      e('fn', 'kv', 'Increment'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 264, 104, 800, 388)],
    notes:
      'Conceptual architecture. Functions validate events, enforce per-source rate limits with KV Store counters, and insert rows into SQL Database; dashboards read through a query endpoint on the same Functions. Writes go to the main instance and reads can use replicas. Size batches and retention for your workload.',
  },
  {
    ...defaults,
    id: 'ai-agent-tools',
    title: 'AI agent with tools and memory',
    category: 'AI',
    difficulty: 'Intermediate',
    description:
      'Run an agent loop in Functions that calls AI Inference, uses your APIs as tools, and keeps memory in KV Store.',
    canvasWidth: 1424,
    nodes: [
      n('users', 'Users', 'pi-comments', 48, 244, 'Chat & apps', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 288, 244, 'Request routing'),
      n('agent', 'Functions', 'ai-edge-functions', 528, 244, 'Agent loop'),
      n('ai', 'AI Inference', 'ai-edge-ai', 856, 140, 'LLM & tool calls'),
      n('kv', 'KV Store', 'ai-edge-kv', 856, 348, 'Session memory'),
      n('tools', 'Tools & APIs', 'pi-wrench', 1184, 244, 'Your services', 'neutral'),
    ],
    edges: [
      e('agent', 'tools', 'Tool call'),
      e('users', 'app', 'HTTPS'),
      e('app', 'agent', 'Rules Engine'),
      e('agent', 'ai', 'Prompt'),
      e('agent', 'kv', 'Read / write'),
    ],
    groups: [
      g('azion', 'AZION PLATFORM', 248, 104, 800, 388),
      g('backend', 'YOUR BACKEND', 1144, 104, 232, 388),
    ],
    notes:
      'Conceptual architecture. The agent loop runs in Functions and calls AI Inference through its OpenAI-compatible API. KV Store keeps session memory. Define the tools, authentication, and memory retention for your workload.',
  },
  {
    ...defaults,
    id: 'ai-agent-rag',
    title: 'Secure AI agent with RAG',
    category: 'AI',
    difficulty: 'Intermediate',
    description:
      'Protect an agent behind Firewall and ground its answers in your documents with SQL Database vector search.',
    nodes: [
      n('users', 'Users', 'pi-users', 56, 140, 'Assistant clients', 'neutral'),
      n('fw', 'Firewall', 'ai-edge-firewall', 296, 140, 'WAF rules'),
      n('agent', 'Functions', 'ai-edge-functions', 536, 140, 'Agent & retrieval'),
      n('ai', 'AI Inference', 'ai-edge-ai', 864, 140, 'Embeddings & LLM'),
      n('sql', 'SQL Database', 'ai-edge-sql', 864, 348, 'Vector search'),
      n('docs', 'Object Storage', 'ai-edge-storage', 536, 348, 'Source documents'),
    ],
    edges: [
      e('users', 'fw', 'HTTPS'),
      e('fw', 'agent', 'Rules Engine'),
      e('agent', 'ai', 'Generate'),
      e('agent', 'sql', 'Query'),
      e('agent', 'docs', 'Read'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 256, 104, 800, 388)],
    notes:
      'Conceptual architecture. Source documents live in Object Storage; their embeddings, generated with AI Inference, are indexed in SQL Database vector search. Configure WAF rules, document ingestion, and access control for your workload.',
  },
  {
    ...defaults,
    id: 'ai-inference-api',
    title: 'Serverless inference API',
    category: 'AI',
    difficulty: 'Starter',
    description:
      'Serve an OpenAI-compatible model API through Firewall and Applications without managing GPUs.',
    nodes: [
      n('clients', 'API clients', 'pi-code', 104, 244, 'OpenAI-compatible SDK', 'neutral'),
      n('fw', 'Firewall', 'ai-edge-firewall', 344, 244, 'WAF rules'),
      n('app', 'Applications', 'ai-edge-application', 584, 244, 'Request routing'),
      n('ai', 'AI Inference', 'ai-edge-ai', 824, 244, 'LLMs & embeddings'),
    ],
    edges: [e('clients', 'fw', 'HTTPS'), e('fw', 'app', 'Allowed'), e('app', 'ai', 'Inference')],
    groups: [g('azion', 'AZION PLATFORM', 304, 104, 712, 388)],
    notes:
      'Conceptual architecture. AI Inference exposes an OpenAI-compatible API and scales without GPU clusters. Configure WAF rules, API authentication, and the models you serve.',
  },
  {
    ...defaults,
    id: 'ai-content-moderation',
    title: 'AI content moderation',
    category: 'AI',
    difficulty: 'Intermediate',
    description:
      'Screen user uploads with a vision model in AI Inference before Functions store approved media.',
    nodes: [
      n('users', 'Users', 'pi-images', 56, 244, 'Image uploads', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 296, 244, 'Upload routing'),
      n('fn', 'Functions', 'ai-edge-functions', 536, 244, 'Moderation logic'),
      n('ai', 'AI Inference', 'ai-edge-ai', 864, 140, 'Vision model'),
      n('storage', 'Object Storage', 'ai-edge-storage', 864, 348, 'Approved media'),
    ],
    edges: [
      e('users', 'app', 'Upload'),
      e('app', 'fn', 'Rules Engine'),
      e('fn', 'ai', 'Classify'),
      e('fn', 'storage', 'Write'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 256, 104, 800, 388)],
    notes:
      'Conceptual architecture. Functions send each upload to a vision language model in AI Inference, optionally adapted with LoRA, and store only approved media. Define moderation policies and review flows for your workload.',
  },
  {
    ...defaults,
    id: 'tiered-cache-offload',
    title: 'Tiered cache origin offload',
    category: 'Delivery',
    difficulty: 'Starter',
    description:
      'Add a Tiered Cache layer between Applications and your origin so fewer cache misses reach it.',
    nodes: [
      n('users', 'Users', 'pi-globe', 56, 244, 'Global audience', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 296, 244, 'Cache & TTLs'),
      n('tiered', 'Tiered Cache', 'ai-tiered-cache', 536, 244, 'Cache layer'),
      n('origin', 'Origin server', 'pi-server', 864, 244, 'Your content', 'neutral'),
    ],
    edges: [
      e('users', 'app', 'HTTPS'),
      e('app', 'tiered', 'Cache miss'),
      e('tiered', 'origin', 'Origin fetch'),
    ],
    groups: [
      g('azion', 'AZION PLATFORM', 256, 104, 472, 388),
      g('origins', 'CONTENT SOURCES', 824, 104, 232, 388),
    ],
    notes:
      'Conceptual architecture. Applications serve cached content with your TTLs and can serve stale content when the origin fails. Tiered Cache adds a cache layer for long-lived assets. Configure cache policies, cache keys, and origin access for your workload.',
  },
  {
    ...defaults,
    id: 'image-optimization',
    title: 'On-demand images from storage',
    category: 'Storage',
    difficulty: 'Starter',
    description:
      'Store original images once in Object Storage and deliver resized, converted variants with Image Processor.',
    nodes: [
      n('users', 'Users', 'pi-users', 104, 244, 'Web & mobile', 'neutral'),
      n('app', 'Applications', 'ai-edge-application', 344, 244, 'Cache & route'),
      n('images', 'Image Processor', 'pi-image', 584, 244, 'Resize & convert'),
      n('storage', 'Object Storage', 'ai-edge-storage', 824, 244, 'Original images'),
    ],
    edges: [
      e('users', 'app', 'HTTPS'),
      e('app', 'images', 'Transform'),
      e('images', 'storage', 'Read original'),
    ],
    groups: [g('azion', 'AZION PLATFORM', 304, 104, 712, 388)],
    notes:
      'Conceptual architecture. Image Processor runs as an Applications module and transforms images through URL parameters, including WebP and AVIF conversion. Processed variants are cached. Configure Rules Engine, image parameters, and cache policies for your workload.',
  },
  {
    ...defaults,
    id: 'real-user-monitoring',
    title: 'Real user monitoring',
    category: 'Observability',
    difficulty: 'Starter',
    description:
      'Collect latency and availability data from real sessions with Edge Pulse and query it from your dashboards.',
    nodes: [
      n('browsers', 'Browsers', 'pi-desktop', 56, 244, 'Edge Pulse tag', 'neutral'),
      n('pulse', 'Edge Pulse', 'ai-edge-pulse', 296, 244, 'Real user data'),
      n('api', 'API', 'ai-azion-api', 536, 244, 'GraphQL queries'),
      n('dash', 'Dashboards', 'pi-chart-line', 864, 244, 'Your analytics', 'neutral'),
    ],
    edges: [
      e('browsers', 'pulse', 'RUM data', true),
      e('pulse', 'api', 'Metrics', true),
      e('api', 'dash', 'Query results', true),
    ],
    groups: [
      g('azion', 'AZION PLATFORM', 256, 104, 472, 388),
      g('tools', 'YOUR OBSERVABILITY STACK', 824, 104, 232, 388),
    ],
    notes:
      'Conceptual architecture. The Edge Pulse JavaScript tag runs asynchronously in your pages and does not block loading. Query the collected navigation, latency, throughput, and availability data through the GraphQL API. Dashed arrows represent asynchronous data delivery.',
  },
]
export const categories = [
  'All templates',
  'Delivery',
  'Compute',
  'Storage',
  'Data',
  'AI',
  'Security',
  'Observability',
] as const
export function createDiagram(template?: DiagramTemplate): Diagram {
  const base = template
    ? JSON.parse(JSON.stringify(template))
    : {
        ...defaults,
        title: 'Untitled architecture',
        description: 'Describe your architecture.',
        category: 'Compute',
        nodes: [],
        edges: [],
        groups: [],
      }
  return { ...base, id: crypto.randomUUID(), updatedAt: new Date().toISOString() }
}
