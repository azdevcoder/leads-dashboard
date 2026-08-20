export const ACCESS_TOKEN_STORAGE_KEY = "leads-dashboard-access-token";

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
}

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {}
}

export function consumeAccessTokenFromHash() {
  if (typeof window === "undefined" || !window.location.hash) return;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get("access_token");
  if (!token) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } catch {}
  window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
}

export const startLogin = () => {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) throw new Error("A URL pública da API ainda não foi configurada.");
  window.location.assign(`${apiBaseUrl}/api/auth/github/login`);
};
