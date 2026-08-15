import base44 from '@base44/vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// The Base44 plugin adds its API proxy and editor bridge when the application
// is launched by Base44. Standalone previews do not have those launch values;
// omitting the bridge there prevents sandbox-only scripts from interfering
// with the storefront while the SDK continues to work once configured.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hasBase44Configuration = Boolean(
    env.VITE_BASE44_APP_ID || env.VITE_BASE44_APP_BASE_URL,
  );

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
    },
    plugins: [
      ...(hasBase44Configuration
        ? [base44({
          legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
          hmrNotifier: true,
          navigationNotifier: true,
          analyticsTracker: true,
          visualEditAgent: true,
        })]
        : []),
      react(),
    ],
  };
});
