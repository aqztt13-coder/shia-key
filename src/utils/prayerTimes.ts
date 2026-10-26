
export interface CityConfig {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

export type PrayerKey = "fajr" | "dhuhr" | "maghrib";

export interface PrayerTimes {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  midnight: string;
}

export interface NextPrayer {
  key: PrayerKey;
  label: string;
  time: string;
  countdownMinutes: number;
}

export interface PrayerTimesResult {
  date: string;
  times: PrayerTimes;
  nextPrayer: NextPrayer;
}

export const PRESET_CITIES: CityConfig[] = [
  {
    id: "basra",
    name: "البصرة",
    country: "العراق",
    latitude: 30.5085,
    longitude: 47.7804,
    timezone: 3,
  },
  {
    id: "baghdad",
    name: "بغداد",
    country: "العراق",
    latitude: 33.3152,
    longitude: 44.3661,
    timezone: 3,
  },
  {
    id: "najaf",
    name: "النجف",
    country: "العراق",
    latitude: 32.0003,
    longitude: 44.3354,
    timezone: 3,
  },
  {
    id: "karbala",
    name: "كربلاء",
    country: "العراق",
    latitude: 32.616,
    longitude: 44.0249,
    timezone: 3,
  },
  {
    id: "nasiriyah",
    name: "الناصرية",
    country: "العراق",
    latitude: 31.057,
    longitude: 46.2573,
    timezone: 3,
  },
  {
    id: "amarah",
    name: "العمارة",
    country: "العراق",
    latitude: 31.8359,
    longitude: 47.1448,
    timezone: 3,
  },
  {
    id: "kirkuk",
    name: "كركوك",
    country: "العراق",
    latitude: 35.4681,
    longitude: 44.3922,
    timezone: 3,
  },
  {
    id: "mosul",
    name: "الموصل",
    country: "العراق",
    latitude: 36.34,
    longitude: 43.13,
    timezone: 3,
  },
  {
    id: "erbil",
    name: "أربيل",
    country: "العراق",
    latitude: 36.1911,
    longitude: 44.0092,
    timezone: 3,
  },
  {
    id: "sulaymaniyah",
    name: "السليمانية",
    country: "العراق",
    latitude: 35.5613,
    longitude: 45.4307,
    timezone: 3,
  },
];

const toRadians = (degrees: number): number =>
  (degrees * Math.PI) / 180;

const toDegrees = (radians: number): number =>
  (radians * 180) / Math.PI;

const normalizeDegrees = (value: number): number =>
  ((value % 360) + 360) % 360;

function getCityDate(date: Date, timezone: number): Date {
  return new Date(date.getTime() + timezone * 60 * 60 * 1000);
}

function getJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045 -
    0.5
  );
}

function sunCoordinates(julianDay: number) {
  const d = julianDay - 2451545.0;

  const meanAnomaly = normalizeDegrees(357.529 + 0.98560028 * d);
  const meanLongitude = normalizeDegrees(280.459 + 0.98564736 * d);

  const eclipticLongitude = normalizeDegrees(
    meanLongitude +
      1.915 * Math.sin(toRadians(meanAnomaly)) +
      0.020 * Math.sin(2 * toRadians(meanAnomaly))
  );

  const obliquity = 23.439 - 0.00000036 * d;

  const rightAscension = normalizeDegrees(
    toDegrees(
      Math.atan2(
        Math.cos(toRadians(obliquity)) *
          Math.sin(toRadians(eclipticLongitude)),
        Math.cos(toRadians(eclipticLongitude))
      )
    )
  );

  const declination = toDegrees(
    Math.asin(
      Math.sin(toRadians(obliquity)) *
        Math.sin(toRadians(eclipticLongitude))
    )
  );

  const equationOfTime = meanLongitude / 15 - rightAscension / 15;

  return { declination, equationOfTime };
}

function computeHourAngle(
  latitude: number,
  declination: number,
  altitude: number
): number {
  const numerator =
    Math.sin(toRadians(altitude)) -
    Math.sin(toRadians(latitude)) *
      Math.sin(toRadians(declination));

  const denominator =
    Math.cos(toRadians(latitude)) *
    Math.cos(toRadians(declination));

  const value = numerator / denominator;

  if (value < -1 || value > 1) {
    return Number.NaN;
  }

  return toDegrees(Math.acos(value)) / 15;
}

function decimalHoursToTimeString(hours: number): string {
  if (!Number.isFinite(hours)) {
    return "--:--";
  }

  const totalMinutes =
    ((Math.round(hours * 60) % 1440) + 1440) % 1440;

  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 < 12 ? "ص" : "م";
  const hour12 = hour24 % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")} ${period}`;
}

function getMinutesOfDay(hours: number): number {
  return ((Math.round(hours * 60) % 1440) + 1440) % 1440;
}

export function calculateJaafariPrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number
): PrayerTimesResult {
  const cityDate = getCityDate(date, timezone);

  const calculationDate = new Date(
    Date.UTC(
      cityDate.getUTCFullYear(),
      cityDate.getUTCMonth(),
      cityDate.getUTCDate(),
      12,
      0,
      0
    )
  );

  const julianDay = getJulianDay(calculationDate);
  const { declination, equationOfTime } = sunCoordinates(julianDay);

  const solarNoon =
    12 + timezone - longitude / 15 - equationOfTime;

  // الفجر: زاوية 16 درجة تحت الأفق.
  const fajrAngle = computeHourAngle(latitude, declination, -16);
  const fajrHours = solarNoon - fajrAngle;

  // الشروق والغروب الفلكيان.
  const sunriseAngle = computeHourAngle(
    latitude,
    declination,
    -0.833
  );

  const sunriseHours = solarNoon - sunriseAngle;
  const sunsetHours = solarNoon + sunriseAngle;

  // حساب العصر داخليًا للمحافظة على بنية البيانات المتوافقة.
  const latitudeDeclinationDifference = Math.abs(
    latitude - declination
  );

  const asrAltitude = toDegrees(
    Math.atan(
      1 /
        (1 +
          Math.tan(
            toRadians(latitudeDeclinationDifference)
          ))
    )
  );

  const asrAngle = computeHourAngle(
    latitude,
    declination,
    asrAltitude
  );

  const asrHours = solarNoon + asrAngle;

  // وقت المغرب المستخدم لعرض صلاة العشاءين.
  // هذا الحساب يعتمد زاوية 4 درجات تحت الأفق.
  const maghribAngle = computeHourAngle(
    latitude,
    declination,
    -4
  );

  const maghribHours = solarNoon + maghribAngle;

  // حساب العشاء داخليًا فقط، ولا يظهر للمستخدم.
  const ishaAngle = computeHourAngle(
    latitude,
    declination,
    -14
  );

  const ishaHours = solarNoon + ishaAngle;

  const imsakHours = fajrHours - 10 / 60;

  // منتصف الليل التقريبي بين المغرب والفجر التالي.
  const midnightHours =
    (maghribHours + fajrHours + 24) / 2;

  const times: PrayerTimes = {
    imsak: decimalHoursToTimeString(imsakHours),
    fajr: decimalHoursToTimeString(fajrHours),
    sunrise: decimalHoursToTimeString(sunriseHours),
    dhuhr: decimalHoursToTimeString(solarNoon),
    asr: decimalHoursToTimeString(asrHours),
    sunset: decimalHoursToTimeString(sunsetHours),
    maghrib: decimalHoursToTimeString(maghribHours),
    isha: decimalHoursToTimeString(ishaHours),
    midnight: decimalHoursToTimeString(midnightHours),
  };

  // هذه هي الأوقات الوحيدة التي تدخل في العد التنازلي.
  const prayerSchedule: {
    key: PrayerKey;
    label: string;
    decimal: number;
  }[] = [
    {
      key: "fajr",
      label: "صلاة الصبح",
      decimal: fajrHours,
    },
    {
      key: "dhuhr",
      label: "صلاة الظهرين",
      decimal: solarNoon,
    },
    {
      key: "maghrib",
      label: "صلاة العشاءين",
      decimal: maghribHours,
    },
  ];

  const currentMinutes =
    cityDate.getUTCHours() * 60 +
    cityDate.getUTCMinutes() +
    cityDate.getUTCSeconds() / 60;

  let nextPrayer = prayerSchedule.find(
    (prayer) =>
      getMinutesOfDay(prayer.decimal) > currentMinutes
  );

  let countdownMinutes: number;

  if (nextPrayer) {
    countdownMinutes = Math.max(
      0,
      Math.ceil(
        getMinutesOfDay(nextPrayer.decimal) - currentMinutes
      )
    );
  } else {
    nextPrayer = prayerSchedule[0];

    countdownMinutes = Math.max(
      0,
      Math.ceil(
        24 * 60 -
          currentMinutes +
          getMinutesOfDay(nextPrayer.decimal)
      )
    );
  }

  return {
    date: [
      cityDate.getUTCFullYear(),
      String(cityDate.getUTCMonth() + 1).padStart(2, "0"),
      String(cityDate.getUTCDate()).padStart(2, "0"),
    ].join("-"),
    times,
    nextPrayer: {
      key: nextPrayer.key,
      label: nextPrayer.label,
      time: times[nextPrayer.key],
      countdownMinutes,
    },
  };
}

export function calculateQiblaAngle(
  latitude: number,
  longitude: number
): number {
  const kaabaLatitude = toRadians(21.4225);
  const kaabaLongitude = toRadians(39.8262);

  const userLatitude = toRadians(latitude);
  const longitudeDifference =
    kaabaLongitude - toRadians(longitude);

  const y = Math.sin(longitudeDifference);

  const x =
    Math.cos(userLatitude) * Math.tan(kaabaLatitude) -
    Math.sin(userLatitude) * Math.cos(longitudeDifference);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}
