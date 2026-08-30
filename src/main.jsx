import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL || ''

/**
 * Storage adapter for Convex Auth that never throws when the browser blocks
 * `localStorage` (sandboxed previews, third-party cookies disabled, privacy
 * modes). Without this, `ConvexAuthProvider` reads `window.localStorage`
 * during render and a denylisted storage access crashes the whole app with
 * the "Store non disponibile" boundary.
 */
function safeAuthStorage() {
  let backend = null
  try {
    backend = window.localStorage
  } catch {
    backend = null
  }
  const memory = new Map()
  const read = (key) => {
    try {
      const value = backend?.getItem(key)
      if (value !== null && value !== undefined) return value
    } catch {
      /* fall through to in-memory */
    }
    return memory.has(key) ? memory.get(key) : null
  }
  return {
    get length() {
      try { return backend?.length ?? memory.size } catch { return memory.size }
    },
    clear() {
      try { backend?.clear() } catch { /* blocked */ }
      memory.clear()
    },
    getItem: read,
    setItem(key, value) {
      const text = String(value)
      try { backend?.setItem(key, text) } catch { /* blocked */ }
      memory.set(key, text)
    },
    removeItem(key) {
      try { backend?.removeItem(key) } catch { /* blocked */ }
      memory.delete(key)
    },
    key(index) {
      try {
        const value = backend?.key(index)
        if (value !== null && value !== undefined) return value
      } catch {
        /* fall through to in-memory */
      }
      return [...memory.keys()][index] ?? null
    },
  }
}

// Always create a client when configured; the provider enables the reactive
// useConvexQuery/useConvexMutation hooks used by the storefront and admin.
let convex = null
if (convexUrl) {
  try {
    convex = new ConvexReactClient(convexUrl)
  } catch (error) {
    console.error('Convex client init failed:', error)
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    {convex ? (
      <ConvexAuthProvider client={convex} storage={safeAuthStorage()}>
        <App convexAuthEnabled />
      </ConvexAuthProvider>
    ) : (
      <App convexAuthEnabled={false} />
    )}
  </React.StrictMode>,
)
