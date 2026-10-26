import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { soundEffects } from '../utils/soundAndHaptics';

interface PrayerDef {
  id: string;
  name: string;
  rakats: number;
  description: string;
}

const PRAYERS: PrayerDef[] = [
  { id: 'fajr', name: 'صلاة الصبح', rakats: 2, description: 'فريضة ثنائية' },
  { id: 'dhuhr', name: 'صلاة الظهر', rakats: 4, description: 'فريضة رباعية' },
  { id: 'asr', name: 'صلاة العصر', rakats: 4, description: 'فريضة رباعية' },
  { id: 'maghrib', name: 'صلاة المغرب', rakats: 3, description: 'فريضة ثلاثية' },
  { id: 'isha', name: 'صلاة العشاء', rakats: 4, description: 'فريضة رباعية' },
  { id: 'nafila', name: 'صلاة الليل / نافلة', rakats: 2, description: 'مستحبة ثنائية' },
];

export const RakatCounter: React.FC = () => {
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerDef>(PRAYERS[1]); // Dhuhr 4 default
  const [currentRakat, setCurrentRakat] = useState<number>(1);
  const [currentSajda, setCurrentSajda] = useState<number>(0); // 0 = standing/ruku, 1 = 1st sajda, 2 = 2nd sajda
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showAhkam, setShowAhkam] = useState<boolean>(false);

  const handleSajdaTap = () => {
    if (isCompleted) return;

    soundEffects.playRakatBell();
    soundEffects.vibrate(30);

    if (currentSajda === 0) {
      // First Sajda
      setCurrentSajda(1);
    } else if (currentSajda === 1) {
      // Second Sajda completed
      setCurrentSajda(2);

      // Check if this was the last rak'ah
      if (currentRakat >= selectedPrayer.rakats) {
        setIsCompleted(true);
        soundEffects.playCompletionChime();
        soundEffects.vibrate([60, 60, 100]);
      } else {
        // Move to next Rak'ah automatically after a short moment or on next action
        setTimeout(() => {
          setCurrentRakat((r) => r + 1);
          setCurrentSajda(0);
          soundEffects.vibrate(20);
        }, 600);
      }
    }
  };

  const handleReset = () => {
    setCurrentRakat(1);
    setCurrentSajda(0);
    setIsCompleted(false);
    soundEffects.vibrate(15);
  };

  const handlePrayerChange = (prayer: PrayerDef) => {
    setSelectedPrayer(prayer);
    setCurrentRakat(1);
    setCurrentSajda(0);
    setIsCompleted(false);
  };

  const getStatusText = () => {
    if (isCompleted) {
      return 'أتممت الصلاة بحمد الله - تقبل الله أعمالكم';
    }
    if (currentSajda === 0) {
      return `الركعة ${currentRakat} : القيام والركوع`;
    }
    if (currentSajda === 1) {
      return `الركعة ${currentRakat} : السجدة الأولى`;
    }
    if (currentSajda === 2) {
      return currentRakat === 2
        ? `الركعة ${currentRakat} : السجدة الثانية والتشهد`
        : `الركعة ${currentRakat} : السجدة الثانية`;
    }
    return '';
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 dark:border-stone-800 transition-colors max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-100 dark:border-stone-800 mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-scheherazade text-emerald-950 dark:text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            عَدَّادُ الرَّكَعَاتِ وَالسَّجَدَاتِ
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            مساعد تفاعلي بجانب التربة الحسينية لمنع السهو والشكوك في ركعات وسجدات الصلاة
          </p>
        </div>

        {/* Ahkam Doubts Toggle */}
        <button
          onClick={() => setShowAhkam(!showAhkam)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-all"
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>أحكام الشكوك والسهو</span>
        </button>
      </div>

      {/* Select Prayer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {PRAYERS.map((pr) => {
          const isSelected = selectedPrayer.id === pr.id;
          return (
            <button
              key={pr.id}
              onClick={() => handlePrayerChange(pr)}
              className={`p-2.5 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-800 to-teal-800 text-amber-300 border-amber-400 shadow-md font-bold'
                  : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="text-xs sm:text-sm font-scheherazade">{pr.name}</div>
              <div className="text-[10px] text-stone-400 dark:text-stone-400 mt-0.5">
                {pr.rakats} ركعات
              </div>
            </button>
          );
        })}
      </div>

      {/* Rakat Progress Stepper */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: selectedPrayer.rakats }).map((_, i) => {
          const rakNum = i + 1;
          const isDone = currentRakat > rakNum || isCompleted;
          const isCurrent = currentRakat === rakNum && !isCompleted;

          return (
            <div key={rakNum} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-sm sm:text-base border transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : isCurrent
                    ? 'bg-amber-400 text-emerald-950 border-amber-500 ring-2 ring-amber-400/50 shadow-md font-black scale-105'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700'
                }`}
              >
                {isDone ? '✓' : `ر ${rakNum}`}
              </div>
              {rakNum < selectedPrayer.rakats && (
                <div
                  className={`w-4 sm:w-6 h-0.5 rounded ${
                    isDone ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Interactive Touch Surface */}
      <div className="py-4 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-md">
          {/* Instructions Label */}
          <div className="text-center mb-3">
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 font-scheherazade px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 inline-block shadow-sm">
              {getStatusText()}
            </span>
          </div>

          {/* Large Sujood Tap Button */}
          <button
            onClick={handleSajdaTap}
            disabled={isCompleted}
            aria-label="تسجيل السجدة"
            className={`w-full h-56 sm:h-64 rounded-3xl shadow-2xl flex flex-col items-center justify-center select-none active:scale-98 transition-all duration-150 cursor-pointer border-4 text-white relative overflow-hidden ${
              isCompleted
                ? 'bg-gradient-to-tr from-emerald-900 to-teal-900 border-amber-400'
                : 'bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-950 border-amber-500/50 hover:border-amber-400'
            }`}
          >
            {isCompleted ? (
              <div className="text-center px-4 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold font-scheherazade text-amber-300">
                  اكتملت الصلاة بحمد الله
                </h3>
                <p className="text-xs text-emerald-200 mt-1">
                  «اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ»
                </p>
                <span className="text-xs text-amber-200/90 block mt-2">
                  يستحب الآن الإتيان بتسبيح الزهراء (ع)
                </span>
              </div>
            ) : (
              <div className="text-center px-4">
                <span className="text-xs uppercase tracking-wider text-amber-300/80 font-bold block mb-1">
                  انقر هنا عند السجود
                </span>
                <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white mb-2">
                  {currentRakat}
                  <span className="text-2xl text-emerald-300 font-sans font-bold">
                    /{selectedPrayer.rakats}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 mt-3">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      currentSajda >= 1
                        ? 'bg-amber-400 text-emerald-950 border-amber-500'
                        : 'bg-black/30 text-emerald-300 border-emerald-600/40'
                    }`}
                  >
                    السجدة ١ {currentSajda >= 1 ? '✓' : ''}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      currentSajda >= 2
                        ? 'bg-amber-400 text-emerald-950 border-amber-500'
                        : 'bg-black/30 text-emerald-300 border-emerald-600/40'
                    }`}
                  >
                    السجدة ٢ {currentSajda >= 2 ? '✓' : ''}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-200/70 mt-4">
                  ضع الهاتف بجوار التربة المسجدة وانقر برفق عند كل سجدة
                </p>
              </div>
            )}
          </button>
        </div>

        {/* Reset Control */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط الصلاة</span>
          </button>
        </div>
      </div>

      {/* Shia Ahkam of Doubts & Sujood al-Sahw Accordion */}
      {showAhkam && (
        <div className="mt-8 p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-4">
          <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-300 font-scheherazade flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            خلاصة أحكام الشكوك والسهو وفق الفقه الجعفري (السيد السيستاني / المشهور):
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
              <strong className="text-red-800 dark:text-red-300 block mb-1 font-bold">
                ١. الشكوك المبطلة للصلاة:
              </strong>
              <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 text-xs">
                <li>الشك في عدد ركعات الصلوات الثنائية (كالصبح) أو الثلاثية (كالمغرب).</li>
                <li>الشك في الركعتين الأوليين من الصلوات الرباعية قبل إكمال السجدتين.</li>
                <li>الشك بين اثنتين وخمس أو اثنتين وأكثر في الرباعية.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <strong className="text-emerald-800 dark:text-emerald-300 block mb-1 font-bold">
                ٢. الشكوك الصحيحة (وعلاجها صلاة الاحتياط):
              </strong>
              <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 text-xs">
                <li>
                  <strong>بين ٣ و٤:</strong> يبني على ٤ ويتم صلاته، ثم يأتي بركعة احتياط من قيام أو ركعتين من جلوس.
                </li>
                <li>
                  <strong>بين ٢ و٤ (بعد إكمال السجدتين):</strong> يبني على ٤ ويصلي ركعتين احتياط من قيام.
                </li>
                <li>
                  <strong>بين ٢ و٣ و٤:</strong> يبني على ٤، ويصلي ركعتين احتياط من قيام ثم ركعتين من جلوس.
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
              <strong className="text-blue-800 dark:text-blue-300 block mb-1 font-bold">
                ٣. الشكوك التي لا يُعتنى بها:
              </strong>
              <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 text-xs">
                <li>شك «كثير الشك» (لا يعتني بشكه ويبني على الصحة).</li>
                <li>الشك بعد الفراغ من الصلاة أو بعد انقضاء وقتها.</li>
                <li>الشك في فعل من أفعال الصلاة بعد الدخول في الجزء اللاحق.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <strong className="text-amber-800 dark:text-amber-300 block mb-1 font-bold">
                ٤. كيفية سجدتي السهو:
              </strong>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                تؤدى فوراً بعد التسليم: يسجد سجدتين ويقول في كل واحدة:
                <br />
                <span className="font-scheherazade text-amber-900 dark:text-amber-300 font-bold">
                  «بِسْمِ اللهِ وَبِاللهِ، السَّلامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ»
                </span>
                <br />
                ثم يجلس ويتشهد ويسلم.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
