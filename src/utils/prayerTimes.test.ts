import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateJaafariPrayerTimes, calculateQiblaAngle, PRESET_CITIES } from './prayerTimes';

test('prayer times logic produces valid 24h formatted times for Najaf', () => {
  const najaf = PRESET_CITIES.find(c => c.id === 'najaf')!;
  assert.ok(najaf, 'Najaf should exist in presets');

  const testDate = new Date(2026, 9, 25, 12, 0, 0); // Oct 25, 2026 at noon
  const res = calculateJaafariPrayerTimes(testDate, najaf.latitude, najaf.longitude, najaf.timezone);

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  assert.match(res.fajr, timeRegex, 'Fajr should match HH:mm');
  assert.match(res.sunrise, timeRegex, 'Sunrise should match HH:mm');
  assert.match(res.dhuhr, timeRegex, 'Dhuhr should match HH:mm');
  assert.match(res.maghrib, timeRegex, 'Maghrib should match HH:mm');
  assert.match(res.midnight, timeRegex, 'Midnight should match HH:mm');

  // Verify chronology: Fajr is before Sunrise, Sunset is before Maghrib
  const [fajrH, fajrM] = res.fajr.split(':').map(Number);
  const [sunH, sunM] = res.sunrise.split(':').map(Number);
  const fajrMin = fajrH * 60 + fajrM;
  const sunMin = sunH * 60 + sunM;
  assert.ok(fajrMin < sunMin, 'Fajr must be earlier than Sunrise');

  // Maghrib must be after Sunset
  const [setH, setM] = res.sunset.split(':').map(Number);
  const [magH, magM] = res.maghrib.split(':').map(Number);
  const setMin = setH * 60 + setM;
  const magMin = magH * 60 + magM;
  assert.ok(magMin > setMin, 'Jaafari Maghrib (disappearance of eastern redness) must be after Sunset');

  assert.ok(res.nextPrayer, 'Next prayer must be calculated');
  assert.ok(res.nextPrayer.countdownMinutes >= 0, 'Countdown minutes should be non-negative');
});

test('qibla angle calculation points toward Mecca from Najaf', () => {
  const najaf = PRESET_CITIES.find(c => c.id === 'najaf')!;
  const angle = calculateQiblaAngle(najaf.latitude, najaf.longitude);
  // Najaf is north-northeast of Mecca, so Qibla direction is roughly south-southwest ~ 200° - 225°
  assert.ok(angle > 190 && angle < 235, `Qibla angle for Najaf should be ~210°, got ${angle}`);
});
