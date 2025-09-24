// frontend/lib/auth.ts
'use client';
import { create } from 'zustand';
import { api, setToken } from './api';

function setCookie(name: string, value: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

type AuthState = {
  token?: string;
  login: (username: string, password: string) => Promise<string>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: undefined,

  async login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    const jwt: string = data?.accessToken;
    if (!jwt) throw new Error('No token returned');
    setCookie('jwt', jwt, 7);
    localStorage.setItem('jwt', jwt);
    setToken(jwt);
    set({ token: jwt });
    return jwt;
  },

  async register(email, username, password) {
    await api.post('/auth/register', { email, username, password });
  },

  logout() {
    deleteCookie('jwt');
    localStorage.removeItem('jwt');
    setToken(undefined);
    set({ token: undefined });
  },
}));

// bootstrap di client
if (typeof window !== 'undefined') {
  const m = document.cookie.match(/(?:^|; )jwt=([^;]*)/);
  const jwt = (m ? decodeURIComponent(m[1]) : undefined) || localStorage.getItem('jwt') || undefined;
  if (jwt) setToken(jwt);
}
