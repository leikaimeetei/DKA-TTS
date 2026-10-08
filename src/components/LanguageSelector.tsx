import React from 'react';
import { IndianLanguage } from '../types';
import { INDIAN_LANGUAGES_INFO } from '../data/voices';
import { Check, Activity } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: IndianLanguage;
  onSelectLanguage: (lang: IndianLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
  const currentInfo = INDIAN_LANGUAGES_INFO[selectedLanguage];

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div>
        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
          <span className="text-orange-600">01.</span>
          <span>SELECT LANGUAGE & ACCENT CADENCE</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Choose between authentic Indian English and Hindi with natural cadence and inflection.
        </p>
      </div>

      {/* Language Cards (2 side-by-side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: Indian English */}
        <div
          onClick={() => onSelectLanguage('indian-english')}
          className={`p-3.5 rounded-2xl border transition-all relative flex items-center justify-between cursor-pointer ${
            selectedLanguage === 'indian-english'
              ? 'bg-orange-50/20 border-orange-500 ring-1 ring-orange-500/30 shadow-xs'
              : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Indian Flag Circular Badge */}
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-stone-200 flex flex-col shadow-xs">
              <div className="h-1/3 bg-[#FF9933]" />
              <div className="h-1/3 bg-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full border border-[#000080]" />
              </div>
              <div className="h-1/3 bg-[#138808]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <span>Indian English</span>
                <span className="text-stone-400 font-normal">›</span>
                <span className="text-stone-700 font-semibold">Indian English</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                Authentic Indian English intonation, natural syllable...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 shrink-0">
            <span className="text-xs font-semibold text-orange-600 font-serif">
              Namaste & Welcome
            </span>
            {selectedLanguage === 'indian-english' && (
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Hindi */}
        <div
          onClick={() => onSelectLanguage('hindi')}
          className={`p-3.5 rounded-2xl border transition-all relative flex items-center justify-between cursor-pointer ${
            selectedLanguage === 'hindi'
              ? 'bg-orange-50/20 border-orange-500 ring-1 ring-orange-500/30 shadow-xs'
              : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-orange-200 shadow-xs">
              हिं
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <span className="font-serif">हिंदी</span>
                <span className="text-stone-400 font-normal">›</span>
                <span className="text-stone-700 font-semibold">Hindi</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                Rich Northern & Central Indian intonation with clear Devanagari...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 shrink-0">
            <span className="text-xs font-serif font-semibold text-orange-600">
              नमस्ते
            </span>
            {selectedLanguage === 'hindi' && (
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Accent Profile Info Strip */}
      <div className="p-2.5 px-3 bg-white border border-stone-200/90 rounded-xl flex items-center gap-2.5 text-xs text-stone-600 shadow-2xs">
        <Activity className="w-4 h-4 text-orange-600 shrink-0" />
        <p className="text-[11px] leading-relaxed">
          <span className="font-bold text-stone-900">{currentInfo.name} Accent Profile: </span>
          <span>{currentInfo.regionDescription}.</span>
        </p>
      </div>
    </div>
  );
};
