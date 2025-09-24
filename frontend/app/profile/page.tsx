'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { deriveSigns } from '@/lib/zodiac';

type Profile = {
  displayName?: string;
  gender?: string;
  birthday?: string;
  horoscope?: string;
  zodiac?: string;
  height?: number;
  weight?: number;
  interests?: string[];
  bio?: string;
  avatarUrl?: string;
};

type FetchState = 'idle' | 'loading' | 'loaded' | 'error';

function fmtBirthdayView(src?: string): string | undefined {
  if (!src) return undefined;
  let m = src.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]} / ${m[2]} / ${m[1]}`;
  m = src.match(/^(\d{2})\s*[\/.\-\s]\s*(\d{2})\s*[\/.\-\s]\s*(\d{4})$/);
  if (m) return `${m[1]} / ${m[2]} / ${m[3]}`;
  const d = new Date(src);
  if (Number.isNaN(d.getTime())) return undefined;
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
}
function toIsoDateOrUndefined(input?: string): string | undefined {
  if (!input) return undefined;
  const t = input.trim();
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`;
  m = t.match(/^(\d{2})\s*[\/\s.\-]\s*(\d{2})\s*[\/\s.\-]\s*(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}T00:00:00.000Z`;
  const d = new Date(t);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
  }
  return undefined;
}
function isoToDdMmYyyy(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

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

function maskBirthdayInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  if (digits.length <= 2) return dd;
  if (digits.length <= 4) return `${dd}-${mm}`;
  return `${dd}-${mm}-${yyyy}`;
}
function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}
function computeDerivedFromBirthday(viewStr?: string): { horoscope: string; zodiac: string } {
  if (!viewStr) return { horoscope: '--', zodiac: '--' };
  const digits = viewStr.replace(/\D/g, '');
  const ddNum = Number(digits.slice(0, 2));
  const mmNum = Number(digits.slice(2, 4));
  const yyyyStr = digits.slice(4, 8);

  const monthOk = mmNum >= 1 && mmNum <= 12;
  const dayOk =
    ddNum >= 1 &&
    ddNum <= 31 &&
    (monthOk ? ddNum <= daysInMonth(mmNum, Number(yyyyStr || '2000')) : true);

  let horoscope = '--';
  let zodiac = '--';

  if (digits.length >= 4 && monthOk && dayOk) {
    const dateForHoroscope = `${yyyyStr || '2000'}-${String(mmNum).padStart(2, '0')}-${String(ddNum).padStart(2, '0')}`;
    horoscope = deriveSigns(dateForHoroscope).horoscope || '--';
  }
  if (digits.length === 8 && monthOk && dayOk) {
    const dateFull = `${yyyyStr}-${String(mmNum).padStart(2, '0')}-${String(ddNum).padStart(2, '0')}`;
    zodiac = deriveSigns(dateFull).zodiac || '--';
  }
  return { horoscope, zodiac };
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ProfilePageInner />
    </Suspense>
  );
}

function ProfilePageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const forceEdit = search.get('mode') === 'edit';

  const [state, setState] = useState<FetchState>('idle');
  const [exists, setExists] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

  const [saved, setSaved] = useState<Profile | null>(null);

  const [form, setForm] = useState<Profile>({
    displayName: '',
    gender: '',
    birthday: '',
    horoscope: '--',
    zodiac: '--',
    height: undefined,
    weight: undefined,
    interests: [],
    bio: '',
    avatarUrl: '',
  });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const onPickImage = () => fileRef.current?.click();

  const API_ORIGIN = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_API_BASE_URL || '').origin;
    } catch {
      return '';
    }
  })();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('avatar', f);
    try {
      const res = await api.post('/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = (res as any)?.data ?? res;
      const path = data?.url as string;
      const fullUrl = `${API_ORIGIN}${path}`;
      setForm((p) => ({ ...p, avatarUrl: fullUrl }));
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const derived = useMemo(
    () => computeDerivedFromBirthday(form.birthday || ''),
    [form.birthday]
  );

  const handle = useMemo(() => {
    const p = getJwtPayload();
    return p?.username ? `@${p.username},` : '';
  }, []);

  useEffect(() => {
    (async () => {
      setState('loading');
      try {
        const res = await api.get('/profiles/getProfile');
        const data = (res as any)?.data ?? res;
        const normalized: Profile = {
          displayName: data?.displayName ?? '',
          gender: data?.gender ?? '',
          birthday: isoToDdMmYyyy(data?.birthday),
          horoscope: data?.horoscope ?? '--',
          zodiac: data?.zodiac ?? '--',
          height: data?.height ?? undefined,
          weight: data?.weight ?? undefined,
          interests: Array.isArray(data?.interests) ? data.interests : [],
          bio: data?.bio ?? '',
          avatarUrl: data?.avatarUrl ?? '',
        };
        setForm(normalized);
        setSaved(normalized);
        setExists(true);
        setState('loaded');
        setViewMode(forceEdit ? 'edit' : 'view');
      } catch (e: any) {
        const code = e?.response?.status || e?.status;
        if (code === 404) {
          setExists(false);
          setSaved(null);
          setState('loaded');
          setViewMode('edit');
        } else {
          setState('error');
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = <K extends keyof Profile>(key: K, val: Profile[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
  };

  const onSave = async () => {
    const birthdayISO = toIsoDateOrUndefined(form.birthday);
    const payload: Profile = {
      ...form,
      birthday: birthdayISO ? birthdayISO : undefined,
      horoscope:
        form.horoscope && form.horoscope !== '--' ? form.horoscope : derived.horoscope,
      zodiac:
        form.zodiac && form.zodiac !== '--' ? form.zodiac : derived.zodiac,
    };

    if (!exists) {
      const res = await api.post('/profiles/createProfile', payload);
      const data = (res as any)?.data ?? res;
      const normalized: Profile = {
        displayName: data?.displayName ?? form.displayName,
        gender: data?.gender ?? form.gender,
        birthday: isoToDdMmYyyy(data?.birthday ?? birthdayISO),
        horoscope: data?.horoscope ?? payload.horoscope,
        zodiac: data?.zodiac ?? payload.zodiac,
        height: data?.height ?? form.height,
        weight: data?.weight ?? form.weight,
        interests: Array.isArray(data?.interests) ? data.interests : (form.interests || []),
        bio: data?.bio ?? form.bio,
        avatarUrl: data?.avatarUrl ?? form.avatarUrl,
      };
      setForm(normalized);
      setSaved(normalized);
      setExists(true);
      setViewMode('view');
      router.push('/initial');
      return;
    }

    const res = await api.patch('/profiles/updateProfile', payload);
    const data = (res as any)?.data ?? res;
    const normalized: Profile = {
      displayName: data?.displayName ?? form.displayName,
      gender: data?.gender ?? form.gender,
      birthday: isoToDdMmYyyy(data?.birthday ?? birthdayISO),
      horoscope: data?.horoscope ?? payload.horoscope,
      zodiac: data?.zodiac ?? payload.zodiac,
      height: data?.height ?? form.height,
      weight: data?.weight ?? form.weight,
      interests: Array.isArray(data?.interests) ? data.interests : (form.interests || []),
      bio: data?.bio ?? form.bio,
      avatarUrl: data?.avatarUrl ?? form.avatarUrl,
    };
    setForm(normalized);
    setSaved(normalized);
    setViewMode('view');
    router.push('/initial');
  };

  if (state === 'loading') return <div className="p-6">Loading…</div>;
  if (state === 'error') return <div className="p-6 text-red-500">Failed to load profile.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/initial" className="flex items-center gap-2 text-sm underline">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </Link>
        <h1 className="text-3xl font-semibold">{(handle || '').replace(/,$/, '')}</h1>
        <div className="w-[56px]" />
      </div>

      {/* ==== HERO: kembali ke cover image + handle & avatar overlay (sesuai yang sudah bener) ==== */}
      <div className="card p-0 overflow-hidden">
        <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-[#111827]">
          {form.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.avatarUrl}
              alt="cover"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/25" />
          {/* handle di kiri-bawah (overlay) */}
          <div className="absolute left-4 bottom-4 text-white font-semibold drop-shadow">
            {handle}
          </div>
          {/* avatar bulat di kanan-bawah */}
          <div className="absolute right-4 bottom-4 h-16 w-16 md:h-20 md:w-20 rounded-full border border-white/10 bg-[#1f2937] overflow-hidden">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-white/80">V</div>
            )}
          </div>
        </div>
      </div>

      {/* ===== About ===== */}
      <section className="card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">About</div>
          {viewMode === 'edit' ? (
            <div className="flex items-center gap-4">
              <button className="text-sm text-amber-300 hover:text-amber-200 transition" onClick={onSave}>
                Save &amp; Update
              </button>
            </div>
          ) : (
            <button className="text-sm underline" onClick={() => setViewMode('edit')}>Edit</button>
          )}
        </div>

        {viewMode === 'view' ? (
          <div className="space-y-3 text-[15px]">
            {form.displayName && (
              <div className="flex gap-3">
                <span className="w-36 text-neutral-400">Display name:</span>
                <span className="text-white/95 font-medium">{form.displayName}</span>
              </div>
            )}
            {form.gender && (
              <div className="flex gap-3">
                <span className="w-36 text-neutral-400">Gender:</span>
                <span className="text-white/95 font-medium">{form.gender}</span>
              </div>
            )}
            {form.birthday && (
              <div className="flex gap-3">
                <span className="w-36 text-neutral-400">Birthday:</span>
                <span className="text-white/95 font-medium">{fmtBirthdayView(form.birthday)}</span>
              </div>
            )}
            <div className="flex gap-3">
              <span className="w-36 text-neutral-400">Horoscope:</span>
              <span className="text-white/95 font-medium">{form.horoscope || '--'}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-36 text-neutral-400">Zodiac:</span>
              <span className="text-white/95 font-medium">{form.zodiac || '--'}</span>
            </div>
            {form.height != null && (
              <div className="flex gap-3">
                <span className="w-36 text-neutral-400">Height:</span>
                <span className="text-white/95 font-medium">{form.height} cm</span>
              </div>
            )}
            {form.weight != null && (
              <div className="flex gap-3">
                <span className="w-36 text-neutral-400">Weight:</span>
                <span className="text-white/95 font-medium">{form.weight} kg</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
            {/* Add image button (besar) */}
            <div className="text-mute"></div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="h-14 w-14 rounded-2xl bg-white/10 grid place-items-center border border-white/15 overflow-hidden hover:bg-white/15 transition"
                onClick={onPickImage}
                title="Add image"
              >
                {form.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.avatarUrl}
                    alt="avatar"
                    className="h-full w-full object-cover rounded-2xl block"
                  />
                ) : (
                  <span className="text-xl text-white/80">+</span>
                )}
              </button>
              <span className="text-sm text-white/85">Add image</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {/* Input styling */}
            <div className="text-neutral-400">Display name:</div>
            <input
              className="input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
              placeholder="Enter name"
              value={form.displayName || ''}
              onChange={(e) => onChange('displayName', e.target.value)}
            />

            <div className="text-neutral-400">Gender:</div>
            <select
              className="input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
              value={form.gender || ''}
              onChange={(e) => onChange('gender', e.target.value)}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <div className="text-neutral-400">Birthday:</div>
            <input
              className="input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
              placeholder="DD MM YYYY"
              value={form.birthday || ''}
              onChange={(e) => onChange('birthday', maskBirthdayInput(e.target.value))}
              inputMode="numeric"
              pattern="\d*"
            />

            <div className="text-neutral-400">Horoscope:</div>
            <input
              className="input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70"
              value={derived.horoscope || '--'}
              readOnly
              disabled
            />

            <div className="text-neutral-400">Zodiac:</div>
            <input
              className="input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70"
              value={derived.zodiac || '--'}
              readOnly
              disabled
            />

            <div className="text-neutral-400">Height:</div>
            <input
              type="number"
              className="input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
              placeholder="Add height"
              value={form.height ?? ''}
              onChange={(e) =>
                onChange('height', e.target.value === '' ? undefined : Number(e.target.value))
              }
            />

            <div className="text-neutral-400">Weight:</div>
            <input
              type="number"
              className="input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
              placeholder="Add weight"
              value={form.weight ?? ''}
              onChange={(e) =>
                onChange('weight', e.target.value === '' ? undefined : Number(e.target.value))
              }
            />
          </div>
        )}
      </section>

      {/* ===== Interest ===== */}
      <section className="card p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Interest</div>
          <Link href="/interest" className="text-sm underline">Edit</Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {(form.interests || []).length === 0 ? (
            <div className="text-sm opacity-80">Add in your interest to find a better match</div>
          ) : (
            (form.interests || []).map((it) => (
              <span key={it} className="px-3 py-1 rounded-full bg-[#111827] border border-white/10 text-sm text-neutral-200">
                {it}
              </span>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
