// frontend/app/page.tsx
'use client';
import Link from 'next/link';

export default function Landing() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-semibold">Welcome</h1>
        <p className="text-lg text-neutral-300">
          Silakan login untuk lanjut, atau buat akun baru kalau belum punya.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login?next=%2Finitial"
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
