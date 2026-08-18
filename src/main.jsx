import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// The backend is Convex. The app talks to it over HTTP via the adapter in
// src/api/functions.js (configured through VITE_CONVEX_URL). A ConvexProvider
// is not required because the storefront uses HTTP actions/queries rather than
// the reactive React hooks — this keeps Vercel builds independent of
// `convex/_generated` until a deployment is linked with `npx convex dev`.

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
