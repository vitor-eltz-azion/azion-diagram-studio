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
]
export const categories = [
  'All templates',
  'Delivery',
  'Compute',
  'Storage',
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
