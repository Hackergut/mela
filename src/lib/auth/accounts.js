const SESSION_KEY = "tm_session";
const ACCOUNTS_KEY = "tm_accounts";
const RESETS_KEY = "tm_password_resets";

function emitAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("tm-auth"));
}

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function bytesToHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(bytes = 16) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return bytesToHex(array);
}

export async function hashPassword(password, salt) {
  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return bytesToHex(digest);
}

export function publicUser(account) {
  if (!account) return null;
  return {
    id: account.id,
    email: account.email,
    name: account.name || account.email.split("@")[0],
    picture: account.picture || "",
    provider: account.provider || "password",
  };
}

export function readSession() {
  if (typeof window === "undefined") return null;
  const session = readJson(SESSION_KEY, null);
  return session?.email ? session : null;
}

export function writeSession(user) {
  writeJson(SESSION_KEY, publicUser(user));
  emitAuthChange();
  return publicUser(user);
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
  emitAuthChange();
}

function listAccounts() {
  const list = readJson(ACCOUNTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

function saveAccounts(list) {
  writeJson(ACCOUNTS_KEY, list);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/**
 * @param {{ email?: string, password?: string, name?: string }} [input]
 */
export async function registerAccount(input = {}) {
  const { email, password, name } = input;
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) throw new Error("Inserisci un'email valida");
  if (String(password || "").length < 6) throw new Error("La password deve avere almeno 6 caratteri");
  const accounts = listAccounts();
  if (accounts.some((account) => account.email === normalized)) {
    throw new Error("Esiste già un account con questa email");
  }
  const salt = randomHex(16);
  const account = {
    id: `usr_${randomHex(8)}`,
    email: normalized,
    name: String(name || normalized.split("@")[0]).trim(),
    password_hash: await hashPassword(password, salt),
    salt,
    provider: "password",
    created_at: new Date().toISOString(),
  };
  saveAccounts([...accounts, account]);
  return writeSession(account);
}

/**
 * @param {{ email?: string, password?: string }} [input]
 */
export async function loginAccount(input = {}) {
  const { email, password } = input;
  const normalized = normalizeEmail(email);
  const account = listAccounts().find((item) => item.email === normalized);
  if (!account || account.provider === "google") throw new Error("Email o password non validi");
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.password_hash) throw new Error("Email o password non validi");
  return writeSession(account);
}

export function loginGoogleProfile(profile) {
  const email = normalizeEmail(profile?.email);
  if (!email) throw new Error("Google non ha restituito un'email");
  const accounts = listAccounts();
  let account = accounts.find((item) => item.email === email);
  if (!account) {
    account = {
      id: profile.sub ? `g_${profile.sub}` : `usr_${randomHex(8)}`,
      email,
      name: String(profile.name || email.split("@")[0]).trim(),
      picture: profile.picture || "",
      provider: "google",
      created_at: new Date().toISOString(),
    };
    saveAccounts([...accounts, account]);
  } else {
    account = {
      ...account,
      name: profile.name || account.name,
      picture: profile.picture || account.picture,
      provider: account.provider === "password" ? "password" : "google",
    };
    saveAccounts(accounts.map((item) => (item.email === email ? account : item)));
  }
  return writeSession(account);
}

export function requestPasswordReset(email) {
  const normalized = normalizeEmail(email);
  const account = listAccounts().find((item) => item.email === normalized && item.provider !== "google");
  if (!account) return null;
  const token = randomHex(24);
  const resets = readJson(RESETS_KEY, {});
  resets[token] = { email: normalized, exp: Date.now() + 60 * 60 * 1000 };
  writeJson(RESETS_KEY, resets);
  return token;
}

export async function resetPasswordWithToken(token, newPassword) {
  if (String(newPassword || "").length < 6) throw new Error("La password deve avere almeno 6 caratteri");
  const resets = readJson(RESETS_KEY, {});
  const entry = resets[String(token || "")];
  if (!entry || entry.exp < Date.now()) throw new Error("Link di reset non valido o scaduto");
  const accounts = listAccounts();
  const account = accounts.find((item) => item.email === entry.email);
  if (!account) throw new Error("Account non trovato");
  const salt = randomHex(16);
  account.salt = salt;
  account.password_hash = await hashPassword(newPassword, salt);
  saveAccounts(accounts);
  delete resets[token];
  writeJson(RESETS_KEY, resets);
  return true;
}
