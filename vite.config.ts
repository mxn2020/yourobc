// vite.config.ts

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@/convex': '/convex',
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    // Nitro should be added for all environments (dev and production)
    // It will automatically detect Vercel when deployed
    nitro(),
    react(),
  ],
  build: {
    rollupOptions: {
      external: [
        'node:async_hooks',
        'node:stream',
        'node:stream/web',
        'path',
        'os',
        'fs',
        'fs/promises',
        '@prisma/client/runtime/library'
      ]
    }
  },
  ssr: {
    noExternal: ['better-auth'],
    external: ['@prisma/client']
  },
  optimizeDeps: {
    exclude: ['@prisma/client']
  },
  define: {
    global: 'globalThis',
  }
})