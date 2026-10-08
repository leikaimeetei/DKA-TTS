import React, { useState } from 'react';
import { VoicePersona, IndianLanguage } from '../types';
import { INDIAN_VOICES } from '../data/voices';
import { Play, Square, Check } from 'lucide-react';

interface VoiceSelectorProps {
  selectedLanguage: IndianLanguage;
  selectedVoice: VoicePersona;
  onSelectVoice: (voice: VoicePersona) => void;
}

const AVATAR_COLORS: Record<string, string> = {
  jhanvi: 'bg-orange-600',
  abhay: 'bg-blue-600',
  'balak-ram': 'bg-slate-900',
  chanderwali: 'bg-rose-500',
  kunwar: 'bg-blue-600',
  awah: 'bg-emerald-600',
};

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedLanguage,
  selectedVoice,
  onSelectVoice,
}) => {
  const [genderFilter, setGenderFilter] = useState<'all' | 'Female' | 'Male'>('all');
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const filteredVoices = INDIAN_VOICES.filter((voice) => {
    const matchesGender = genderFilter === 'all' || voice.gender === genderFilter;
    return matchesGender;
  });

  const handlePreviewSample = (e: React.MouseEvent, voice: VoicePersona) => {
    e.stopPropagation();

    if (previewingId === voice.id) {
      window.speechSynthesis?.cancel();
      setPreviewingId(null);
      return;
    }

    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    setPreviewingId(voice.id);

    const utterance = new SpeechSynthesisUtterance(voice.previewSample);
    utterance.rate = 0.95;

    const available = window.speechSynthesis.getVoices();
    const indVoice = available.find(
      (v) =>
        v.lang.includes('IN') ||
        v.name.includes('India') ||
        v.name.toLowerCase().includes('hindi')
    );
    if (indVoice) utterance.voice = indVoice;

    if (voice.gender === 'Female') {
      utterance.pitch = 1.05;
    } else {
      utterance.pitch = 0.92;
    }

    utterance.onend = () => setPreviewingId(null);
    utterance.onerror = () => setPreviewingId(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-3">
      {/* Header with Gender Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <span className="text-orange-600">02.</span>
            <span>CHOOSE INDIAN VOICE PERSONA</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Crafted with authentic South Asian inflection and personality.
          </p>
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl border border-stone-200/60 self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setGenderFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              genderFilter === 'all'
                ? 'bg-white text-rose-600 border border-stone-200 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Voices
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter('Female')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              genderFilter === 'Female'
                ? 'bg-white text-rose-600 border border-stone-200 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Female
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter('Male')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              genderFilter === 'Male'
                ? 'bg-white text-rose-600 border border-stone-200 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Male
          </button>
        </div>
      </div>

      {/* 2-Column Grid of 6 Voice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredVoices.map((voice) => {
          const isSelected = selectedVoice.id === voice.id;
          const isPlaying = previewingId === voice.id;
          const bgColor = AVATAR_COLORS[voice.id] || 'bg-orange-600';

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-orange-50/20 border-orange-500 ring-1 ring-orange-500/30 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                {/* Header row: Avatar + Name + Play button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${bgColor} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                    >
                      {voice.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 text-sm">{voice.name}</span>
                        {isSelected && (
                          <span className="text-orange-600 font-bold text-sm">✓</span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 font-serif">
                        {voice.nativeName}
                      </div>
                    </div>
                  </div>

                  {/* Circular Audio Preview Button */}
                  <button
                    type="button"
                    onClick={(e) => handlePreviewSample(e, voice)}
                    className="w-8 h-8 rounded-full border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-orange-200 flex items-center justify-center text-orange-600 transition-colors shadow-2xs cursor-pointer shrink-0"
                    title={isPlaying ? 'Stop preview' : 'Preview voice audio'}
                  >
                    {isPlaying ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Accent flavor & Tone */}
                <div className="mt-3 text-xs space-y-0.5">
                  <div className="font-bold text-stone-900 text-xs">{voice.accentFlavor}</div>
                  <div className="text-stone-500 text-[11px] leading-relaxed line-clamp-1">
                    {voice.tone}
                  </div>
                </div>
              </div>

              {/* Best For footer */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 text-[11px] text-stone-500 leading-tight">
                <span className="font-semibold text-stone-700">Best for: </span>
                <span>{voice.idealFor.join(' · ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
