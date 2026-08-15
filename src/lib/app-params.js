const isBrowser = typeof window !== 'undefined';

/** @type {Storage} */
const memoryStorage = {
  get length() { return 0; },
  clear() {},
  getItem() { return null; },
  key() { return null; },
  removeItem() {},
  setItem() {},
};

let storage = memoryStorage;
if (isBrowser) {
  try {
    storage = window.localStorage;
  } catch {
    // Sandboxed previews and privacy-restricted browsers may deny storage.
    storage = memoryStorage;
  }
}

const toSnakeCase = (str) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (!isBrowser) return defaultValue;

  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);

  if (removeFromUrl) {
    urlParams.delete(paramName);
    const query = urlParams.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  try {
    if (searchParam) {
      storage.setItem(storageKey, searchParam);
      return searchParam;
    }
    if (defaultValue) {
      storage.setItem(storageKey, defaultValue);
      return defaultValue;
    }
    return storage.getItem(storageKey);
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
    return searchParam || defaultValue || null;
  }
};

const getAppParams = () => {
  if (getAppParamValue('clear_access_token') === 'true') {
    try {
      storage.removeItem('base44_access_token');
      storage.removeItem('token');
    } catch {
      // Nothing to clear when storage is unavailable.
    }
  }

  return {
    appId: getAppParamValue('app_id', { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
    token: getAppParamValue('access_token', { removeFromUrl: true }),
    fromUrl: getAppParamValue('from_url', { defaultValue: isBrowser ? window.location.href : '' }),
    functionsVersion: getAppParamValue('functions_version', { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
    appBaseUrl: getAppParamValue('app_base_url', { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
  };
};

export const appParams = getAppParams();
