// frontend/lib/api.ts
'use client';

import axios, {
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

/* ------------ cookie helpers (tanpa regex) ------------ */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const raw = document.cookie || '';
  if (!raw) return undefined;
  const parts = raw.split('; ');
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = part.slice(0, eq);
    const v = part.slice(eq + 1);
    if (k === name) return decodeURIComponent(v);
  }
  return undefined;
}

function setCookie(name: string, value?: string, days = 7) {
  if (typeof document === 'undefined') return;
  if (!value) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

/* ------------ axios instance ------------ */
export const api = axios.create({ baseURL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getCookie('jwt');

  if (!config.headers) {
    config.headers = new AxiosHeaders() as unknown as AxiosRequestHeaders;
  }
  if (!(config.headers as any).set) {
    config.headers = new AxiosHeaders(
      config.headers as AxiosRequestHeaders
    ) as unknown as AxiosRequestHeaders;
  }
  if (token) {
    (config.headers as unknown as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== 'undefined' && err?.response?.status === 401) {
      // token invalid/expired -> hapus cookie & arahkan login dengan next=...
      setCookie('jwt', undefined);
      const cb = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?next=${cb}`;
    }
    return Promise.reject(err);
  }
);

/* Setter utk simpan/hapus token dari FE */
export function setToken(token?: string) {
  setCookie('jwt', token);
}
