import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Minus,
  Plus,
  Search,
  X,
} from 'lucide-react';

type SurahMeta = {
  index: string;
  titleAr: string;
  title: string;
  count: number;
  place?: string;
  type?: string;
};

type SurahData = {
  index: string;
  name: string;
  count: number;
  verse: Record<string, string>;
};

type Verse = { number: number; text: string };

const QURAN_DATA_BASE = 'https://raw.githubusercontent.com/semarketir/quranjson/master/source';
const BOOKMARKS_KEY = 'haqiba_quran_bookmarks_v1';
const LAST_SURAH_KEY = 'haqiba_quran_last_surah_v1';

function toArabicNumber(value: number): string {
  return new Intl.NumberFormat('ar', { useGrouping: false }).format(value);
}

function normalizeArabic(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ـ/g, '')
    .trim();
}

function readBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function readLastSurah(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const value = Number(window.localStorage.getItem(LAST_SURAH_KEY) || 1);
    return Number.isInteger(value) && value >= 1 && value <= 114 ? value : 1;
  } catch {
    return 1;
  }
}

export const QuranReader: React.FC = () => {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(readLastSurah);
  const [chapter, setChapter] = useState<SurahData | null>(null);
  const [indexLoading, setIndexLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(true);
  const [indexError, setIndexError] = useState('');
  const [chapterError, setChapterError] = useState('');
  const [indexReload, setIndexReload] = useState(0);
  const [chapterReload, setChapterReload] = useState(0);
  const [surahSearch, setSurahSearch] = useState('');
  const [verseSearch, setVerseSearch] = useState('');
  const [fontSize, setFontSize] = useState(29);
  const [bookmarks, setBookmarks] = useState<string[]>(readBookmarks);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [targetVerse, setTargetVerse] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const chapterCache = useRef<Map<number, SurahData>>(new Map());

  useEffect(() => {
    const controller = new AbortController();
    const loadSurahIndex = async () => {
      setIndexLoading(true);
      setIndexError('');
      try {
        const response = await fetch(`${QURAN_DATA_BASE}/surah.json`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: unknown = await response.json();
        if (!Array.isArray(data) || data.length !== 114) {
          throw new Error('Invalid surah index');
        }
        setSurahs(data as SurahMeta[]);
      } catch (error) {
        if (!controller.signal.aborted) {
          setIndexError('تعذّر تحميل قائمة السور. تحقق من اتصال الإنترنت ثم أعد المحاولة.');
        }
      } finally {
        if (!controller.signal.aborted) setIndexLoading(false);
      }
    };
    void loadSurahIndex();
    return () => controller.abort();
  }, [indexReload]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_SURAH_KEY, String(selectedSurah));
    } catch {
      // The reader continues to work when browser storage is unavailable.
    }
  }, [selectedSurah]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch {
      // Bookmarks remain available in memory for the current session.
    }
  }, [bookmarks]);

  useEffect(() => {
    const cached = chapterCache.current.get(selectedSurah);
    if (cached) {
      setChapter(cached);
      setChapterLoading(false);
      setChapterError('');
      return;
    }

    const controller = new AbortController();
    const loadChapter = async () => {
      setChapter(null);
      setChapterLoading(true);
      setChapterError('');
      try {
        const response = await fetch(
          `${QURAN_DATA_BASE}/surah/surah_${selectedSurah}.json`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: unknown = await response.json();
        if (!data || typeof data !== 'object' || !('verse' in data) || !data.verse) {
          throw new Error('Invalid surah data');
        }
        const validData = data as SurahData;
        chapterCache.current.set(selectedSurah, validData);
        setChapter(validData);
      } catch (error) {
        if (!controller.signal.aborted) {
          setChapterError('تعذّر تحميل نص السورة. تحقق من الإنترنت ثم اضغط إعادة المحاولة.');
        }
      } finally {
        if (!controller.signal.aborted) setChapterLoading(false);
      }
    };
    void loadChapter();
    return () => controller.abort();
  }, [selectedSurah, chapterReload]);

  const verses: Verse[] = useMemo(() => {
    if (!chapter?.verse) return [];
    return Object.entries(chapter.verse)
      .map(([key, text]) => ({ number: Number(key.replace('verse_', '')), text }))
      .filter((verse) => Number.isFinite(verse.number) && typeof verse.text === 'string')
      .sort((a, b) => a.number - b.number);
  }, [chapter]);

  const visibleVerses = useMemo(() => {
    const query = normalizeArabic(verseSearch);
    if (!query) return verses;
    return verses.filter((verse) => normalizeArabic(verse.text).includes(query));
  }, [verses, verseSearch]);

  const searchedSurahs = useMemo(() => {
    const query = normalizeArabic(surahSearch);
    if (!query) return [];
    return surahs
      .filter((surah) => normalizeArabic(`${surah.titleAr} ${surah.title}`).includes(query))
      .slice(0, 12);
  }, [surahs, surahSearch]);

  useEffect(() => {
    if (targetVerse === null || !chapter || Number(chapter.index) !== selectedSurah) return;
    const element = document.getElementById(`quran-verse-${selectedSurah}-${targetVerse}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTargetVerse(null);
    }
  }, [targetVerse, chapter, selectedSurah]);

  const toggleBookmark = (verseNumber: number) => {
    const key = `${selectedSurah}:${verseNumber}`;
    setBookmarks((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
    setStatusMessage(bookmarks.includes(key) ? 'أُزيلت العلامة المرجعية.' : 'حُفظت الآية في العلامات المرجعية.');
  };

  const copyVerse = async (verse: Verse) => {
    try {
      await navigator.clipboard.writeText(`${verse.text} ﴿${toArabicNumber(verse.number)}﴾`);
      setStatusMessage('تم نسخ الآية.');
    } catch {
      setStatusMessage('تعذّر النسخ من المتصفح. يمكنك تحديد نص الآية ونسخه يدويًا.');
    }
  };

  const openBookmark = (key: string) => {
    const [surahNumber, verseNumber] = key.split(':').map(Number);
    if (!Number.isInteger(surahNumber) || !Number.isInteger(verseNumber)) return;
    setTargetVerse(verseNumber);
    setSelectedSurah(surahNumber);
    setVerseSearch('');
    setShowBookmarks(false);
  };

  const currentMeta = surahs.find((surah) => Number(surah.index) === selectedSurah);

  return (
    <section className="space-y-5" dir="rtl" aria-label="قارئ القرآن الكريم">
      <div className="rounded-3xl bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 sm:p-7 shadow-xl border border-amber-500/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-bold">تلاوة وتدبّر</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-scheherazade">القرآن الكريم</h2>
            <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
              اقرأ السور والآيات، وابحث في النص، واحفظ مواضع القراءة للعودة إليها لاحقًا.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBookmarks((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-emerald-800/70 px-3 py-2 text-sm font-bold text-amber-200 hover:bg-emerald-700 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            العلامات المرجعية ({bookmarks.length})
          </button>
        </div>
      </div>

      {showBookmarks && (
        <div className="rounded-2xl border border-amber-500/30 bg-white dark:bg-stone-900 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-bold">الآيات المحفوظة</h3>
            <button type="button" onClick={() => setShowBookmarks(false)} aria-label="إغلاق العلامات المرجعية" className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-stone-500">لم تحفظ أي آية بعد. اضغط علامة الكتاب بجوار الآية لحفظ موضعها.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((key) => {
                const [surahNumber, verseNumber] = key.split(':').map(Number);
                const meta = surahs.find((item) => Number(item.index) === surahNumber);
                return (
                  <button key={key} type="button" onClick={() => openBookmark(key)} className="rounded-xl border border-emerald-700/20 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-sm hover:border-amber-500 transition-colors">
                    {meta?.titleAr || `سورة ${toArabicNumber(surahNumber)}`} — الآية {toArabicNumber(verseNumber)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quran-surah-select" className="block text-sm font-bold mb-2">اختر السورة</label>
            <select
              id="quran-surah-select"
              value={selectedSurah}
              onChange={(event) => { setSelectedSurah(Number(event.target.value)); setVerseSearch(''); }}
              disabled={indexLoading || surahs.length === 0}
              className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {surahs.map((surah) => (
                <option key={surah.index} value={Number(surah.index)}>
                  {toArabicNumber(Number(surah.index))}. {surah.titleAr} ({toArabicNumber(surah.count)} آية)
                </option>
              ))}
            </select>
            {currentMeta && <p className="mt-2 text-xs text-stone-500">{currentMeta.type === 'Makkiyah' ? 'مكية' : currentMeta.type === 'Madaniyah' ? 'مدنية' : ''} {currentMeta.count ? `• ${toArabicNumber(currentMeta.count)} آية` : ''}</p>}
            {indexLoading && <p className="mt-2 text-xs text-stone-500">جارٍ تحميل قائمة السور…</p>}
            {indexError && <div className="mt-2 text-sm text-red-600 dark:text-red-400">{indexError}<button type="button" onClick={() => setIndexReload((value) => value + 1)} className="mr-2 underline font-bold">إعادة المحاولة</button></div>}
          </div>
          <div>
            <label htmlFor="quran-surah-search" className="block text-sm font-bold mb-2">البحث عن سورة</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input id="quran-surah-search" value={surahSearch} onChange={(event) => setSurahSearch(event.target.value)} placeholder="مثال: البقرة، يس، الرحمن" className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 pr-9 pl-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            {surahSearch.trim() && (
              <div className="mt-2 flex flex-wrap gap-2">
                {searchedSurahs.length ? searchedSurahs.map((surah) => (
                  <button type="button" key={surah.index} onClick={() => { setSelectedSurah(Number(surah.index)); setSurahSearch(''); setVerseSearch(''); }} className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-700/20 px-3 py-1.5 text-sm hover:border-amber-500">
                    {surah.titleAr}
                  </button>
                )) : <span className="text-xs text-stone-500">لم يتم العثور على سورة بهذا الاسم.</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800 pt-4">
          <div className="relative min-w-[210px] flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input value={verseSearch} onChange={(event) => setVerseSearch(event.target.value)} aria-label="البحث في آيات السورة" placeholder="ابحث داخل السورة الحالية" className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 pr-9 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-stone-200 dark:border-stone-700 p-1">
            <button type="button" onClick={() => setFontSize((value) => Math.max(20, value - 2))} disabled={fontSize <= 20} aria-label="تصغير الخط" className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40"><Minus className="w-4 h-4" /></button>
            <span className="min-w-14 text-center text-xs font-bold">حجم الخط</span>
            <button type="button" onClick={() => setFontSize((value) => Math.min(42, value + 2))} disabled={fontSize >= 42} aria-label="تكبير الخط" className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border border-amber-500/25 bg-[#fffdf6] dark:bg-stone-950 shadow-lg">
        <div className="bg-emerald-950 text-white px-4 sm:px-6 py-5 text-center border-b-2 border-amber-400/70">
          <p className="text-xs text-amber-300 mb-1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <h3 className="font-scheherazade text-2xl sm:text-3xl font-bold">{currentMeta?.titleAr || chapter?.name || 'القرآن الكريم'}</h3>
          {currentMeta && <p className="text-xs text-emerald-100/75 mt-1">السورة {toArabicNumber(selectedSurah)} من ١١٤</p>}
        </div>

        {chapterLoading && <div className="p-10 text-center text-stone-500">جارٍ تحميل آيات السورة…</div>}
        {chapterError && (
          <div className="p-8 text-center space-y-3">
            <p className="text-red-600 dark:text-red-400">{chapterError}</p>
            <button type="button" onClick={() => setChapterReload((value) => value + 1)} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600">إعادة المحاولة</button>
          </div>
        )}
        {!chapterLoading && !chapterError && chapter && (
          <div className="p-3 sm:p-6 space-y-2">
            {visibleVerses.map((verse) => {
              const key = `${selectedSurah}:${verse.number}`;
              const isBookmarked = bookmarks.includes(key);
              return (
                <article id={`quran-verse-${selectedSurah}-${verse.number}`} key={key} className="group rounded-2xl border border-transparent hover:border-amber-500/35 hover:bg-amber-50/70 dark:hover:bg-stone-900/80 px-3 sm:px-5 py-4 transition-colors scroll-mt-28">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-1 inline-flex items-center justify-center min-w-9 h-9 rounded-full border border-amber-500/40 bg-amber-500/10 text-emerald-800 dark:text-amber-300 text-xs font-bold">
                      {toArabicNumber(verse.number)}
                    </span>
                    <p className="min-w-0 flex-1 text-right font-scheherazade leading-[2.35] text-stone-900 dark:text-stone-100" style={{ fontSize: `${fontSize}px` }}>
                      {verse.text} <span className="text-amber-700 dark:text-amber-400" aria-label={`نهاية الآية ${verse.number}`}>۞</span>
                    </p>
                    <div className="flex shrink-0 flex-col sm:flex-row gap-1 opacity-80 sm:opacity-60 sm:group-hover:opacity-100">
                      <button type="button" onClick={() => toggleBookmark(verse.number)} aria-label={isBookmarked ? 'إزالة العلامة المرجعية' : 'حفظ الآية'} title={isBookmarked ? 'إزالة العلامة المرجعية' : 'حفظ الآية'} className={`p-2 rounded-lg hover:bg-white dark:hover:bg-stone-800 ${isBookmarked ? 'text-amber-600' : 'text-stone-500'}`}>
                        <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                      <button type="button" onClick={() => void copyVerse(verse)} aria-label="نسخ الآية" title="نسخ الآية" className="p-2 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-white dark:hover:bg-stone-800">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {visibleVerses.length === 0 && <p className="p-8 text-center text-stone-500">لا توجد آيات مطابقة لعبارة البحث في هذه السورة.</p>}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-amber-500/20 bg-amber-50/70 dark:bg-stone-900 px-4 sm:px-6 py-4">
          <button type="button" onClick={() => { setSelectedSurah((value) => Math.max(1, value - 1)); setVerseSearch(''); }} disabled={selectedSurah <= 1 || indexLoading} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm font-bold disabled:opacity-40 hover:border-emerald-700">
            <ChevronRight className="w-4 h-4" /> السورة السابقة
          </button>
          <span className="text-xs text-stone-500">{currentMeta ? `${toArabicNumber(selectedSurah)} / ١١٤` : ''}</span>
          <button type="button" onClick={() => { setSelectedSurah((value) => Math.min(114, value + 1)); setVerseSearch(''); }} disabled={selectedSurah >= 114 || indexLoading} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm font-bold disabled:opacity-40 hover:border-emerald-700">
            السورة التالية <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMessage && <p role="status" className="rounded-xl border border-emerald-700/20 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">{statusMessage}</p>}

      <p className="text-[11px] text-stone-500 text-center leading-relaxed">
        مصدر بيانات النص: <a className="underline hover:text-emerald-700" href="https://github.com/semarketir/quranjson" target="_blank" rel="noreferrer">Quran JSON على GitHub</a> — رخصة المستودع MIT. يتطلب تحميل النص اتصالًا بالإنترنت.
      </p>
    </section>
  );
};
