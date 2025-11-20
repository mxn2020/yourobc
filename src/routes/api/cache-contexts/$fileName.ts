// src/routes/api/cache-contexts/$fileName.ts
import { createFileRoute } from '@tanstack/react-router'
import { promises as fs } from 'fs'
import path from 'path'

export const Route = createFileRoute('/api/cache-contexts/$fileName')({
  server: {
    handlers: {
      GET: handleGetCacheContext,
    },
  },
})

async function handleGetCacheContext({ params }: { params: { fileName: string } }) {
  const { fileName } = params

  // Security: only allow specific MD files
  const allowedFiles = ['comprehensive-api-docs.md', 'large-codebase.md']

  if (!allowedFiles.includes(fileName)) {
    return Response.json({ error: 'File not found' }, { status: 404 })
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'cache-contexts', fileName)
    const content = await fs.readFile(filePath, 'utf-8')

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error(`Failed to read file ${fileName}:`, error)
    return Response.json({ error: 'Failed to read file' }, { status: 500 })
  }
}
