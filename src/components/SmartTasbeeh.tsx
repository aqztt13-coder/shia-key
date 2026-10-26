import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Heart,
  Award,
  Layers,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { soundEffects } from '../utils/soundAndHaptics';

export const SmartTasbeeh: React.FC = () => {
  const [mode, setMode] = useState<'zahra' | 'free'>('zahra');

  // Mode 1: Tasbeeh Al-Zahra State
  // Stage 0: Allahu Akbar (34), Stage 1: Alhamdulillah (33), Stage 2: Subhanallah (33)
  const [zahraStage, setZahraStage] = useState<number>(0);
  const [zahraCount, setZahraCount] = useState<number>(0);
  const [zahraCompleted, setZahraCompleted] = useState<boolean>(false);

  // Mode 2: Free Tasbeeh State
  const freeAzkarPresets = [
    'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ وَعَجِّلْ فَرَجَهُمْ',
    'أَسْتَغْفِرُ اللهَ رَبِّي وَأَتُوبُ إِلَيْهِ',
    'سُبْحَانَ اللهِ وَالحَمْدُ للهِ وَلا إِلَهَ إِلا اللهُ وَاللهُ أَكْبَرُ',
    'لا حَوْلَ وَلا قُوَّةَ إِلا بِاللهِ العَلِيِّ العَظِيمِ',
    'يَا عَلِيُّ أَدْرِكْنِي',
    'يَا فَاطِمَةُ الزَّهْرَاءُ أَغِيثِينِي',
    'يَا صَاحِبَ الزَّمَانِ أَدْرِكْنَا',
    'يَا قَاضِيَ الحَاجَاتِ',
  ];

  const [selectedZikr, setSelectedZikr] = useState<string>(freeAzkarPresets[0]);
  const [freeCount, setFreeCount] = useState<number>(0);
  const [freeTarget, setFreeTarget] = useState<number>(100);
  const [freeTotalToday, setFreeTotalToday] = useState<number>(0);
  const [showZahraInfo, setShowZahraInfo] = useState<boolean>(false);

  const zahraStages = [
    { name: 'اللهُ أَكْبَرُ', target: 34, color: 'from-amber-500 to-amber-700', label: 'التكبير' },
    { name: 'الحَمْدُ للهِ', target: 33, color: 'from-emerald-600 to-teal-800', label: 'التحميد' },
    { name: 'سُبْحَانَ اللهِ', target: 33, color: 'from-cyan-600 to-blue-800', label: 'التسبيح' },
  ];

  // Handler for Tasbeeh Al-Zahra Tap
  const handleZahraTap = () => {
    if (zahraCompleted) return;

    soundEffects.playTasbeehClick();
    soundEffects.vibrate(20);

    const currentStageObj = zahraStages[zahraStage];
    const nextCount = zahraCount + 1;

    if (nextCount >= currentStageObj.target) {
      if (zahraStage < 2) {
        // Move to next stage automatically
        setZahraStage(zahraStage + 1);
        setZahraCount(0);
        soundEffects.playTransitionChime();
        soundEffects.vibrate([30, 50, 40]);
      } else {
        // Completed all 3 stages!
        setZahraCount(currentStageObj.target);
        setZahraCompleted(true);
        soundEffects.playCompletionChime();
        soundEffects.vibrate([60, 80, 100]);
      }
    } else {
      setZahraCount(nextCount);
    }
  };

  const handleResetZahra = () => {
    setZahraStage(0);
    setZahraCount(0);
    setZahraCompleted(false);
    soundEffects.vibrate(15);
  };

  // Handler for Free Mode Tap
  const handleFreeTap = () => {
    soundEffects.playTasbeehClick();
    soundEffects.vibrate(20);

    const nextCount = freeCount + 1;
    setFreeCount(nextCount);
    setFreeTotalToday((t) => t + 1);

    if (freeTarget > 0 && nextCount === freeTarget) {
      soundEffects.playCompletionChime();
      soundEffects.vibrate([50, 80, 100]);
    }
  };

  const handleResetFree = () => {
    setFreeCount(0);
    soundEffects.vibrate(15);
  };

  // Progress percentage calculation
  const currentStage = zahraStages[zahraStage];
  const zahraStageProgress = Math.round((zahraCount / currentStage.target) * 100);
  const totalZahraDone =
    (zahraStage === 0 ? zahraCount : zahraStage === 1 ? 34 + zahraCount : 34 + 33 + zahraCount);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 dark:border-stone-800 transition-colors max-w-3xl mx-auto">
      {/* Top Selector: Mode Selection */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-100 dark:border-stone-800 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-scheherazade text-emerald-950 dark:text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            المَسْبَحَةُ الذَّكِيَّة
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            أذكار وتسبيحات بنمط تسبيح الصديقة الطاهرة فاطمة الزهراء (ع) ونمط التسبيح المفتوح
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setMode('zahra')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'zahra'
                ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-amber-300 shadow-md'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            تسبيح الزهراء (ع)
          </button>
          <button
            onClick={() => setMode('free')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'free'
                ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-amber-300 shadow-md'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            التسبيح المفتوح
          </button>
        </div>
      </div>

      {/* MODE 1: TASBEEH AL-ZAHRA */}
      {mode === 'zahra' && (
        <div className="space-y-6">
          {/* Header Stages Indicator */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {zahraStages.map((stg, idx) => {
              const isCurrent = zahraStage === idx && !zahraCompleted;
              const isPassed = zahraStage > idx || zahraCompleted;

              return (
                <div
                  key={stg.name}
                  className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-950 dark:to-teal-950 border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-102'
                      : isPassed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 opacity-60'
                  }`}
                >
                  <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1 flex items-center justify-center gap-1">
                    {isPassed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : null}
                    {stg.label} ({stg.target})
                  </div>
                  <div className="text-sm sm:text-base font-bold font-scheherazade text-stone-900 dark:text-stone-100">
                    {stg.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Central Tasbeeh Counter Circle */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative">
              {/* Outer Decorative Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 via-amber-400/20 to-teal-500/20 blur-xl"></div>

              {/* Huge Circular Tap Area */}
              <button
                onClick={handleZahraTap}
                disabled={zahraCompleted}
                aria-label={`تسبيح: ${currentStage.name}`}
                className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full shadow-2xl flex flex-col items-center justify-center select-none active:scale-95 transition-all duration-150 cursor-pointer border-8 ${
                  zahraCompleted
                    ? 'bg-gradient-to-tr from-emerald-900 to-teal-900 border-amber-400 text-amber-200'
                    : 'bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-950 border-amber-500/40 hover:border-amber-400 text-white'
                }`}
              >
                {/* SVG Radial Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    className="stroke-emerald-950/40 fill-none"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    className="stroke-amber-400 fill-none transition-all duration-150"
                    strokeWidth="5"
                    strokeDasharray={280}
                    strokeDashoffset={280 - (280 * (zahraCompleted ? 100 : zahraStageProgress)) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                {zahraCompleted ? (
                  <div className="text-center px-4 animate-in zoom-in duration-300">
                    <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                    <span className="text-xl font-bold font-scheherazade text-amber-300 block">
                      تقبّل الله طاعتكم
                    </span>
                    <p className="text-xs text-emerald-200 mt-1">
                      اكتمل تسبيح فاطمة الزهراء (ع) ١٠٠ مرّة
                    </p>
                    <span className="text-xs text-amber-400/90 block mt-2 font-scheherazade">
                      «لا إِلَهَ إِلا اللهُ»
                    </span>
                  </div>
                ) : (
                  <div className="text-center px-4">
                    <span className="text-xs uppercase tracking-widest text-emerald-300/80 font-medium block mb-1">
                      {currentStage.label}
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-extrabold font-scheherazade text-amber-300 mb-2 drop-shadow-sm">
                      {currentStage.name}
                    </h3>
                    <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                      {zahraCount}
                    </div>
                    <span className="text-xs text-emerald-300 mt-2 block font-medium">
                      المستهدف: {currentStage.target} مرّة
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Total progress out of 100 */}
            <div className="mt-6 flex items-center justify-between w-full max-w-sm px-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
              <span>الإجمالي: {totalZahraDone} / ١٠٠</span>
              <button
                onClick={handleResetZahra}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة البدء</span>
              </button>
            </div>
          </div>

          {/* Virtues of Tasbeeh Al-Zahra Accordion */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <button
              onClick={() => setShowZahraInfo(!showZahraInfo)}
              className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                فضل تسبيح الزهراء (ع) في روايات أهل البيت:
              </span>
              <span className="text-xs text-emerald-700 dark:text-amber-400">
                {showZahraInfo ? 'إخفاء' : 'عرض المزيد'}
              </span>
            </button>

            {showZahraInfo && (
              <p className="mt-3 text-xs leading-relaxed text-stone-700 dark:text-stone-300 font-scheherazade text-sm">
                عن الإمام الصادق (عليه السلام): «تَسْبِيحُ فَاطِمَةَ الزَّهْرَاءِ (ع) فِي كُلِّ يَوْمٍ فِي دُبُرِ كُلِّ صَلاةٍ أَحَبُّ إِلَيَّ مِنْ صَلاةِ أَلْفِ رَكْعَةٍ فِي كُلِّ يَوْمٍ»، وتبدأ بالتكبير (٣٤) ثم التحميد (٣٣) ثم التسبيح (٣٣).
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: FREE OPEN TASBEEH */}
      {mode === 'free' && (
        <div className="space-y-6">
          {/* Preset Azkar Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              اختر الذكر المفضل:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {freeAzkarPresets.map((zk) => (
                <button
                  key={zk}
                  onClick={() => {
                    setSelectedZikr(zk);
                    setFreeCount(0);
                  }}
                  className={`p-3 rounded-2xl text-xs sm:text-sm font-scheherazade text-right transition-all border ${
                    selectedZikr === zk
                      ? 'bg-emerald-800 text-amber-300 border-amber-400 font-bold shadow-md'
                      : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {zk}
                </button>
              ))}
            </div>
          </div>

          {/* Target Count Selection */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-xs font-semibold text-stone-500">العدد المستهدف:</span>
            <div className="flex gap-1.5">
              {[33, 70, 100, 1000, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => setFreeTarget(num)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    freeTarget === num
                      ? 'bg-amber-400 text-emerald-950 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {num === 0 ? 'مفتوح' : num}
                </button>
              ))}
            </div>
          </div>

          {/* Central Tap Area */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative">
              <button
                onClick={handleFreeTap}
                className="w-64 h-64 sm:w-72 sm:h-72 rounded-full shadow-2xl flex flex-col items-center justify-center bg-gradient-to-b from-emerald-900 via-teal-900 to-emerald-950 border-8 border-amber-500/30 hover:border-amber-400 active:scale-95 transition-all duration-150 cursor-pointer text-white px-4 select-none"
              >
                <span className="text-xs text-amber-300/80 mb-2 font-medium max-w-[200px] text-center line-clamp-2">
                  {selectedZikr}
                </span>
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-amber-300">
                  {freeCount}
                </div>
                {freeTarget > 0 && (
                  <span className="text-xs text-emerald-300 mt-2">
                    الهدف: {freeTarget} مرّة
                  </span>
                )}
              </button>
            </div>

            {/* Total Today & Reset */}
            <div className="mt-6 flex items-center justify-between w-full max-w-sm px-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
              <span>إجمالي تسبيحاتك اليوم: {freeTotalToday}</span>
              <button
                onClick={handleResetFree}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تصفير العداد</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
