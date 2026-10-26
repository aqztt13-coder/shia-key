import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Navigation, Sparkles } from 'lucide-react';
import { PRESET_CITIES, calculateQiblaAngle } from '../utils/prayerTimes';
import { CityConfig } from '../types';

export const QiblaCompass: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityConfig>(PRESET_CITIES[0]); // Basra
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSupport, setHasCompassSupport] = useState<boolean>(false);

  const qiblaAngle = Math.round(calculateQiblaAngle(selectedCity.latitude, selectedCity.longitude));

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setHasCompassSupport(true);
        // alpha gives the rotation of the device around its Z axis in degrees [0, 360]
        setDeviceHeading(e.alpha);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation as EventListener, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
      }
    };
  }, []);

  // Needle rotation calculation
  const needleRotation = deviceHeading !== null ? (qiblaAngle - deviceHeading + 360) % 360 : qiblaAngle;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 dark:border-stone-800 transition-colors max-w-2xl mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Compass className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl font-bold font-scheherazade text-emerald-950 dark:text-emerald-400">
          تَحْدِيدُ اتِّجَاهِ القِبْلَةِ الشَّرِيفَة
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
        بوصلة حسابية دقيقة متجهة نحو الكعبة المشرفة في مكة المكرمة
      </p>

      {/* City Selector */}
      <div className="mb-8 max-w-sm mx-auto">
        <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5 text-right">
          المدينة الحالية:
        </label>
        <select
          aria-label="المدينة لحساب القبلة"
          value={selectedCity.id}
          onChange={(e) => {
            const found = PRESET_CITIES.find((c) => c.id === e.target.value);
            if (found) setSelectedCity(found);
          }}
          className="w-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-medium py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {PRESET_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.country})
            </option>
          ))}
        </select>
      </div>

      {/* Compass Dial */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-6 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 shadow-2xl flex items-center justify-center">
          {/* Degree markers */}
          <span className="absolute top-2 text-xs font-black text-rose-600">شمال (N)</span>
          <span className="absolute bottom-2 text-xs font-bold text-stone-400">جنوب (S)</span>
          <span className="absolute right-2 text-xs font-bold text-stone-400">شرق (E)</span>
          <span className="absolute left-2 text-xs font-bold text-stone-400">غرب (W)</span>
        </div>

        {/* Dynamic Rotating Qibla Needle */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${needleRotation}deg)` }}
        >
          <div className="flex flex-col items-center">
            {/* Kaaba pointer needle */}
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[90px] border-b-emerald-600 dark:border-b-emerald-500 drop-shadow-md"></div>
            {/* Center Pivot */}
            <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white shadow-md z-10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-950"></div>
            </div>
            {/* Opposite needle */}
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[70px] border-t-stone-400/60"></div>
          </div>
        </div>

        {/* Center Kaaba Badge */}
        <div className="absolute z-20 pointer-events-none mt-24">
          <div className="px-3 py-1 rounded-full bg-emerald-950 text-amber-300 text-[11px] font-bold border border-amber-400/40 shadow-lg">
            الكعبة: {qiblaAngle}°
          </div>
        </div>
      </div>

      {/* Info details */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-stone-700 dark:text-stone-300 max-w-md mx-auto">
        <p className="font-semibold text-emerald-900 dark:text-emerald-300">
          اتجاه الكعبة المشرفة من {selectedCity.name}:
        </p>
        <p className="mt-1 font-mono font-bold text-amber-600 dark:text-amber-400 text-base">
          {qiblaAngle} درجة عن اتجاه الشمال الحقيقي
        </p>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
          {hasCompassSupport
            ? 'مستشعر البوصلة في جهازك يعمل تلقائياً.'
            : 'اضبط رأس السهم ليتطابق مع زاوية القبلة الظاهرة بالنسبة لاتجاه الشمال.'}
        </p>
      </div>
    </div>
  );
};
