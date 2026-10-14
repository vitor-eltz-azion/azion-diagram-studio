import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-11',
  ssr: false,
  devtools: { enabled: false },
  // Nuxt's global CSS is its app entry: the icon font loads once as a side effect, and
  // main.css pulls src/webkit.css (theme + webkit @source) into the single Tailwind root.
  css: ['@aziontech/icons', '~/assets/main.css'],
  vite: {
    plugins: [tailwindcss()],
    // Webkit ships source. Pre-bundling it splits module singletons such as the toast store
    // (toast() and the Toaster would hold different stacks), so it is served unbundled.
    optimizeDeps: { exclude: ['@aziontech/webkit'] },
  },
  app: { head: {
    title: 'Diagram Studio · Azion',
    // data-theme is owned by the pre-paint script below and useStudio, not by head management.
    htmlAttrs: { lang: 'en' },
    meta: [{ name: 'description', content: 'Design, edit, and export Azion system architecture diagrams.' }],
    link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    // Apply the saved theme before first paint (useStudio keeps it current afterwards).
    script: [{
      tagPosition: 'head',
      innerHTML: "try{var t=localStorage.getItem('azion-diagram-studio.theme')||'dark';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}"
    }]
  } },
  typescript: { strict: true }
})
