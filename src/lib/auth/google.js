/** @returns {Record<string, string | undefined>} */
function viteEnv() {
  try {
    return /** @type {Record<string, string | undefined>} */ (import.meta.env || {});
  } catch {
    return {};
  }
}

export function googleClientId() {
  return String(viteEnv().VITE_GOOGLE_CLIENT_ID || "").trim();
}

export function isGoogleAuthConfigured() {
  return Boolean(googleClientId());
}

function loadGis() {
  if (typeof window === "undefined") return Promise.reject(new Error("Google disponibile solo nel browser"));
  /** @type {any} */
  const w = window;
  if (w.google?.accounts?.oauth2) return Promise.resolve(w.google);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-tm-gis]");
    if (existing) {
      existing.addEventListener("load", () => resolve(w.google), { once: true });
      existing.addEventListener("error", () => reject(new Error("Impossibile caricare Google")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.tmGis = "1";
    script.onload = () => resolve(w.google);
    script.onerror = () => reject(new Error("Impossibile caricare Google Identity Services"));
    document.head.appendChild(script);
  });
}

export async function requestGoogleProfile() {
  const clientId = googleClientId();
  if (!clientId) {
    throw new Error("Google OAuth non è configurato. Imposta VITE_GOOGLE_CLIENT_ID su Vercel (Client ID Web di Google Cloud).");
  }
  const google = await loadGis();
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        try {
          const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          if (!profileRes.ok) throw new Error("Google non ha confermato l'identità");
          resolve(await profileRes.json());
        } catch (error) {
          reject(error);
        }
      },
    });
    client.requestAccessToken({ prompt: "select_account" });
  });
}
