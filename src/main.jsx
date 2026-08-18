import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

// Convex deployment URL (Vercel → VITE_CONVEX_URL). When absent, the app still
// renders with empty data so previews do not crash.
const convexUrl = import.meta.env.VITE_CONVEX_URL || ''
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
