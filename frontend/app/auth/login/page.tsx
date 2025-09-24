// frontend/app/auth/login/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setToken } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  // Default flow: setelah login => /initial (landing)
  const next = search.get('next') || '/initial';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // BE path yang bener
      const { data } = await api.post('/auth/login', { username, password });

      // Ambil token HANYA dari response.data (bukan dari objek response)
      const token: string =
        data?.accessToken ?? data?.access_token ?? data?.token ?? data?.jwt;

      if (!token) throw new Error('No token in response');

      setToken(token); // simpan cookie "jwt"
      router.push(next);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl mb-8">Login</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          className="w-full rounded p-3 text-black"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          className="w-full rounded p-3 text-black"
        />

        {err && <p className="text-red-400">{String(err)}</p>}

        <button
          className="w-full p-3 rounded bg-blue-600 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// WAJIB: pemakai useSearchParams harus dibungkus Suspense biar no-prerender error
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
