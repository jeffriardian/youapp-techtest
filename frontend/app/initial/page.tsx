// frontend/app/initial/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type Gender = 'Male' | 'Female' | 'Other';
type Profile = {
  displayName?: string;
  gender?: Gender;
  birthday?: string; // ISO
  horoscope?: string;
  zodiac?: string;
  height?: number;
  weight?: number;
  bio?: string;
  interests?: string[];
  avatarUrl?: string;
};

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const c of cookies) {
    const i = c.indexOf('=');
    if (decodeURIComponent(c.slice(0, i)) === name) {
      return decodeURIComponent(c.slice(i + 1));
    }
  }
  return undefined;
}
function getJwtPayload(): any | undefined {
  const jwt = readCookie('jwt');
  if (!jwt) return undefined;
  const parts = jwt.split('.');
  if (parts.length !== 3) return undefined;
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return undefined;
  }
}
function fmtBirthday(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
}
function calcAge(iso?: string): number | undefined {
  if (!iso) return undefined;
  const b = new Date(iso);
  if (Number.isNaN(b.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export default function InitialPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  const handle = useMemo(() => {
    const p = getJwtPayload();
    return p?.username ? `@${p.username}` : '';
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/profiles/getProfile');
        const data = (res as any)?.data ?? res;
        setProfile(data);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) return <div className="p-6">Loading…</div>;

  const hasAbout =
    !!profile?.birthday ||
    !!profile?.horoscope ||
    !!profile?.zodiac ||
    profile?.height != null ||
    profile?.weight != null;

  const age = calcAge(profile?.birthday);
  const showBadges = !!profile?.horoscope || !!profile?.zodiac;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4">
      {/* ===== Header / Cover ===== */}
      <div className="p-0">
        <div className="relative w-full overflow-hidden rounded-3xl bg-[#0f172a]">
          {/* cover image (pakai avatarUrl kalau belum ada cover terpisah) */}
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt="cover"
              className="h-48 w-full object-cover md:h-56"
            />
          ) : (
            <div className="h-48 w-full md:h-56" />
          )}

          {/* overlay gelap + sedikit gradient biar teks kebaca (match figma) */}
          <div className="absolute inset-0 bg-black/35" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Handle + gender + badges di kiri bawah */}
          <div className="absolute left-4 bottom-4 right-6 space-y-2">
            <div className="text-white/95 font-semibold text-lg drop-shadow-sm">
              {handle}
              {age != null ? `, ${age}` : ''}
            </div>
            {profile?.gender && (
              <div className="text-white/85 text-sm">{profile.gender}</div>
            )}

            {showBadges && (
              <div className="flex flex-wrap gap-2">
                {profile?.horoscope && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-sm text-white/90 backdrop-blur">
                    <span className="opacity-90">♍</span>
                    {profile.horoscope}
                  </span>
                )}
                {profile?.zodiac && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-sm text-white/90 backdrop-blur">
                    <span className="opacity-90">🐷</span>
                    {profile.zodiac}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ⛔ Avatar kecil di kanan-bawah DIHAPUS sesuai figma */}
        </div>
      </div>

      {/* ===== About ===== */}
      <div className="rounded-3xl bg-[#0f1a22]/90 p-5 backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white/95">About</h2>
          <Link
            href="/profile?mode=edit&section=about"
            aria-label="Edit about"
            className="text-white/80 hover:text-white transition"
            title="Edit"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </Link>
        </div>

        {hasAbout ? (
          <div className="mt-4 space-y-3">
            {profile?.birthday && (
              <div className="flex gap-2">
                <span className="text-neutral-400">Birthday:</span>
                <span className="text-white/95">
                  {fmtBirthday(profile.birthday)}
                  {age != null ? ` (Age ${age})` : ''}
                </span>
              </div>
            )}
            {profile?.horoscope && (
              <div className="flex gap-2">
                <span className="text-neutral-400">Horoscope:</span>
                <span className="text-white/95">{profile.horoscope}</span>
              </div>
            )}
            {profile?.zodiac && (
              <div className="flex gap-2">
                <span className="text-neutral-400">Zodiac:</span>
                <span className="text-white/95">{profile.zodiac}</span>
              </div>
            )}
            {profile?.height != null && (
              <div className="flex gap-2">
                <span className="text-neutral-400">Height:</span>
                <span className="text-white/95">{profile.height} cm</span>
              </div>
            )}
            {profile?.weight != null && (
              <div className="flex gap-2">
                <span className="text-neutral-400">Weight:</span>
                <span className="text-white/95">{profile.weight} kg</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-neutral-400 mt-4">
            Add in your your to help others know you better
          </p>
        )}
      </div>

      {/* ===== Interest ===== */}
      <div className="rounded-3xl bg-[#0f1a22]/90 p-5 backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white/95">Interest</h2>
          <Link
            href="/interest"
            aria-label="Edit interest"
            className="text-white/80 hover:text-white transition"
            title="Edit"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </Link>
        </div>

        {(profile?.interests && profile.interests.length > 0) ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.interests.map((it, i) => (
              <span
                key={`${it}-${i}`}
                className="px-3 py-1 text-sm rounded-full bg-[#111827] text-neutral-200 border border-white/10"
              >
                {it}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400 mt-4">
            Add in your interest to find a better match
          </p>
        )}
      </div>
    </div>
  );
}
