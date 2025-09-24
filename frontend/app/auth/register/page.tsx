// frontend/app/auth/register/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/profile';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      await api.post('/auth/register', { email, username, password });
      setOk('Registered. Please login.');
      // arahkan ke login, bawa next supaya abis login balik tujuan
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e.message ?? 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl mb-8">Register</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="w-full rounded p-3 text-black"
        />
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
        {ok && <p className="text-green-400">{ok}</p>}

        <button
          className="w-full p-3 rounded bg-blue-600 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Submitting…' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  // WAJIB: bungkus pemakai useSearchParams dgn Suspense
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
