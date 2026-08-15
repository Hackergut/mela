import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const unavailableError = () => new Error(
  'Base44 non è configurato per questa anteprima. Avvia l’app da Base44 o imposta VITE_BASE44_APP_ID.',
);

// A recursive callable proxy preserves the SDK's fluent surface in standalone
// previews without creating a malformed client that performs requests with a
// null app id. Any accidentally invoked operation fails predictably and can be
// handled by the calling screen.
const createUnavailableClient = () => {
  /** @type {any} */
  let proxy;
  const target = () => Promise.reject(unavailableError());
  proxy = new Proxy(target, {
    apply: () => Promise.reject(unavailableError()),
    get: (_target, property) => {
      if (property === 'isConfigured') return false;
      if (property === 'then') return undefined;
      return proxy;
    },
  });
  return proxy;
};

export const base44 = appId
  ? createClient({
    appId,
    token,
    functionsVersion,
    serverUrl: '',
    requiresAuth: false,
    appBaseUrl,
  })
  : createUnavailableClient();
