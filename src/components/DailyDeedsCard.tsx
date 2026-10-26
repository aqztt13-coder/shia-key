import React, { useState } from 'react';
import { Calendar, BookOpen, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { WEEKLY_DEEDS } from '../data/dailyDeeds';
import { soundEffects } from '../utils/soundAndHaptics';

interface DailyDeedsCardProps {
  onOpenDua: (duaId: string) => void;
}

export const DailyDeedsCard: React.FC<DailyDeedsCardProps> = ({ onOpenDua }) => {
  // Current day index (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  const todayIndex = new Date().getDay();
  const [activeDayIndex, setActiveDayIndex] = useState<number>(todayIndex);
  const [completedActs, setCompletedActs] = useState<Record<string, boolean>>({});

  const deed = WEEKLY_DEEDS.find((d) => d.dayIndex === activeDayIndex) || WEEKLY_DEEDS[0];

  const toggleAct = (actKey: string) => {
    soundEffects.playTasbeehClick();
    soundEffects.vibrate(15);
    setCompletedActs((prev) => ({
      ...prev,
      [actKey]: !prev[actKey],
    }));
  };

  const dayTabs = [
    { index: 6, label: 'السبت' },
    { index: 0, label: 'الأحد' },
    { index: 1, label: 'الإثنين' },
    { index: 2, label: 'الثلاثاء' },
    { index: 3, label: 'الأربعاء' },
    { index: 4, label: 'الخميس' },
    { index: 5, label: 'الجمعة' },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 dark:border-stone-800 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-semibold mb-1">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold font-scheherazade">
              أعمال وأدعية الأيام
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            زيارات المعصومين وأدعية أيام الأسبوع المأثورة عن العترة الطاهرة (عليهم السلام)
          </p>
        </div>

        {/* Days of week selector tabs */}
        <div className="flex space-x-1.5 space-x-reverse overflow-x-auto pb-1 max-w-full">
          {dayTabs.map((day) => {
            const isToday = day.index === todayIndex;
            const isSelected = day.index === activeDayIndex;

            return (
              <button
                key={day.index}
                onClick={() => setActiveDayIndex(day.index)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                  isSelected
                    ? 'bg-emerald-800 text-amber-300 shadow-md shadow-emerald-900/30'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {day.label}
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 left-1"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Day Highlight Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 sm:p-7 shadow-lg border border-amber-500/20 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium">
                {deed.hijriDayName}
              </span>
              {activeDayIndex === todayIndex && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold">
                  اليوم الحالي
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-scheherazade mb-2">
              {deed.dedicatedImams}
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
              {deed.significance}
            </p>
          </div>

          {/* Quick Actions to Read Dua & Ziyarat */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onOpenDua(deed.recommendedDuaId)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 text-emerald-950 hover:bg-amber-300 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>قراءة {deed.recommendedDuaTitle}</span>
            </button>

            <button
              onClick={() => onOpenDua(deed.recommendedZiyaratId)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white border border-emerald-600/40 font-semibold text-sm transition-all active:scale-95"
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>قراءة {deed.recommendedZiyaratTitle}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Acts Checklist */}
      <div>
        <h4 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-2 font-scheherazade">
          <Sparkles className="w-4 h-4 text-amber-500" />
          المستحبات والسنن المؤكدة لـ {deed.dayName}:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {deed.specialActs.map((act, idx) => {
            const key = `${activeDayIndex}_${idx}`;
            const isDone = !!completedActs[key];

            return (
              <div
                key={key}
                onClick={() => toggleAct(key)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isDone
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400/50 text-stone-500 line-through'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700 hover:border-emerald-500/40 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="mt-0.5">
                  <CheckCircle2
                    className={`w-5 h-5 transition-colors ${
                      isDone ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-100' : 'text-stone-300 dark:text-stone-600'
                    }`}
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium leading-snug">{act}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
