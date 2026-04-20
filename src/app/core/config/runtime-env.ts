export type RuntimeEnv = {
  API_BASE_URL?: string;
  SOCKET_BASE_URL?: string;
};

declare global {
  interface Window {
    __env?: RuntimeEnv;
  }
}

function normalizeBaseUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export function getRuntimeEnv(): Required<RuntimeEnv> {
  const env = typeof window !== 'undefined' ? window.__env : undefined;

  // Detect local dev: if running on localhost, default socket to localhost:3000
  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const productionBase = 'https://e-hrms-main-production.up.railway.app';
  const localBase = 'http://localhost:3000';

  const apiBase = normalizeBaseUrl(env?.API_BASE_URL) ??
    (isLocal ? `${localBase}/api` : `${productionBase}/api`);
  const socketBase = normalizeBaseUrl(env?.SOCKET_BASE_URL) ??
    (isLocal ? localBase : productionBase);

  return { API_BASE_URL: apiBase, SOCKET_BASE_URL: socketBase };
}


