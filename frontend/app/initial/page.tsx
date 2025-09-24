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

  return (
    <div className="space-y-6">
      {/* ===== Hero (cover full-bleed) ===== */}
      <div className="card p-0 overflow-hidden">
        <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-[#111827]">
          {/* cover image */}
          {profile?.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt="cover"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {/* dark overlay biar teks kebaca */}
          <div className="absolute inset-0 bg-black/25" />

          {/* handle (kiri bawah) */}
          <div className="absolute left-4 bottom-4 text-white font-semibold drop-shadow">
            {handle}
          </div>

          {/* avatar bulat (kanan bawah) */}
          <div className="absolute right-4 bottom-4 h-16 w-16 md:h-20 md:w-20 rounded-full border border-white/10 bg-[#1f2937] overflow-hidden">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-white/80">V</div>
            )}
          </div>
        </div>
      </div>

      {/* ===== About ===== */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">About</h2>
          <Link
            href="/profile?mode=edit&section=about"
            className="text-sm underline flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
              <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41L18.37 3.29a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
            </svg>
            Edit
          </Link>
        </div>

        {hasAbout ? (
          <div className="mt-4 space-y-3 text-neutral-300">
            {profile?.birthday && (
              <div>
                <span className="text-neutral-400 mr-2">Birthday:</span>
                <span>{fmtBirthday(profile.birthday)}</span>
              </div>
            )}
            {profile?.horoscope && (
              <div>
                <span className="text-neutral-400 mr-2">Horoscope:</span>
                <span>{profile.horoscope}</span>
              </div>
            )}
            {profile?.zodiac && (
              <div>
                <span className="text-neutral-400 mr-2">Zodiac:</span>
                <span>{profile.zodiac}</span>
              </div>
            )}
            {profile?.height != null && (
              <div>
                <span className="text-neutral-400 mr-2">Height:</span>
                <span>{profile.height} cm</span>
              </div>
            )}
            {profile?.weight != null && (
              <div>
                <span className="text-neutral-400 mr-2">Weight:</span>
                <span>{profile.weight} kg</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-neutral-400 mt-4">
            Add in your bio to help others know you better
          </p>
        )}
      </div>

      {/* ===== Interest ===== */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Interest</h2>
          <Link href="/interest" className="text-sm underline flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
              <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41L18.37 3.29a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
            </svg>
            Edit
          </Link>
        </div>

        {(profile?.interests && profile.interests.length > 0) ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.interests.map((it, i) => (
              <span
                key={`${it}-${i}`}
                className="px-3 py-1 text-sm rounded-full bg-[#1f2937] text-neutral-200 border border-white/10"
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
