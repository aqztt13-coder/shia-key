import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  X,
  Volume2,
  CheckCircle,
  Hash,
} from 'lucide-react';
import { DuaCategory, DuaItem } from '../types';
import { DUAS_AND_ZIYARAT } from '../data/duasAndZiyarat';
import { soundEffects } from '../utils/soundAndHaptics';

interface DuaReaderProps {
  initialDuaId?: string | null;
  onCloseReader?: () => void;
}

export const DuaReader: React.FC<DuaReaderProps> = ({ initialDuaId }) => {
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDua, setActiveDua] = useState<DuaItem | null>(null);

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(22);
  const [readerTheme, setReaderTheme] = useState<'parchment' | 'dark' | 'emerald'>('parchment');
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.5); // pixels per frame

  // Interactive In-Text Counters (e.g. for Ziyarat Ashura: laan_100, salam_100, tasbeeh_zahra)
  const [counters, setCounters] = useState<Record<string, number>>({});

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRafRef = useRef<number | null>(null);

  // Open initial dua if provided
  useEffect(() => {
    if (initialDuaId) {
      const found = DUAS_AND_ZIYARAT.find((d) => d.id === initialDuaId);
      if (found) {
        setActiveDua(found);
      }
    }
  }, [initialDuaId]);

  // Handle auto-scroll loop
  useEffect(() => {
    if (!isAutoScrolling || !contentContainerRef.current) {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
      }
      return;
    }

    const scrollContainer = contentContainerRef.current;
    let lastTime = performance.now();

    const scrollStep = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 16; // normalized to 60fps
      lastTime = currentTime;

      if (scrollContainer) {
        scrollContainer.scrollTop += scrollSpeed * delta;

        // Check if reached bottom
        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 5
        ) {
          setIsAutoScrolling(false);
          return;
        }
      }

      autoScrollRafRef.current = requestAnimationFrame(scrollStep);
    };

    autoScrollRafRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
      }
    };
  }, [isAutoScrolling, scrollSpeed]);

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'ziyarat', label: 'الزيارات المشهورة' },
    { id: 'duas', label: 'الأدعية المأثورة' },
    { id: 'taqibat', label: 'تعقيبات الصلاة' },
    { id: 'daily_deeds', label: 'أعمال الأيام' },
    { id: 'munajat', label: 'المناجاة الخمس عشرة' },
  ];

  const filteredDuas = DUAS_AND_ZIYARAT.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.content.includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleIncrementCounter = (counterId: string, target: number) => {
    const current = counters[counterId] || 0;
    if (current < target) {
      const next = current + 1;
      setCounters((prev) => ({ ...prev, [counterId]: next }));
      soundEffects.playTasbeehClick();
      soundEffects.vibrate(18);

      if (next === target) {
        soundEffects.playCompletionChime();
        soundEffects.vibrate([40, 60, 100]);
      }
    }
  };

  const handleResetCounter = (counterId: string) => {
    setCounters((prev) => ({ ...prev, [counterId]: 0 }));
    soundEffects.vibrate(20);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-stone-800 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-scheherazade text-emerald-950 dark:text-emerald-400 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-500" />
              مفاتيح الجنان وقارئ الأدعية والزيارات
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              النصوص الكاملة الصحيحة مضبوطة بالتشكيل التام مع ميزات التمرير والعدادات المدمجة
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              aria-label="البحث السريع في الأدعية والزيارات"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن دعاء، زيارة، أو كلمة..."
              className="w-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm py-2.5 pr-10 pl-4 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as DuaCategory | 'all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-amber-300 shadow-md shadow-emerald-900/30'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Duas and Ziyarat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDuas.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setActiveDua(item);
              setIsAutoScrolling(false);
            }}
            className="group bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-md hover:shadow-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400/50 dark:hover:border-amber-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-medium">
                  {item.source}
                </span>
                {item.interactiveCounters && item.interactiveCounters.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> عداد مدمج
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold font-scheherazade text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors">
                {item.title}
              </h3>

              {item.subtitle && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.subtitle}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-amber-400">
              <span>عرض النص بالكامل </span>
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </div>
        ))}

        {filteredDuas.length === 0 && (
          <div className="col-span-full py-12 text-center text-stone-500 dark:text-stone-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold">لم يتم العثور على نتائج تطابق بحثك</p>
            <p className="text-xs mt-1">جرّب البحث باسم الدعاء أو الكلمات المفتاحية</p>
          </div>
        )}
      </div>

      {/* Reader Modal / Overlay */}
      {activeDua && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border transition-colors ${
              readerTheme === 'dark'
                ? 'bg-stone-950 text-stone-100 border-stone-800'
                : readerTheme === 'emerald'
                ? 'bg-[#032b28] text-emerald-50 border-emerald-800'
                : 'bg-[#faf8f2] text-stone-900 border-amber-200'
            }`}
          >
            {/* Modal Top Bar */}
            <div className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveDua(null)}
                  className="p-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all"
                  aria-label="إغلاق القارئ"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-scheherazade">
                    {activeDua.title}
                  </h3>
                  <span className="text-[11px] opacity-75">{activeDua.source}</span>
                </div>
              </div>

              {/* Reader Controls */}
              <div className="flex items-center gap-2">
                {/* Font Size Adjusters */}
                <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-xl p-1 border border-black/10 dark:border-white/10">
                  <button
                    onClick={() => setFontSize((s) => Math.max(16, s - 2))}
                    className="p-1.5 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg"
                    title="تصغير الخط"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold">{fontSize}</span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(38, s + 2))}
                    className="p-1.5 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg"
                    title="تكبير الخط"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setReaderTheme('parchment')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      readerTheme === 'parchment'
                        ? 'bg-amber-100 text-stone-900 shadow-sm font-bold'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    ورقي
                  </button>
                  <button
                    onClick={() => setReaderTheme('emerald')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      readerTheme === 'emerald'
                        ? 'bg-emerald-800 text-white shadow-sm font-bold'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    زمردي
                  </button>
                  <button
                    onClick={() => setReaderTheme('dark')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      readerTheme === 'dark'
                        ? 'bg-stone-800 text-white shadow-sm font-bold'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    ليلي
                  </button>
                </div>

                {/* Auto-Scroll Toggle */}
                <div className="flex items-center bg-emerald-800/20 text-emerald-700 dark:text-emerald-300 rounded-xl p-1 border border-emerald-600/30">
                  <button
                    onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isAutoScrolling
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    title="التمرير التلقائي للنص"
                  >
                    {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoScrolling ? 'إيقاف' : 'تمرير تلقائي'}</span>
                  </button>

                  {isAutoScrolling && (
                    <select
                      aria-label="سرعة التمرير التلقائي"
                      value={scrollSpeed}
                      onChange={(e) => setScrollSpeed(Number(e.target.value))}
                      className="bg-transparent text-xs font-bold pr-1 pl-2 border-r border-emerald-600/30 focus:outline-none cursor-pointer"
                    >
                      <option value="0.8" className="text-stone-900">بطيء</option>
                      <option value="1.5" className="text-stone-900">متوسط</option>
                      <option value="2.5" className="text-stone-900">سريع</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* In-Text Interactive Counters Bar (If available, e.g. Ziyarat Ashura) */}
            {activeDua.interactiveCounters && activeDua.interactiveCounters.length > 0 && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                  <Hash className="w-4 h-4" />
                  العدادات المدمجة المخصصة داخل الزيارة (انقر عند القراءة للعد التلقائي):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeDua.interactiveCounters.map((counter) => {
                    const current = counters[counter.id] || 0;
                    const isCompleted = current >= counter.target;
                    const progressPercent = Math.min(100, Math.round((current / counter.target) * 100));

                    return (
                      <div
                        key={counter.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/20 border-emerald-500/50'
                            : 'bg-black/5 dark:bg-white/5 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold">{counter.label}</span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300">
                            {current} / {counter.target}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-amber-400 h-2 rounded-full transition-all duration-200"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>

                        {/* Interactive Increment & Reset Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleIncrementCounter(counter.id, counter.target)}
                            disabled={isCompleted}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>اكتملت المائة مرّة مباركاً</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>عدّ مرّة (+1)</span>
                              </>
                            )}
                          </button>

                          {current > 0 && (
                            <button
                              onClick={() => handleResetCounter(counter.id)}
                              className="p-2 rounded-xl bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-all text-xs"
                              title="إعادة التصفير"
                              aria-label="تصفير العداد"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scrollable Text Body */}
            <div
              ref={contentContainerRef}
              className="p-6 sm:p-10 overflow-y-auto space-y-6 flex-1 text-justify select-text leading-loose"
              style={{ fontSize: `${fontSize}px` }}
            >
              {activeDua.significance && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                  <strong className="text-amber-700 dark:text-amber-400 block mb-1 font-bold">
                    فضيلة وأجر هذا النص:
                  </strong>
                  {activeDua.significance}
                </div>
              )}

              {/* Formatted Text with Tashkeel in Amiri/Scheherazade */}
              <div
                className="font-scheherazade whitespace-pre-line tracking-wide leading-[2.4]"
                style={{ fontSize: `${fontSize}px` }}
              >
                {activeDua.content}
              </div>

              {/* Bottom Islamic Closing seal */}
              <div className="pt-8 text-center text-xs opacity-60 font-sans border-t border-black/10 dark:border-white/10">
                «تقبل الله طاعاتكم وزياراتكم، ونسألكم خالص الدعاء»
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
