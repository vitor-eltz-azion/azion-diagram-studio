<script setup lang="ts">
import CardBox from '@aziontech/webkit/card-box'
import Link from '@aziontech/webkit/link'
import Item from '@aziontech/webkit/item'
definePageMeta({ title: 'Design guidelines' })
const follow = useSpaNavigation()
const references = [
  {
    id: 'kit-1',
    reference: 'Azion Diagram Kit.png',
    lesson: 'Separate physical infrastructure from logical layers. Use labeled, nested boundaries.',
  },
  {
    id: 'kit-2',
    reference: 'Azion Diagram Kit 2.png',
    lesson:
      'Use thin solid primary flows, dashed secondary flows, and orange for Azion. Number only when sequence matters.',
  },
  {
    id: 'codex',
    reference: 'Codex Image Sep 11, 2026, 02_17_15 PM.png',
    lesson:
      'Group security controls by responsibility. Replace dense unlabeled routing with smaller focused views.',
  },
  {
    id: 'byo',
    reference: 'BYO-sandbox.cc63egyA.svg',
    lesson:
      'Repeat component patterns for isolated environments. Label control and preview flows separately.',
  },
  {
    id: 'ai-platform',
    reference: 'ai-platform-sandbox.DziHb_r3.svg',
    lesson:
      'Keep tenant boundaries visible. Adapt the structure without assuming equivalent Azion sandbox services.',
  },
  {
    id: 'vibe-plat',
    reference: 'cf-vibe-plat.hdatWAqi.svg',
    lesson: 'Tell one left-to-right story and separate generation, execution, and deployment.',
  },
  {
    id: 'event',
    reference: 'pushed-based-event-notification.NdMYExDK.svg',
    lesson:
      'Use labeled arrows and numbered steps for event pipelines; distinguish asynchronous delivery.',
  },
  {
    id: 'r2',
    reference: 'r2-multi-cloud.jB-KW29c.svg',
    lesson:
      'Show ownership boundaries between platform, cloud provider, and on-premises infrastructure.',
  },
  {
    id: 'analytics',
    reference: 'vibe-hosting-analytics.udVLDrQc.svg',
    lesson: 'Separate application execution from telemetry and external destinations.',
  },
  {
    id: 'overview',
    reference: 'vibe-hosting-overview.ZFFcirO4.svg',
    lesson:
      'Repeat application units consistently and nest data resources inside their owning application.',
  },
  {
    id: 'workflow',
    reference: 'workflow-diagram-dark.avif',
    lesson: 'Use restrained dark surfaces, subtle borders, and clear parent-to-child branching.',
  },
]
const swatches = [
  { token: '--primary', label: 'Primary' },
  { token: '--bg-surface', label: 'Surface' },
  { token: '--border-default', label: 'Border' },
  { token: '--text-default', label: 'Text' },
]
const products = [
  {
    label: 'Applications',
    href: 'https://www.azion.com/en/documentation/products/build/applications/',
  },
  { label: 'Functions', href: 'https://www.azion.com/en/products/functions/' },
  {
    label: 'SQL Database',
    href: 'https://www.azion.com/en/documentation/products/store/sql-database/',
  },
]
</script>
<template>
  <div class="layout-column-content layout-boundary flex min-w-0 flex-col">
    <header class="flex flex-col gap-(--spacing-xs)">
      <h1 class="text-heading-md text-balance text-(--text-default)">Design guidelines</h1>
      <p class="text-body-md text-pretty text-(--text-muted)">
        How to draw architecture diagrams in the Azion style.
      </p>
    </header>
    <div class="layout-section-start flex flex-col gap-(--layout-section-gap)">
      <section class="flex flex-col gap-(--spacing-sm)" aria-labelledby="guide-structure">
        <h2 id="guide-structure" class="px-(--spacing-xs) text-heading-xxs text-(--text-default)">
          Structure
        </h2>
        <CardBox>
          <template #content>
            <div class="guide-prose">
              <p>
                One diagram tells one story. Define the audience and the level of detail, start with
                the actors, show how requests move through Azion, and finish at the data or origin
                layer.
              </p>
              <ul>
                <li>Use labeled boundaries for platform, trust, and ownership.</li>
                <li>Align nodes to an 8px grid and keep component sizes equal.</li>
                <li>Keep connectors clear of labels and unrelated components.</li>
                <li>Split complex systems into an overview and detail diagrams.</li>
              </ul>
            </div>
          </template>
        </CardBox>
      </section>
      <section class="flex flex-col gap-(--spacing-sm)" aria-labelledby="guide-type">
        <h2 id="guide-type" class="px-(--spacing-xs) text-heading-xxs text-(--text-default)">
          Typography
        </h2>
        <CardBox>
          <template #content>
            <div class="grid gap-(--spacing-lg) sm:grid-cols-2">
              <div class="flex flex-col gap-(--spacing-xs)">
                <span class="text-heading-xl text-(--text-default)">Sora</span>
                <p class="text-body-sm text-(--text-muted)">
                  Headings, node labels, and interface text.
                </p>
              </div>
              <div class="flex flex-col gap-(--spacing-xs)">
                <span
                  class="text-heading-xl font-(family-name:--font-display) text-(--text-default)"
                  >Proto Mono</span
                >
                <p class="text-body-sm text-(--text-muted)">
                  Boundary names, overlines, and technical labels.
                </p>
              </div>
            </div>
          </template>
        </CardBox>
      </section>
      <section class="flex flex-col gap-(--spacing-sm)" aria-labelledby="guide-color">
        <h2 id="guide-color" class="px-(--spacing-xs) text-heading-xxs text-(--text-default)">
          Color and flows
        </h2>
        <CardBox>
          <template #content>
            <div class="guide-prose">
              <p>
                Use the Webkit semantic theme tokens. Reserve orange for Azion services and flows,
                and keep text and line style as cues alongside color.
              </p>
              <ul class="swatches" aria-label="Theme tokens">
                <li v-for="swatch in swatches" :key="swatch.token">
                  <span class="swatch" :style="{ background: `var(${swatch.token})` }" />
                  <span>{{ swatch.label }}</span>
                  <code>{{ swatch.token }}</code>
                </li>
              </ul>
              <ul>
                <li>Solid arrows show request or data flow.</li>
                <li>Dashed arrows show asynchronous or secondary flow.</li>
                <li>Arrowheads show direction. Labels describe the operation.</li>
              </ul>
            </div>
          </template>
        </CardBox>
      </section>
      <section class="flex flex-col gap-(--spacing-sm)" aria-labelledby="guide-icons">
        <h2 id="guide-icons" class="px-(--spacing-xs) text-heading-xxs text-(--text-default)">
          Icons and exports
        </h2>
        <CardBox>
          <template #content>
            <div class="guide-prose">
              <p>
                Use the exact Webkit SVG icon for each product. Current product labels can differ
                from legacy icon file names.
              </p>
              <ul>
                <li><code>ai-edge-application</code> is labeled Applications.</li>
                <li><code>ai-edge-functions</code> is labeled Functions.</li>
                <li><code>ai-edge-storage</code> is labeled Object Storage.</li>
                <li>SVG and HTML exports embed vector paths. PNG supports up to 3× resolution.</li>
                <li>Save diagrams to keep text, nodes, and connections editable.</li>
              </ul>
              <Link
                href="/icons"
                label="Browse the icon library"
                size="medium"
                :show-icon="false"
                @click="(event: MouseEvent) => follow(event, '/icons')"
              />
            </div>
          </template>
        </CardBox>
      </section>
      <section class="flex flex-col gap-(--spacing-sm)" aria-labelledby="guide-references">
        <h2 id="guide-references" class="px-(--spacing-xs) text-heading-xxs text-(--text-default)">
          Reference study
        </h2>
        <p class="px-(--spacing-xs) text-body-sm text-pretty text-(--text-muted)">
          Eleven Azion, Cloudflare, and Vercel references informed the composition. Product names,
          component artwork, theme tokens, and fonts come from Azion Webkit.
        </p>
        <CardBox :padded="false">
          <template #content>
            <Item.List>
              <Item v-for="row in references" :key="row.id" size="small" role="listitem">
                <Item.Content>
                  <Item.Title>{{ row.lesson }}</Item.Title>
                  <Item.Description>{{ row.reference }}</Item.Description>
                </Item.Content>
              </Item>
            </Item.List>
          </template>
        </CardBox>
      </section>
      <section class="flex flex-col gap-(--spacing-sm)" aria-labelledby="guide-accuracy">
        <h2 id="guide-accuracy" class="px-(--spacing-xs) text-heading-xxs text-(--text-default)">
          Architecture accuracy
        </h2>
        <CardBox>
          <template #content>
            <div class="guide-prose">
              <p>
                Templates are a starting point. Review the assumptions for the actual workload and
                set authentication, origin access, caching policies, and stream destinations
                explicitly. Templates show logical relationships, not deployment configuration.
              </p>
              <ul class="flex flex-wrap gap-(--spacing-md)" aria-label="Product documentation">
                <li v-for="product in products" :key="product.href" class="list-none">
                  <Link :href="product.href" :label="product.label" size="medium" target="_blank" />
                </li>
              </ul>
            </div>
          </template>
        </CardBox>
      </section>
    </div>
  </div>
</template>
