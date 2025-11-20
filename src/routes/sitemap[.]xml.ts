// src/routes/sitemap[.].xml.ts

import { createFileRoute } from '@tanstack/react-router'
import { I18N_CONFIG, getEnabledLocales } from '@/features/boilerplate/i18n'

const routes = [
  '/',
  '/dashboard',
  '/projects',
  '/projects/tasks',
  '/projects/team',
  '/projects/timeline',
  '/blog',
  '/auth/login',
  '/auth/signup',
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const baseUrl = process.env.VITE_BASE_URL || 'https://yourdomain.com'
        const enabledLocales = getEnabledLocales()

        // Routes are always under /$locale/ directory structure
        // Create URLs for each enabled locale
        const urls = routes
          .flatMap((path) =>
            enabledLocales.map((locale) => {
              const url = `${baseUrl}/${locale}${path === '/' ? '' : path}`
              const alternates = enabledLocales
                .map(
                  (alt) =>
                    `      <xhtml:link rel="alternate" hreflang="${alt}" href="${baseUrl}/${alt}${path === '/' ? '' : path}"/>`
                )
                .join('\n')

              return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
${alternates}
  </url>`
            })
          )
          .join('\n')

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})