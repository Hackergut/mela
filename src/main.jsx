import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL || ''
// Always create a client when configured; the provider enables the reactive
// useConvexQuery/useConvexMutation hooks used by the storefront and admin.
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    {convex ? (
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
