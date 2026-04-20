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
  const apiBase = normalizeBaseUrl(env?.API_BASE_URL) ?? 'https://e-hrms-main-production.up.railway.app/api';
  const socketBase = normalizeBaseUrl(env?.SOCKET_BASE_URL) ?? 'https://e-hrms-main-production.up.railway.app';
  return { API_BASE_URL: apiBase, SOCKET_BASE_URL: socketBase };
}

