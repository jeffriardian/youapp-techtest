// frontend/app/auth/login/page.tsx
'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setToken } from '@/lib/api';

// inline SVG icons (vector, no extra deps)
function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42" />
      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.26 18.26 0 0 1-4.27 5.29" />
      <path d="M6.61 6.61A18.4 18.4 0 0 0 1 12s4 8 11 8a10.9 10.9 0 0 0 3.39-.53" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  // Default flow: setelah login => /initial (landing)
  const next = search.get('next') || '/initial';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const canSubmit = username.trim() && password.length >= 1;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364] px-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-white text-4xl font-extrabold tracking-tight mb-8">Login</h1>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/70 focus:bg-white/15 transition"
          />

          {/* Password with eye toggle */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/70 focus:bg-white/15 transition"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition"
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

        {/* Error */}
          {err && <p className="text-red-300 text-sm">{String(err)}</p>}

          {/* Button */}
          <button
            className={`w-full py-3 rounded-xl text-white font-semibold shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition
              ${
                canSubmit
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-95'
                  : 'bg-white/15 text-white/70 cursor-not-allowed'
              }`}
            disabled={loading || !canSubmit}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-gray-300 text-sm mt-6">
          No account?{' '}
          <Link
            href={`/auth/register?next=${encodeURIComponent(next)}`}
            className="underline decoration-2 underline-offset-2 text-blue-300 hover:text-blue-200"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

// WAJIB: pemakai useSearchParams harus dibungkus Suspense biar no-prerender error
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
