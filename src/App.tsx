
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PrayerTimesCard } from './components/PrayerTimesCard';
import { DailyDeedsCard } from './components/DailyDeedsCard';
import { DuaReader } from './components/DuaReader';
import { SmartTasbeeh } from './components/SmartTasbeeh';
import { RakatCounter } from './components/RakatCounter';
import { QiblaCompass } from './components/QiblaCompass';
import { QuranReader } from './components/QuranReader';
import {
  Sparkles,
  BookOpen,
  Compass,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDuaId, setSelectedDuaId] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('haqiba_theme');

      if (saved) return saved === 'dark';

      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return false;
  });

  // Sync dark mode with the document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('haqiba_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('haqiba_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleOpenDua = (duaId: string) => {
    setSelectedDuaId(duaId);
    setCurrentTab('duas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">

      {/* Top Header & Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);

          if (tab !== 'duas') {
            setSelectedDuaId(null);
          }

          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">

        {/* Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8">

            {/* Welcome Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 shadow-2xl border border-amber-500/30 relative overflow-hidden">
              <div className="max-w-2xl relative z-10">

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold font-scheherazade text-amber-200 mb-2">
                  أَهْلاً بِكُمْ فِي مفاتيح المُؤْمِنين
                </h2>

                <p className="text-sm text-emerald-100/90 leading-relaxed font-sans">
                  رفيقك العبادي اليومي وفق فقه آل البيت (عليهم السلام):
                  مواقيت الصلاة الجعفرية، أدعية وزيارات مفاتيح الجنان
                  بالتشكيل الكامل، المسبحة الذكية، وعداد الركعات والسجدات
                  لمنع السهو في الصلاة.
                </p>

                {/* Quick Shortcuts */}
                <div className="flex flex-wrap items-center gap-2.5 mt-5">

                  <button
                    onClick={() => handleOpenDua('ziyarat_ashura')}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>زيارة عاشوراء (مع العداد)</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('quran')}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>القرآن الكريم</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('tasbeeh')}
                    className="px-4 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white border border-emerald-600/40 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>تسبيح الزهراء (ع)</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('rakat')}
                    className="px-4 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white border border-emerald-600/40 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>عداد ركعات الصلاة</span>
                  </button>

                </div>
              </div>
            </div>

            {/* Prayer Times */}
            <section aria-label="مواقيت الصلاة الشرعية">
              <PrayerTimesCard />
            </section>

            {/* Daily Deeds */}
            <section aria-label="أعمال وأدعية الأيام">
              <DailyDeedsCard onOpenDua={handleOpenDua} />
            </section>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Tasbeeh Card */}
              <div
                onClick={() => setCurrentTab('tasbeeh')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setCurrentTab('tasbeeh');
                  }
                }}
                role="button"
                tabIndex={0}
                className="group bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold font-scheherazade text-stone-900 dark:text-stone-100 group-hover:text-amber-500 transition-colors">
                    المسبحة الذكية
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    تسبيح الصديقة الزهراء (٣٤ الله أكبر، ٣٣ الحمد لله،
                    ٣٣ سبحان الله) بنظام الانتقال الآلي والتسبيح المفتوح.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-amber-400">
                  <span>فتح المسبحة</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>

              {/* Rakat Counter Card */}
              <div
                onClick={() => setCurrentTab('rakat')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setCurrentTab('rakat');
                  }
                }}
                role="button"
                tabIndex={0}
                className="group bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold font-scheherazade text-stone-900 dark:text-stone-100 group-hover:text-emerald-500 transition-colors">
                    عداد الركعات والسجدات
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    مساعد الصلاة لعلاج الشكوك والسهو بجانب التربة الحسينية
                    مع أحكام الشكوك وصلاة الاحتياط.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-amber-400">
                  <span>بدء الصلاة</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>

              {/* Qibla Card */}
              <div
                onClick={() => setCurrentTab('qibla')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setCurrentTab('qibla');
                  }
                }}
                role="button"
                tabIndex={0}
                className="group bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                    <Compass className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold font-scheherazade text-stone-900 dark:text-stone-100 group-hover:text-teal-500 transition-colors">
                    اتجاه القبلة الشريفة
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    بوصلة تفاعلية وزاوية الكعبة المشرفة وفق إحداثيات المدن
                    العراقية والمقدسة أو موقعك المباشر.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-amber-400">
                  <span>تحديد القبلة</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Quran Reader */}
        {currentTab === 'quran' && (
          <div className="space-y-6">
            <QuranReader />
          </div>
        )}

        {/* Prayer Times */}
        {currentTab === 'prayers' && (
          <div className="space-y-6">
            <PrayerTimesCard />
          </div>
        )}

        {/* Daily Deeds */}
        {currentTab === 'daily_deeds' && (
          <div className="space-y-6">
            <DailyDeedsCard onOpenDua={handleOpenDua} />
          </div>
        )}

        {/* Duas & Ziyarat */}
        {currentTab === 'duas' && (
          <div className="space-y-6">
            <DuaReader initialDuaId={selectedDuaId} />
          </div>
        )}

        {/* Smart Tasbeeh */}
        {currentTab === 'tasbeeh' && (
          <div className="space-y-6">
            <SmartTasbeeh />
          </div>
        )}

        {/* Rakat Counter */}
        {currentTab === 'rakat' && (
          <div className="space-y-6">
            <RakatCounter />
          </div>
        )}

        {/* Qibla Compass */}
        {currentTab === 'qibla' && (
          <div className="space-y-6">
            <QiblaCompass />
          </div>
        )}

      </main>

      {/* Islamic Footer */}
      <footer className="mt-16 bg-emerald-950 text-white border-t border-amber-500/30 py-8 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-3">

          <p className="font-scheherazade text-lg sm:text-xl text-amber-300">
            «اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ وَعَجِّلْ فَرَجَهُمْ وَأَهْلِكْ عَدُوَّهُمْ»
          </p>

          <p className="text-xs text-emerald-200/80">
            مفاتيح المؤمنين • تطبيق إسلامي شيعي اثنا عشري شامل للقرآن الكريم والمواقيت الشرعية ومفاتيح الجنان
          </p>

          <p className="text-[11px] text-stone-400">
            جميع النصوص مأخوذة ومحققة من كتاب «مفاتيح الجنان» للمحدث الشيخ عباس القمي (قدس سره)
          </p>

          {/* Contact & Support */}
          <div className="mt-5 border-t border-emerald-800/70 pt-5">
            <h3 className="text-sm font-bold text-amber-300 mb-2">
              التواصل والدعم
            </h3>

            <p className="text-xs text-emerald-100/80 mb-4 leading-relaxed">
              لاستفساراتكم وملاحظاتكم واقتراحاتكم، يسعدنا تواصلكم معنا
              للمساهمة في تطوير التطبيق وخدمة المؤمنين.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3">

              <a
                href="mailto:engali9a8@gmail.com"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-900/60 px-4 py-2.5 text-xs text-emerald-100 transition hover:bg-emerald-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="التواصل عبر البريد الإلكتروني"
              >
                <span aria-hidden="true">✉️</span>
                البريد الإلكتروني
              </a>

              <a
                href="https://t.me/engli98"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-900/60 px-4 py-2.5 text-xs text-emerald-100 transition hover:bg-emerald-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="التواصل عبر تليجرام"
              >
                <span aria-hidden="true">✈️</span>
                تليجرام
              </a>

            </div>
          </div>

          <p className="pt-3 text-[10px] text-emerald-300/60">
            نسأل الله القبول والتوفيق لخدمة المؤمنين
          </p>

        </div>
      </footer>

    </div>
  );
}
