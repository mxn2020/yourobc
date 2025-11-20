// src/routes/api/auth/$.ts
import { auth } from '@/features/boilerplate/auth/server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: handleAuthGet,
      POST: handleAuthPost,
    },
  },
})

function handleAuthGet({ request }: { request: Request }) {
  return auth.handler(request)
}

function handleAuthPost({ request }: { request: Request }) {
  return auth.handler(request)
}
