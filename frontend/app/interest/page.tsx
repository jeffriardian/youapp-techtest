// frontend/app/interest/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function InterestPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/profiles/getProfile');
        const data = (res as any)?.data?.data ?? (res as any)?.data ?? null;
        if (!data) throw new Error('no-profile');
        setList(Array.isArray(data.interests) ? data.interests : []);
      } catch (e: any) {
        const code = e?.response?.status || e?.status;
        if (code === 404) {
          alert('Please complete About first.');
          router.replace('/profile?mode=edit&section=about');
          return;
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, [router]);

  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

  const add = () => {
    const v = normalize(input);
    if (!v) return;
    const exists = list.some((x) => x.toLowerCase() === v.toLowerCase());
    if (!exists) setList((l) => [...l, v]);
    setInput('');
  };

  const remove = (idx: number) => setList((l) => l.filter((_, i) => i !== idx));

  const onSave = async () => {
    await api.patch('/profiles/updateProfile', { interests: list });
    router.push('/initial');
  };

  if (!loaded) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-md md:max-w-2xl mx-auto space-y-6">
      {/* Header: Back (pakai ikon <) + Save (tanpa underline) */}
      <div className="flex items-center justify-between">
        <Link
          href="/initial"
          className="text-sm text-white/90 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </Link>

        <h1 className="text-2xl md:text-3xl font-semibold">Interest</h1>

        <button
          onClick={onSave}
          className="text-sm text-blue-300 hover:text-blue-200 font-medium transition-colors"
        >
          Save
        </button>
      </div>

      {/* Card utama */}
      <section className="card p-6 space-y-4">
        {/* gold text */}
        <div className="text-[13px] font-semibold text-amber-300">
          Tell everyone about yourself
        </div>

        <div className="text-lg md:text-xl font-semibold text-white">
          What interest you?
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {list.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="px-3 py-1 rounded-full bg-[#1f2937] border border-white/10 text-sm text-neutral-200 inline-flex items-center gap-2"
            >
              {t}
              <button
                className="opacity-70 hover:opacity-100"
                onClick={() => remove(i)}
                aria-label={`Remove ${t}`}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        <input
          className="input w-full"
          placeholder="Add interest"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
      </section>
    </div>
  );
}
