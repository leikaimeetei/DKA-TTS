import React from 'react';
import { Volume2, BookOpen, History, Languages } from 'lucide-react';
import { IndianLanguage } from '../types';
import { INDIAN_LANGUAGES_INFO } from '../data/voices';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentLanguage: IndianLanguage;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  activeMode: 'single' | 'dialogue';
  onModeChange: (mode: 'single' | 'dialogue') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onOpenGuide,
  onOpenHistory,
  historyCount,
  activeMode,
  onModeChange,
}) => {
  const langInfo = INDIAN_LANGUAGES_INFO[currentLanguage];

  return (
    <header className="border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 flex items-center justify-center text-white shadow-sm ring-1 ring-orange-400/30">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-stone-900 tracking-tight">DKA -TTS</span>
              <span className="text-xs font-semibold text-orange-700">English & हिन्दी</span>
            </div>
            <p className="text-xs text-stone-500 font-normal">
              Authentic Indian Accents in English & Hindi
            </p>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="hidden md:flex items-center p-1 bg-stone-200/70 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => onModeChange('single')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeMode === 'single'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Solo Narration
          </button>
          <button
            type="button"
            onClick={() => onModeChange('dialogue')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeMode === 'dialogue'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Dual Conversation</span>
            <span className="text-[10px] text-orange-600 font-mono font-medium">Gemini 3.8</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton variant="nav" />

          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors"
            title="Indian Accent & Regional Pronunciation Guide"
          >
            <BookOpen className="w-4 h-4 text-orange-600" />
            <span className="hidden sm:inline">Accent Guide</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors relative"
            title="Audio Generation History"
          >
            <History className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">Library</span>
            {historyCount > 0 && (
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 rounded-full px-1.5 py-0.2">
                {historyCount}
              </span>
            )}
          </button>

          {/* Active language quiet indicator */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-stone-200 text-xs text-stone-500">
            <Languages className="w-3.5 h-3.5 text-orange-600" />
            <span>{langInfo.name}</span>
            <span className="text-stone-400 font-serif">({langInfo.nativeName})</span>
          </div>
        </div>
      </div>
    </header>
  );
};

