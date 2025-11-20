// src/test/setup.ts
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock environment variables for tests
vi.stubEnv('VITE_CONVEX_URL', 'https://test.convex.cloud')
vi.stubEnv('VITE_BETTER_AUTH_URL', 'http://localhost:3000')

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Add custom matchers or global test utilities here
expect.extend({
  // Example custom matcher for JWT validation
  toBeValidJWT(received: string) {
    const parts = received.split('.')
    const isValid = parts.length === 3

    return {
      message: () =>
        isValid
          ? `expected ${received} not to be a valid JWT`
          : `expected ${received} to be a valid JWT (format: header.payload.signature)`,
      pass: isValid,
    }
  },
})

// Extend Vitest matchers type
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidJWT(): T
  }
  interface AsymmetricMatchersContaining {
    toBeValidJWT(): any
  }
}

console.log('Test setup initialized ✓')
