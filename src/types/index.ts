export interface CityConfig {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // e.g. 3 for Iraq/Baghdad/Najaf (UTC+3)
}

export interface PrayerTimesResult {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  midnight: string;
  nextPrayer: {
    key: string;
    label: string;
    time: string;
    countdownMinutes: number;
    countdownFormatted: string;
  };
}

export type DuaCategory = 
  | 'ziyarat'      // الزيارات المشهورة
  | 'duas'         // الأدعية المأثورة
  | 'taqibat'      // تعقيبات الصلاة
  | 'daily_deeds'  // أعمال الأيام
  | 'munajat';     // المناجاة الخمس عشرة

export interface DuaSection {
  section_title?: string;
  text: string;
  repeat_target?: number;
  note?: string;
}

export interface StructuredDuaItem {
  id: string;
  title: string;
  category: string; // زيارات، أدعية، تعقيبات، أعمال الأيام
  day_of_week: number | null;
  sanad_or_virtue: string;
  sections: DuaSection[];
}

export interface DuaItem {
  id: string;
  title: string;
  category: DuaCategory;
  subtitle?: string;
  source: string; // e.g. مفاتيح الجنان
  significance?: string; // فضائل وأجر قراءته
  tags: string[];
  content: string; // النص الكامل 
  day_of_week?: number | null;
  sections?: DuaSection[];
  interactiveCounters?: {
    id: string;
    label: string;
    text: string;
    target: number;
  }[];
}

export interface DailyDeed {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 5 = Friday, 6 = Saturday
  dayName: string;
  hijriDayName: string;
  dedicatedImams: string;
  significance: string;
  recommendedDuaId: string;
  recommendedDuaTitle: string;
  recommendedZiyaratId: string;
  recommendedZiyaratTitle: string;
  specialActs: string[];
}
