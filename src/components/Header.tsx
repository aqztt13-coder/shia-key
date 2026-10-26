import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Moon, Sun, Sparkles, Compass } from 'lucide-react';
import { soundEffects } from '../utils/soundAndHaptics';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  isDarkMode,
  onToggleTheme,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateString, setCurrentDateString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ar-EG-u-nu-latn', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );

      // Format Arabic date
      setCurrentDateString(
        now.toLocaleDateString('ar-EG-u-nu-latn', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
    if (!next) {
      soundEffects.playTasbeehClick();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية' },
    { id: 'quran', label: 'القرآن الكريم' },
    { id: 'prayers', label: 'المواقيت' },
    { id: 'daily_deeds', label: 'أعمال اليوم' },
    { id: 'duas', label: 'مفاتيح الجنان' },
    { id: 'tasbeeh', label: 'المسبحة' },
    { id: 'rakat', label: 'عداد الركعات' },
    { id: 'qibla', label: 'القبلة' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl border-b border-amber-500/30">
      {/* Decorative Islamic Arch Line */}
      <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center border border-amber-400/40">
                <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-scheherazade text-amber-300 tracking-wide">
                  مفاتيح  المُؤْمِنين
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 hidden sm:inline-block">
                 نور لقلبك وزاد ليومك
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 hidden sm:block">
                القرآن الكريم • مواقيت جعفرية • مفاتيح الجنان • مسبحة • عداد الركعات
              </p>
            </div>
          </div>

          {/* Center Date & Live Clock */}
          <div className="hidden md:flex flex-col items-center justify-center px-4 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-center shadow-inner">
            <span className="text-xs font-medium text-emerald-200">{currentDateString}</span>
            <span className="text-sm font-bold font-mono tracking-wider text-amber-300">{currentTime}</span>
          </div>

          {/* Action Buttons: Sound, Theme, Quick Qibla */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('qibla')}
              className="p-2.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/70 text-emerald-200 hover:text-amber-300 transition-all border border-emerald-600/40"
              title="تحديد اتجاه القبلة"
              aria-label="اتجاه القبلة"
            >
              <Compass className="w-5 h-5" />
            </button>

            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl transition-all border ${
                isMuted
                  ? 'bg-red-950/60 text-red-300 border-red-800/40'
                  : 'bg-emerald-800/60 text-emerald-200 hover:text-amber-300 border-emerald-600/40'
              }`}
              title={isMuted ? 'تفعيل الصوت التفاعلي' : 'كتم الصوت التفاعلي'}
              aria-label="التحكم بالصوت"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/70 text-emerald-200 hover:text-amber-300 transition-all border border-emerald-600/40"
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
              aria-label="تغيير المظهر"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Tabs */}
        <nav className="flex space-x-1 space-x-reverse overflow-x-auto pb-2 scrollbar-none text-sm font-medium">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-400 text-emerald-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
