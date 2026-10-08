import React, { useState } from 'react';
import { IndianLanguage, SpeechModifiers, VoicePersona } from '../types';
import {
  Sliders,
  Volume2,
  Gauge,
  Music,
  Heart,
  Globe2,
  Zap,
  RotateCcw,
  Tag,
  Play,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { previewSpeechModifier } from '../services/ttsService';

interface SpeechModifierPanelProps {
  modifiers: SpeechModifiers;
  onChangeModifiers: (modifiers: SpeechModifiers) => void;
  selectedLanguage: IndianLanguage;
  selectedVoice: VoicePersona;
  currentText: string;
  onInsertTag: (tag: string) => void;
}

const RATE_PRESETS = [
  { label: '0.80x Slow', value: 0.8 },
  { label: '0.95x Natural', value: 0.95 },
  { label: '1.10x Brisk', value: 1.1 },
  { label: '1.25x Dynamic', value: 1.25 },
];

const EMOTION_OPTIONS = [
  {
    id: 'Conversational & Warm',
    title: 'Conversational',
    desc: 'Warm, approachable, natural everyday Indian cadence',
  },
  {
    id: 'Authoritative News',
    title: 'News Broadcast',
    desc: 'Crisp, articulate, dignified Doordarshan/AIR cadence',
  },
  {
    id: 'Expressive Story',
    title: 'Storyteller',
    desc: 'Emotional nuances, expressive breath and suspense',
  },
  {
    id: 'Corporate Keynote',
    title: 'Corporate',
    desc: 'Confident, clear, executive presentation style',
  },
  {
    id: 'Calm & Meditative',
    title: 'Calm & Mindful',
    desc: 'Soothing, gentle pauses, meditative relaxation',
  },
  {
    id: 'High-Energy Upbeat',
    title: 'High Energy',
    desc: 'Vibrant, enthusiastic, dynamic commercial style',
  },
  {
    id: 'Customer Support',
    title: 'Polite Support',
    desc: 'Courteous, welcoming, patient IVR/customer service',
  },
];

const REGIONAL_ACCENTS = [
  {
    id: 'Pan-Indian Metro Neutral',
    label: 'Pan-Indian Metro',
    desc: 'Clear urban standard, globally neutral Indian phonetics',
  },
  {
    id: 'North Indian / Delhi Cadence',
    label: 'North / Delhi',
    desc: 'Hindustani rhythm, distinct dental consonants',
  },
  {
    id: 'South Indian Rhythmic Lilt',
    label: 'South Rhythmic',
    desc: 'Syllable-timed, melodic inflection and crisp clarity',
  },
  {
    id: 'West Indian / Mumbai Expressive',
    label: 'Mumbai / West',
    desc: 'Vibrant colloquial pace, casual modern cadence',
  },
  {
    id: 'Classical Broadcast Precision',
    label: 'Classical AIR',
    desc: 'Dignified literary cadence, formal broadcast diction',
  },
];

const QUICK_TAGS = [
  { label: '<breath>', tag: '<breath>', title: 'Natural breathing pause' },
  { label: '[Pause 0.5s]', tag: ' ... ', title: 'Short dramatic pause' },
  { label: '[Emphasis]', tag: '**stress**', title: 'Highlight emphasized word' },
  { label: '[Whisper]', tag: '[whisper: softly]', title: 'Intimate soft volume' },
  { label: '[Slow down]', tag: '[pace: deliberate]', title: 'Slow down this phrase' },
  { label: '[Energetic]', tag: '[energy: high]', title: 'Elevate spoken energy' },
];

export const SpeechModifierPanel: React.FC<SpeechModifierPanelProps> = ({
  modifiers,
  onChangeModifiers,
  selectedLanguage,
  selectedVoice,
  currentText,
  onInsertTag,
}) => {
  const [activeTab, setActiveTab] = useState<'cadence' | 'mood' | 'tags'>('cadence');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const getPitchDescription = (p: number) => {
    if (p <= -2) return 'Deep & Resonant (-2)';
    if (p === -1) return 'Warm & Low (-1)';
    if (p === 0) return 'Natural Register (0)';
    if (p === 1) return 'Bright & Crisp (+1)';
    return 'High & Melodic (+2)';
  };

  const getRateDescription = (r: number) => {
    if (r <= 0.8) return 'Deliberate & Slow';
    if (r <= 1.0) return 'Natural Indian Cadence';
    if (r <= 1.18) return 'Brisk & Articulate';
    return 'Fast & Dynamic';
  };

  const handleReset = () => {
    onChangeModifiers({
      speakingRate: 0.95,
      pitch: 0,
      emotion: 'Conversational & Warm',
      accentFlavor: 'Pan-Indian Metro Neutral',
      energy: 'balanced',
      customPrompt: '',
    });
  };

  const handleAudition = () => {
    setIsPlayingPreview(true);
    previewSpeechModifier(
      currentText,
      selectedLanguage,
      selectedVoice?.gender || 'Female',
      modifiers || {
        speakingRate: 0.95,
        pitch: 0,
        emotion: 'Conversational & Warm',
        accentFlavor: 'Pan-Indian Metro Neutral',
        energy: 'balanced',
        customPrompt: '',
      }
    );
    setTimeout(() => setIsPlayingPreview(false), 2500);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Speech Modifiers
            </h3>
            <p className="text-[11px] text-stone-500">Side voice director & pacing</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleAudition}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200/90 rounded-md transition-colors cursor-pointer border border-amber-300"
            title="Listen to a quick 2-second preview of rate & pitch settings"
          >
            <Play className={`w-3 h-3 ${isPlayingPreview ? 'text-orange-600 animate-pulse' : ''}`} />
            <span>{isPlayingPreview ? 'Playing...' : 'Audition'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
            title="Reset speech modifiers to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-stone-100/60 p-1 gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('cadence')}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'cadence'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-amber-700" />
          <span>Cadence</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mood')}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'mood'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-600" />
          <span>Mood & Accent</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tags')}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'tags'
              ? 'bg-white text-stone-900 shadow-xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-stone-600" />
          <span>Tags & Custom</span>
        </button>
      </div>

      {/* Panel Body */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[460px]">
        {/* TAB 1: CADENCE (RATE, PITCH, ENERGY) */}
        {activeTab === 'cadence' && (
          <div className="space-y-4">
            {/* Speaking Rate / Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-700" />
                  <span>Speaking Rate (Speed)</span>
                </span>
                <span className="font-mono text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {modifiers.speakingRate.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min="0.70"
                max="1.35"
                step="0.05"
                value={modifiers.speakingRate}
                onChange={(e) =>
                  onChangeModifiers({
                    ...modifiers,
                    speakingRate: parseFloat(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                <span>0.70x (Slow)</span>
                <span className="text-stone-700 font-semibold">
                  {getRateDescription(modifiers.speakingRate)}
                </span>
                <span>1.35x (Fast)</span>
              </div>

              {/* Quick Rate Presets */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {RATE_PRESETS.map((preset) => {
                  const isSelected =
                    Math.abs(modifiers.speakingRate - preset.value) < 0.02;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        onChangeModifiers({
                          ...modifiers,
                          speakingRate: preset.value,
                        })
                      }
                      className={`py-1 text-[11px] rounded-md border text-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Vocal Pitch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-stone-600" />
                  <span>Vocal Register (Pitch)</span>
                </span>
                <span className="font-mono text-[11px] text-stone-700 font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  {modifiers.pitch > 0 ? `+${modifiers.pitch}` : modifiers.pitch}
                </span>
              </div>

              <input
                type="range"
                min="-2"
                max="2"
                step="1"
                value={modifiers.pitch}
                onChange={(e) =>
                  onChangeModifiers({
                    ...modifiers,
                    pitch: parseInt(e.target.value, 10),
                  })
                }
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
              />

              <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                <span>Deep (-2)</span>
                <span className="text-stone-800 font-semibold">
                  {getPitchDescription(modifiers.pitch)}
                </span>
                <span>High (+2)</span>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Vocal Energy & Dynamic Intensity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vocal Energy & Stress</span>
                </span>
                <span className="capitalize text-[11px] text-stone-600 font-medium">
                  {modifiers.energy}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(['gentle', 'balanced', 'emphatic'] as const).map((lvl) => {
                  const isCurrent = modifiers.energy === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        onChangeModifiers({
                          ...modifiers,
                          energy: lvl,
                        })
                      }
                      className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors cursor-pointer capitalize ${
                        isCurrent
                          ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {lvl === 'gentle' ? 'Gentle / Soft' : lvl === 'balanced' ? 'Balanced' : 'Emphatic'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MOOD & REGIONAL ACCENT */}
        {activeTab === 'mood' && (
          <div className="space-y-4">
            {/* Delivery Tone & Emotion */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <span>Emotional Delivery</span>
              </label>

              <div className="space-y-1.5">
                {EMOTION_OPTIONS.map((emo) => {
                  const isCurrent = modifiers.emotion === emo.id;
                  return (
                    <button
                      key={emo.id}
                      type="button"
                      onClick={() =>
                        onChangeModifiers({
                          ...modifiers,
                          emotion: emo.id,
                        })
                      }
                      className={`w-full text-left p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-50/70 border-amber-500 text-stone-900 ring-1 ring-amber-500/30'
                          : 'bg-stone-50/60 border-stone-200 text-stone-600 hover:bg-stone-100/80 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{emo.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-amber-700 font-bold uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {emo.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Regional Indian Accent Nuance */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-stone-600" />
                <span>Regional Accent Nuance</span>
              </label>

              <div className="space-y-1.5">
                {REGIONAL_ACCENTS.map((reg) => {
                  const isCurrent = modifiers.accentFlavor === reg.id;
                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() =>
                        onChangeModifiers({
                          ...modifiers,
                          accentFlavor: reg.id,
                        })
                      }
                      className={`w-full text-left p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50/60 border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{reg.label}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-amber-300 font-bold">✓</span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 line-clamp-1 ${
                          isCurrent ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {reg.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TAGS & CUSTOM DIRECTION */}
        {activeTab === 'tags' && (
          <div className="space-y-4">
            {/* Quick Speech Markup Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-stone-600" />
                  <span>Insert Speech Markup</span>
                </span>
                <span className="text-[10px] text-stone-500">Click to append</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_TAGS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => onInsertTag(t.tag)}
                    className="p-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-lg text-left transition-colors cursor-pointer group"
                    title={t.title}
                  >
                    <div className="font-mono text-xs font-semibold text-stone-800 group-hover:text-amber-900">
                      {t.label}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {t.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Custom Prompt Directives */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                className="w-full flex items-center justify-between text-xs font-semibold text-stone-700 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Custom Speech Directives</span>
                </span>
                {showCustomPrompt ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                )}
              </button>

              {showCustomPrompt && (
                <div className="space-y-1.5 animate-in fade-in">
                  <p className="text-[11px] text-stone-500">
                    Add specific instructions for Gemini TTS (e.g. "Speak with cricket commentary excitement" or "Narrate like an affectionate Indian grandmother").
                  </p>
                  <textarea
                    rows={3}
                    value={modifiers.customPrompt}
                    onChange={(e) =>
                      onChangeModifiers({
                        ...modifiers,
                        customPrompt: e.target.value,
                      })
                    }
                    placeholder="Enter custom speech nuance or instructions..."
                    className="w-full p-2.5 text-xs text-stone-800 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500 focus:bg-white resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Directive Summary Strip */}
      <div className="p-3 bg-stone-50/90 border-t border-stone-200 text-[11px] text-stone-600 space-y-1">
        <div className="flex items-center justify-between text-stone-700 font-semibold">
          <span>Active Speech Profile</span>
          <span className="text-amber-800 font-mono text-[10px]">
            {(modifiers?.speakingRate ?? 0.95).toFixed(2)}x · Pitch {(modifiers?.pitch ?? 0) >= 0 ? `+${modifiers?.pitch ?? 0}` : modifiers?.pitch}
          </span>
        </div>
        <p className="line-clamp-1 text-stone-500 text-[10px]">
          {modifiers?.emotion || 'Conversational'} · {(modifiers?.accentFlavor || 'Pan-Indian Metro').replace(' Cadence', '').replace(' Rhythmic Lilt', '')}
        </p>
      </div>
    </div>
  );
};
