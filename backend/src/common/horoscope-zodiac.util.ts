/* Western horoscope ranges (inclusive of start, inclusive of end) */
export function getHoroscope(date: Date): string {
    const d = new Date(date);
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const inRange = (m1: number, d1: number, m2: number, d2: number) =>
        (m === m1 && day >= d1) || (m === m2 && day <= d2) || (m > m1 && m < m2) || (m1 > m2 && (m > m1 || m < m2));

    if (inRange(3,21,4,19)) return 'Aries';
    if (inRange(4,20,5,20)) return 'Taurus';
    if (inRange(5,21,6,21)) return 'Gemini';
    if (inRange(6,22,7,22)) return 'Cancer';
    if (inRange(7,23,8,22)) return 'Leo';
    if (inRange(8,23,9,22)) return 'Virgo';
    if (inRange(9,23,10,23)) return 'Libra';
    if (inRange(10,24,11,21)) return 'Scorpius';
    if (inRange(11,22,12,21)) return 'Sagittarius';
    if (inRange(12,22,1,19)) return 'Capricornus';
    if (inRange(1,20,2,18)) return 'Aquarius';
    return 'Pisces'; // 2/19–3/20
}

/* Chinese zodiac based on CNY cutoffs from your sheet (1912–2024). */
type CNY = { start: string; end: string; animal: string };
const CNY_TABLE: CNY[] = [
    {start:'1912-02-18', end:'1913-02-05', animal:'Rat'},
    {start:'1913-02-06', end:'1914-01-25', animal:'Ox'},
    {start:'1914-01-26', end:'1915-02-13', animal:'Tiger'},
    {start:'1915-02-14', end:'1916-02-02', animal:'Rabbit'},
    {start:'1916-02-03', end:'1917-01-22', animal:'Dragon'},
    {start:'1917-01-23', end:'1918-02-10', animal:'Snake'},
    {start:'1918-02-11', end:'1919-01-31', animal:'Horse'},
    {start:'1919-02-01', end:'1920-02-19', animal:'Goat'},
    {start:'1920-02-20', end:'1921-02-07', animal:'Monkey'},
    {start:'1921-02-08', end:'1922-01-27', animal:'Rooster'},
    {start:'1922-01-28', end:'1923-02-15', animal:'Dog'},
    {start:'1923-02-16', end:'1924-02-04', animal:'Boar'},
    {start:'1924-02-05', end:'1925-01-24', animal:'Rat'},
    {start:'1925-01-25', end:'1926-02-12', animal:'Ox'},
    {start:'1926-02-13', end:'1927-02-01', animal:'Tiger'},
    {start:'1927-02-02', end:'1928-01-22', animal:'Rabbit'},
    {start:'1928-01-23', end:'1929-02-09', animal:'Dragon'},
    {start:'1929-02-10', end:'1930-01-29', animal:'Snake'},
    {start:'1930-01-30', end:'1931-02-16', animal:'Horse'},
    {start:'1931-02-17', end:'1932-02-05', animal:'Goat'},
    {start:'1932-02-06', end:'1933-01-25', animal:'Monkey'},
    {start:'1933-01-26', end:'1934-02-13', animal:'Rooster'},
    {start:'1934-02-14', end:'1935-02-03', animal:'Dog'},
    {start:'1935-02-04', end:'1936-01-23', animal:'Boar'},
    {start:'1936-01-24', end:'1937-02-10', animal:'Rat'},
    {start:'1937-02-11', end:'1938-01-30', animal:'Ox'},
    {start:'1938-01-31', end:'1939-02-18', animal:'Tiger'},
    {start:'1939-02-19', end:'1940-02-07', animal:'Rabbit'},
    {start:'1940-02-08', end:'1941-01-26', animal:'Dragon'},
    {start:'1941-01-27', end:'1942-02-14', animal:'Snake'},
    {start:'1942-02-15', end:'1943-02-04', animal:'Horse'},
    {start:'1943-02-05', end:'1944-01-24', animal:'Goat'},
    {start:'1944-01-25', end:'1945-02-12', animal:'Monkey'},
    {start:'1945-02-13', end:'1946-02-01', animal:'Rooster'},
    {start:'1946-02-02', end:'1947-01-21', animal:'Dog'},
    {start:'1947-01-22', end:'1948-02-09', animal:'Boar'},
    {start:'1948-02-10', end:'1949-01-28', animal:'Rat'},
    {start:'1949-01-29', end:'1950-02-16', animal:'Ox'},
    {start:'1950-02-17', end:'1951-02-05', animal:'Tiger'},
    {start:'1951-02-06', end:'1952-01-26', animal:'Rabbit'},
    {start:'1952-01-27', end:'1953-02-13', animal:'Dragon'},
    {start:'1953-02-14', end:'1954-02-02', animal:'Snake'},
    {start:'1954-02-03', end:'1955-01-23', animal:'Horse'},
    {start:'1955-01-24', end:'1956-02-11', animal:'Goat'},
    {start:'1956-02-12', end:'1957-01-30', animal:'Monkey'},
    {start:'1957-01-31', end:'1958-02-17', animal:'Rooster'},
    {start:'1958-02-18', end:'1959-02-07', animal:'Dog'},
    {start:'1959-02-08', end:'1960-01-27', animal:'Boar'},
    {start:'1960-01-28', end:'1961-02-14', animal:'Rat'},
    {start:'1961-02-15', end:'1962-02-04', animal:'Ox'},
    {start:'1962-02-05', end:'1963-01-24', animal:'Tiger'},
    {start:'1963-01-25', end:'1964-02-12', animal:'Rabbit'},
    {start:'1964-02-13', end:'1965-02-01', animal:'Dragon'},
    {start:'1965-02-02', end:'1966-01-20', animal:'Snake'},
    {start:'1966-01-21', end:'1967-02-08', animal:'Horse'},
    {start:'1967-02-09', end:'1968-01-29', animal:'Goat'},
    {start:'1968-01-30', end:'1969-02-16', animal:'Monkey'},
    {start:'1969-02-17', end:'1970-02-05', animal:'Rooster'},
    {start:'1970-02-06', end:'1971-01-26', animal:'Dog'},
    {start:'1971-01-27', end:'1972-01-15', animal:'Boar'},
    {start:'1972-01-16', end:'1973-02-02', animal:'Rat'},
    {start:'1973-02-03', end:'1974-01-22', animal:'Ox'},
    {start:'1974-01-23', end:'1975-02-10', animal:'Tiger'},
    {start:'1975-02-11', end:'1976-01-30', animal:'Rabbit'},
    {start:'1976-01-31', end:'1977-02-17', animal:'Dragon'},
    {start:'1977-02-18', end:'1978-02-06', animal:'Snake'},
    {start:'1978-02-07', end:'1979-01-27', animal:'Horse'},
    {start:'1979-01-28', end:'1980-02-15', animal:'Goat'},
    {start:'1980-02-16', end:'1981-02-04', animal:'Monkey'},
    {start:'1981-02-05', end:'1982-01-24', animal:'Rooster'},
    {start:'1982-01-25', end:'1983-02-12', animal:'Dog'},
    {start:'1983-02-13', end:'1984-02-01', animal:'Boar'},
    {start:'1984-02-02', end:'1985-02-19', animal:'Rat'},
    {start:'1985-02-20', end:'1986-02-08', animal:'Ox'},
    {start:'1986-02-09', end:'1987-01-28', animal:'Tiger'},
    {start:'1987-01-29', end:'1988-02-16', animal:'Rabbit'},
    {start:'1988-02-17', end:'1989-02-05', animal:'Dragon'},
    {start:'1989-02-06', end:'1990-01-26', animal:'Snake'},
    {start:'1990-01-27', end:'1991-02-14', animal:'Horse'},
    {start:'1991-02-15', end:'1992-02-03', animal:'Goat'},
    {start:'1992-02-04', end:'1993-01-22', animal:'Monkey'},
    {start:'1993-01-23', end:'1994-02-09', animal:'Rooster'},
    {start:'1994-02-10', end:'1995-01-30', animal:'Dog'},
    {start:'1995-01-31', end:'1996-02-18', animal:'Boar'},
    {start:'1996-02-19', end:'1997-02-06', animal:'Rat'},
    {start:'1997-02-07', end:'1998-01-27', animal:'Ox'},
    {start:'1998-01-28', end:'1999-02-15', animal:'Tiger'},
    {start:'1999-02-16', end:'2000-02-04', animal:'Rabbit'},
    {start:'2000-02-05', end:'2001-01-23', animal:'Dragon'},
    {start:'2001-01-24', end:'2002-02-11', animal:'Snake'},
    {start:'2002-02-12', end:'2003-01-31', animal:'Horse'},
    {start:'2003-02-01', end:'2004-01-21', animal:'Goat'},
    {start:'2004-01-22', end:'2005-02-08', animal:'Monkey'},
    {start:'2005-02-09', end:'2006-01-28', animal:'Rooster'},
    {start:'2006-01-29', end:'2007-02-17', animal:'Dog'},
    {start:'2007-02-18', end:'2008-02-06', animal:'Boar'},
    {start:'2008-02-07', end:'2009-01-25', animal:'Rat'},
    {start:'2009-01-26', end:'2010-02-13', animal:'Ox'},
    {start:'2010-02-14', end:'2011-02-02', animal:'Tiger'},
    {start:'2011-02-03', end:'2012-01-22', animal:'Rabbit'},
    {start:'2012-01-23', end:'2013-02-09', animal:'Dragon'},
    {start:'2013-02-10', end:'2014-01-30', animal:'Snake'},
    {start:'2014-01-31', end:'2015-02-18', animal:'Horse'},
    {start:'2015-02-19', end:'2016-02-07', animal:'Goat'},
    {start:'2016-02-08', end:'2017-01-27', animal:'Monkey'},
    {start:'2017-01-28', end:'2018-02-15', animal:'Rooster'},
    {start:'2018-02-16', end:'2019-02-04', animal:'Dog'},
    {start:'2019-02-05', end:'2020-01-24', animal:'Pig'},
    {start:'2020-01-25', end:'2021-02-11', animal:'Rat'},
    {start:'2021-02-12', end:'2022-01-31', animal:'Ox'},
    {start:'2022-02-01', end:'2023-01-21', animal:'Tiger'},
    {start:'2023-01-22', end:'2024-02-09', animal:'Rabbit'},
    {start:'2024-02-10', end:'2025-01-28', animal:'Dragon'} // extend if needed
];

export function getChineseZodiac(date: Date): string {
    const ts = date.toISOString().slice(0,10);
    for (const row of CNY_TABLE) {
        if (ts >= row.start && ts <= row.end) return row.animal;
    }
    // fallback by year cycle if outside table:
    const animals = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Boar'];
    const y = date.getUTCFullYear();
    return animals[(y - 2008) % 12 < 0 ? ((y-2008)%12)+12 : (y-2008)%12]; // 2008 Rat
}
