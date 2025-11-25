// src/routes/api/settings/ai.ts

import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/generated/api';

export const Route = createFileRoute('/api/settings/ai')({
  server: {
    handlers: {
      GET: handleGetAISettings,
    },
  },
})

async function handleGetAISettings({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || "http://localhost:3210")

    // Get AI settings from Convex
    const settings = await convex.query(api.lib.system.app.app_settings.queries.getAISettings, {})

    return Response.json(settings)
  } catch (error) {
    console.error('Failed to fetch AI settings:', error)

    // Return defaults if query fails
    return Response.json({
      defaultModel: 'openai/gpt-4o-mini',
      maxTokensDefault: 1000,
      temperatureDefault: 0.7,
      enableAILogging: true
    })
  }
}
