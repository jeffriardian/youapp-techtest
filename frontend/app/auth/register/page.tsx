// frontend/app/auth/register/page.tsx
'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

// inline SVG icons (no extra deps)
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

function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/profile';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    // UI validation only
    if (password !== confirmPassword) {
      setErr('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { email, username, password });
      setOk('Registered. Please login.');
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e.message ?? 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    email.trim() && username.trim() && password.length >= 1 && confirmPassword.length >= 1;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364] px-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-white text-4xl font-extrabold tracking-tight mb-8">Register</h1>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/70 focus:bg-white/15 transition"
          />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Create Username"
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/70 focus:bg-white/15 transition"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create Password"
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

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/70 focus:bg-white/15 transition"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition"
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Alerts */}
          {err && <p className="text-red-300 text-sm">{String(err)}</p>}
          {ok && <p className="text-emerald-300 text-sm">{ok}</p>}

          {/* Submit button (disabled state mirrors figma) */}
          <button
            className={`w-full py-3 rounded-xl text-white font-semibold shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition
              ${
                canSubmit
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-95'
                  : 'bg-white/15 text-white/70 cursor-not-allowed'
              }`}
            disabled={loading || !canSubmit}
          >
            {loading ? 'Submitting…' : 'Register'}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-6">
          Have an account?{' '}
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            className="underline decoration-2 underline-offset-2 text-blue-300 hover:text-blue-200"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
