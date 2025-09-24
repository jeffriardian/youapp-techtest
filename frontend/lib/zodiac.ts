// frontend/lib/zodiac.ts
export type Gender = 'Male' | 'Female' | 'Other' | string;

type MD = { m: number; d: number };
const afterEq = (m: number, d: number, a: MD) => m > a.m || (m === a.m && d >= a.d);
const beforeEq = (m: number, d: number, b: MD) => m < b.m || (m === b.m && d <= b.d);

/** Return Western horoscope (Aries..Pisces) with common labels per figma */
export function getHoroscope(date: Date | string): string {
  const dt = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(dt.getTime())) return '--';
  const m = dt.getUTCMonth() + 1;
  const d = dt.getUTCDate();

  const ranges: Array<[name: string, a: MD, b: MD]> = [
    ['Capricorn',   { m: 12, d: 22 }, { m: 1,  d: 19 }],
    ['Aquarius',    { m: 1,  d: 20 }, { m: 2,  d: 18 }],
    ['Pisces',      { m: 2,  d: 19 }, { m: 3,  d: 20 }],
    ['Aries',       { m: 3,  d: 21 }, { m: 4,  d: 19 }],
    ['Taurus',      { m: 4,  d: 20 }, { m: 5,  d: 20 }],
    ['Gemini',      { m: 5,  d: 21 }, { m: 6,  d: 21 }],
    ['Cancer',      { m: 6,  d: 22 }, { m: 7,  d: 22 }],
    ['Leo',         { m: 7,  d: 23 }, { m: 8,  d: 22 }],
    ['Virgo',       { m: 8,  d: 23 }, { m: 9,  d: 22 }],
    ['Libra',       { m: 9,  d: 23 }, { m: 10, d: 23 }],
    ['Scorpio',     { m: 10, d: 24 }, { m: 11, d: 21 }],
    ['Sagittarius', { m: 11, d: 22 }, { m: 12, d: 21 }],
  ];

  for (const [name, a, b] of ranges) {
    if (a.m === 12) {
      if (afterEq(m, d, a) || beforeEq(m, d, b)) return name;
    } else if (afterEq(m, d, a) && beforeEq(m, d, b)) return name;
  }
  return '--';
}

/** Return Chinese zodiac (Rat..Pig) */
export function getChineseZodiac(dateOrYear: Date | string | number): string {
  let year: number;
  if (typeof dateOrYear === 'number') year = dateOrYear;
  else if (typeof dateOrYear === 'string') year = new Date(dateOrYear).getUTCFullYear();
  else year = dateOrYear.getUTCFullYear();
  if (!Number.isFinite(year)) return '--';

  const animals = [
    'Rat','Ox','Tiger','Rabbit','Dragon','Snake',
    'Horse','Goat','Monkey','Rooster','Dog','Pig'
  ] as const;
  // 2008 is Rat in the cycle; adjust offset if needed
  const idx = (year - 2008) % 12;
  const pos = (idx + 12) % 12;
  return animals[pos];
}

/** Convenience: derive both from birthday (ISO string or Date) */
export function deriveSigns(birthday?: string | Date) {
  if (!birthday) return { horoscope: '--', zodiac: '--' };
  return {
    horoscope: getHoroscope(birthday),
    zodiac: getChineseZodiac(birthday),
  };
}
