
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  MapPin,
  Clock,
  LocateFixed,
  Info,
  Sunrise,
  Sun,
  Moon,
} from "lucide-react";

import {
  PRESET_CITIES,
  calculateJaafariPrayerTimes,
} from "../utils/prayerTimes";

import type {
  CityConfig,
  PrayerTimesResult,
  PrayerKey,
} from "../utils/prayerTimes";

interface PrayerTimesCardProps {
  onSelectCity?: (city: CityConfig) => void;
}

const PRAYER_CARDS: {
  key: PrayerKey;
  title: string;
  subtitle: string;
  icon: typeof Sunrise;
}[] = [
  {
    key: "fajr",
    title: "صلاة الصبح",
    subtitle: "وقت الفجر",
    icon: Sunrise,
  },
  {
    key: "dhuhr",
    title: "صلاة الظهرين",
    subtitle: "وقت الظهر",
    icon: Sun,
  },
  {
    key: "maghrib",
    title: "صلاة العشاءين",
    subtitle: "وقت المغرب",
    icon: Moon,
  },
];

function formatCountdown(totalMinutes: number): string {
  const minutesSafe = Math.max(0, totalMinutes);
  const hours = Math.floor(minutesSafe / 60);
  const minutes = minutesSafe % 60;

  if (hours === 0) {
    return `${minutes} دقيقة`;
  }

  if (minutes === 0) {
    return `${hours} ساعة`;
  }

  return `${hours} ساعة و${minutes} دقيقة`;
}

export function PrayerTimesCard({
  onSelectCity,
}: PrayerTimesCardProps) {
  const [selectedCity, setSelectedCity] = useState<CityConfig>(
    PRESET_CITIES.find((city) => city.id === "basra") ??
      PRESET_CITIES[0]
  );

  const [currentTime, setCurrentTime] = useState<Date>(
    new Date()
  );

  const [prayerData, setPrayerData] =
    useState<PrayerTimesResult | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showFiqhInfo, setShowFiqhInfo] = useState(false);

  // تحديث الساعة كل ثانية.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  // إعادة حساب المواقيت عند تغيّر التاريخ أو المدينة.
  useEffect(() => {
    const result = calculateJaafariPrayerTimes(
      currentTime,
      selectedCity.latitude,
      selectedCity.longitude,
      selectedCity.timezone
    );

    setPrayerData(result);
  }, [
    currentTime,
    selectedCity.latitude,
    selectedCity.longitude,
    selectedCity.timezone,
  ]);

  const handleCityChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const city = PRESET_CITIES.find(
      (item) => item.id === event.target.value
    );

    if (!city) {
      return;
    }

    setSelectedCity(city);
    setLocationError("");
    onSelectCity?.(city);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "المتصفح لا يدعم تحديد الموقع الجغرافي."
      );
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const gpsCity: CityConfig = {
          id: "current-location",
          name: "موقعي الحالي",
          country: "الموقع الجغرافي",
          latitude,
          longitude,
          timezone:
            -new Date().getTimezoneOffset() / 60,
        };

        setSelectedCity(gpsCity);
        onSelectCity?.(gpsCity);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "لم يتم السماح بالوصول إلى الموقع. فعّل صلاحية الموقع في المتصفح."
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationError(
            "انتهت مهلة تحديد الموقع. حاول مرة أخرى."
          );
        } else {
          setLocationError(
            "تعذر تحديد الموقع الحالي. اختر المدينة يدويًا."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  // تحويل الوقت الحالي إلى توقيت المدينة المختارة.
  const cityTime = new Date(
    currentTime.getTime() +
      selectedCity.timezone * 60 * 60 * 1000
  );

  const formattedDate = new Intl.DateTimeFormat("ar-IQ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(cityTime);

  const formattedClock = new Intl.DateTimeFormat("ar-IQ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(cityTime);

  const nextPrayer = prayerData?.nextPrayer;
  const prayerTimes = prayerData?.times;

  return (
    <section
      dir="rtl"
      className="w-full space-y-6 text-right"
      aria-label="مواقيت الصلاة"
    >
      {/* رأس الصفحة */}
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <MapPin size={20} />

              <span className="text-sm font-medium">
                مواقيت الصلاة
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              مواقيت الصلاة اليومية
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {formattedDate}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-64">
            <label
              htmlFor="prayer-city"
              className="text-sm font-semibold text-slate-700"
            >
              اختر المدينة
            </label>

            <select
              id="prayer-city"
              value={
                PRESET_CITIES.some(
                  (city) => city.id === selectedCity.id
                )
                  ? selectedCity.id
                  : ""
              }
              onChange={handleCityChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {selectedCity.id === "current-location" && (
                <option value="">
                  موقعي الحالي
                </option>
              )}

              {PRESET_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} - {city.country}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LocateFixed size={17} />

              {isLocating
                ? "جارٍ تحديد الموقع..."
                : "استخدام موقعي الحالي"}
            </button>
          </div>
        </div>

        {locationError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {locationError}
          </p>
        )}
      </div>

      {/* الساعة والصلاة القادمة من الصلوات الثلاث فقط */}
      <div className="rounded-3xl bg-emerald-900 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-emerald-100">
              الوقت المحلي في {selectedCity.name}
            </p>

            <p className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">
              {formattedClock}
            </p>

            <p className="mt-3 text-sm text-emerald-100">
              {formattedDate}
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 sm:min-w-64">
            <div className="flex items-center gap-2 text-emerald-100">
              <Clock size={19} />

              <span className="text-sm">
                الصلاة القادمة
              </span>
            </div>

            {nextPrayer ? (
              <>
                <h3 className="mt-3 text-2xl font-bold">
                  {nextPrayer.label}
                </h3>

                <p className="mt-2 text-lg font-semibold">
                  {nextPrayer.time}
                </p>

                <p className="mt-3 text-sm text-emerald-100">
                  الوقت المتبقي:{" "}
                  {formatCountdown(
                    nextPrayer.countdownMinutes
                  )}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-emerald-100">
                جارٍ حساب مواقيت الصلاة...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* عرض الصبح والظهرين والعشاءين فقط */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PRAYER_CARDS.map((prayer) => {
          const Icon = prayer.icon;
          const time = prayerTimes?.[prayer.key];
          const isNextPrayer =
            nextPrayer?.key === prayer.key;

          return (
            <article
              key={prayer.key}
              className={`rounded-2xl border p-5 shadow-sm transition sm:p-6 ${
                isNextPrayer
                  ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-200"
                  : "border-slate-200 bg-white hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    isNextPrayer
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  <Icon size={24} />
                </div>

                {isNextPrayer && (
                  <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">
                    الصلاة القادمة
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {prayer.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {prayer.subtitle}
              </p>

              <p className="mt-4 text-3xl font-bold tabular-nums text-emerald-900">
                {time ?? "--:--"}
              </p>
            </article>
          );
        })}
      </div>

      {/* معلومات الحساب */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <button
          type="button"
          onClick={() =>
            setShowFiqhInfo((previous) => !previous)
          }
          aria-expanded={showFiqhInfo}
          className="flex w-full items-center gap-2 text-right font-semibold text-amber-900"
        >
          <Info size={19} />

          ملاحظة حول مواقيت الصلاة
        </button>

        {showFiqhInfo && (
          <p className="mt-3 text-sm leading-7 text-amber-900">
            تُحسب المواقيت باستخدام معادلات فلكية. يعتمد حساب
            الفجر هنا زاوية 16 درجة، ويستخدم حساب وقت المغرب
            زاوية 4 درجات تحت الأفق. قد تختلف النتائج عن
            التقويم الشرعي المعتمد؛ لذلك ينبغي مطابقة إعدادات
            الحساب مع التقويم الذي تعتمدونه.
          </p>
        )}
      </div>
    </section>
  );
}
