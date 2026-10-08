import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  Sliders,
  Volume2,
  Gauge,
  Music,
  Heart,
  Globe2,
  Tag,
  Sparkles,
  Maximize2,
  VolumeX,
  Loader2,
  Shield,
  Gem,
  Radio,
  Settings,
  Ear,
  RotateCcw,
} from 'lucide-react';
import { GeneratedSpeech, IndianLanguage, SpeechModifiers, VoicePersona } from '../types';
import {
  base64ToBlobUrl,
  downloadMp3File,
  previewSpeechModifier,
  speakInBrowser,
} from '../services/ttsService';

interface RightControlPanelProps {
  currentSpeech: GeneratedSpeech | null;
  isGenerating: boolean;
  onGenerate: () => void;
  selectedLanguage: IndianLanguage;
  selectedVoice: VoicePersona;
  currentText: string;
  modifiers: SpeechModifiers;
  onChangeModifiers: (modifiers: SpeechModifiers) => void;
  onInsertTag: (tag: string) => void;
}

const RATE_PRESETS = [
  { label: '0.80x Slow', value: 0.8 },
  { label: '0.95x Natural', value: 0.95 },
  { label: '1.10x Brisk', value: 1.1 },
  { label: '1.25x Dynamic', value: 1.25 },
];

const EMOTION_OPTIONS = [
  { id: 'Conversational & Warm', title: 'Conversational', desc: 'Warm, approachable everyday Indian cadence' },
  { id: 'Authoritative News', title: 'News Broadcast', desc: 'Crisp, articulate Doordarshan/AIR cadence' },
  { id: 'Expressive Story', title: 'Storyteller', desc: 'Emotional nuances, expressive breath and suspense' },
  { id: 'Corporate Keynote', title: 'Corporate', desc: 'Confident executive presentation style' },
  { id: 'Calm & Meditative', title: 'Calm & Mindful', desc: 'Soothing meditative relaxation' },
  { id: 'High-Energy Upbeat', title: 'High Energy', desc: 'Vibrant commercial enthusiasm' },
  { id: 'Customer Support', title: 'Polite Support', desc: 'Courteous, welcoming IVR service' },
];

const REGIONAL_ACCENTS = [
  { id: 'Pan-Indian Metro Neutral', label: 'Pan-Indian Metro', desc: 'Clear urban standard, globally neutral' },
  { id: 'North Indian / Delhi Cadence', label: 'North / Delhi', desc: 'Hindustani rhythm, distinct dental consonants' },
  { id: 'South Indian Rhythmic Lilt', label: 'South Rhythmic', desc: 'Syllable-timed, melodic inflection and clarity' },
  { id: 'West Indian / Mumbai Expressive', label: 'Mumbai / West', desc: 'Vibrant colloquial pace, casual modern cadence' },
  { id: 'Classical Broadcast Precision', label: 'Classical AIR', desc: 'Dignified literary diction' },
];

const QUICK_TAGS = [
  { label: '<breath>', tag: '<breath>', title: 'Natural breath pause' },
  { label: '[Pause 0.5s]', tag: ' ... ', title: 'Short dramatic pause' },
  { label: '[Emphasis]', tag: '**stress**', title: 'Highlight emphasized word' },
  { label: '[Whisper]', tag: '[whisper: softly]', title: 'Intimate soft volume' },
  { label: '[Slow down]', tag: '[pace: deliberate]', title: 'Slow down this phrase' },
  { label: '[Energetic]', tag: '[energy: high]', title: 'Elevate spoken energy' },
];

export const RightControlPanel: React.FC<RightControlPanelProps> = ({
  currentSpeech,
  isGenerating,
  onGenerate,
  selectedLanguage,
  selectedVoice,
  currentText,
  modifiers,
  onChangeModifiers,
  onInsertTag,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAuditioning, setIsAuditioning] = useState(false);

  // Sub-tabs in Speech Modifiers
  const [modifierTab, setModifierTab] = useState<'cadence' | 'mood' | 'tags'>('cadence');

  // Advanced options state
  const [volume, setVolume] = useState(100);
  const [stability, setStability] = useState(false);
  const [clarityBoost, setClarityBoost] = useState(true);
  const [silenceReduction, setSilenceReduction] = useState(true);

  // Setup blob URL on currentSpeech change
  useEffect(() => {
    if (!currentSpeech?.audioBase64) {
      setAudioUrl(null);
      setIsPlaying(false);
      return;
    }
    const url = base64ToBlobUrl(currentSpeech.audioBase64, currentSpeech.mimeType);
    setAudioUrl(url);
    setCurrentTime(0);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentSpeech]);

  // Audio play/pause toggle
  const togglePlay = () => {
    if (currentSpeech?.isClientFallback) {
      if (isPlaying) {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
      } else {
        speakInBrowser(currentSpeech.text, currentSpeech.language, selectedVoice.gender);
        setIsPlaying(true);
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleAudition = () => {
    setIsAuditioning(true);
    previewSpeechModifier(
      currentText,
      selectedLanguage,
      selectedVoice?.gender || 'Female',
      modifiers
    );
    setTimeout(() => setIsAuditioning(false), 2500);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-extrabold text-stone-900 tracking-tight">
          Preview & Download
        </h2>
      </div>

      {/* Audio Waveform Player Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3 relative overflow-hidden">
        {/* Soft yellow-amber simulated waveform visualization background */}
        <div className="h-24 w-full flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-between gap-1 px-4 opacity-40 pointer-events-none">
            {[
              24, 45, 18, 60, 35, 75, 50, 85, 30, 95, 40, 70, 20, 80, 55, 65, 30, 90, 45, 75,
              25, 85, 60, 40, 20, 70, 50, 30, 60, 80, 45, 65, 35, 90, 50, 25,
            ].map((height, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-amber-400 transition-all"
                style={{
                  height: `${isPlaying ? Math.max(15, (height * (i % 2 === 0 ? 1.2 : 0.8))) : height}%`,
                }}
              />
            ))}
          </div>

          {/* Central Circular Glowing Play Button */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioUrl && !currentSpeech}
            className={`w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:from-orange-600 hover:via-rose-600 hover:to-purple-700 text-white flex items-center justify-center shadow-lg transition-all relative z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isPlaying ? 'ring-4 ring-rose-400/40 scale-105' : 'hover:scale-105'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Hidden Audio element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={() => {
              if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) setDuration(audioRef.current.duration);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
          />
        )}

        {/* Scrubber Bar and Timing */}
        <div className="space-y-1.5 pt-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
              if (audioRef.current) audioRef.current.currentTime = val;
            }}
            className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />

          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Generate Speech & Download Buttons Row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isGenerating || !currentText.trim()}
          onClick={onGenerate}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-indigo-600 hover:from-rose-600 hover:via-orange-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Speech...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 stroke-[2.5]" />
              <span>Generate Speech</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={!currentSpeech?.audioBase64}
          onClick={() => {
            if (currentSpeech?.audioBase64) {
              downloadMp3File(currentSpeech.audioBase64, `dka-${selectedVoice.name.toLowerCase()}.mp3`);
            }
          }}
          className="w-11 h-11 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          title="Download MP3"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* SPEECH MODIFIERS Studio Box */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-2xs overflow-hidden space-y-3.5 p-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-100 border border-orange-200 text-orange-700 flex items-center justify-center">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                SPEECH MODIFIERS
              </div>
              <div className="text-[10px] text-stone-500">
                Side voice director & pacing
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAudition}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/80 rounded-lg transition-colors cursor-pointer border border-amber-300"
          >
            <Radio className={`w-3.5 h-3.5 text-amber-700 ${isAuditioning ? 'animate-pulse' : ''}`} />
            <span>Audition</span>
          </button>
        </div>

        {/* Segmented Tabs (Cadence, Mood & Accent, Tags & Custom) */}
        <div className="flex items-center p-1 bg-stone-100/90 rounded-xl border border-stone-200/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setModifierTab('cadence')}
            className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              modifierTab === 'cadence'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-orange-600" />
            <span>Cadence</span>
          </button>

          <button
            type="button"
            onClick={() => setModifierTab('mood')}
            className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              modifierTab === 'mood'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Mood & Accent</span>
          </button>

          <button
            type="button"
            onClick={() => setModifierTab('tags')}
            className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              modifierTab === 'tags'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-stone-500" />
            <span>Tags & Custom</span>
          </button>
        </div>

        {/* Tab 1: Cadence */}
        {modifierTab === 'cadence' && (
          <div className="space-y-3 pt-1">
            {/* Speaking Rate (Speed) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">Speaking Rate (Speed)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono text-[11px] font-bold">
                  {(modifiers?.speakingRate ?? 0.95).toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min="0.70"
                max="1.35"
                step="0.05"
                value={modifiers?.speakingRate ?? 0.95}
                onChange={(e) =>
                  onChangeModifiers({
                    ...modifiers,
                    speakingRate: parseFloat(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />

              <div className="flex items-center justify-between text-[10px] text-stone-500">
                <span>0.70x (Slow)</span>
                <span className="font-semibold text-stone-700">Natural Indian Cadence</span>
                <span>1.35x (Fast)</span>
              </div>

              {/* Rate Presets Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {RATE_PRESETS.map((preset) => {
                  const isCurrent =
                    Math.abs((modifiers?.speakingRate ?? 0.95) - preset.value) < 0.02;
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
                      className={`py-1 text-[11px] rounded-lg border text-center transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-2xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mood & Accent */}
        {modifierTab === 'mood' && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800">
                Delivery Emotion
              </label>
              <div className="space-y-1">
                {EMOTION_OPTIONS.slice(0, 4).map((emo) => {
                  const isCurrent = modifiers?.emotion === emo.id;
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
                          ? 'bg-orange-50 border-orange-500 text-stone-900 font-semibold'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{emo.title}</span>
                        {isCurrent && <span className="text-orange-600 text-[10px]">Active</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-stone-800">
                Regional Accent
              </label>
              <div className="space-y-1">
                {REGIONAL_ACCENTS.slice(0, 3).map((reg) => {
                  const isCurrent = modifiers?.accentFlavor === reg.id;
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
                          ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {reg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tags & Custom */}
        {modifierTab === 'tags' && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800">
                Quick Speech Tags
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_TAGS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => onInsertTag(t.tag)}
                    className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-orange-200 text-left transition-colors cursor-pointer text-xs"
                  >
                    <span className="font-mono text-[11px] font-bold text-stone-900 block">
                      {t.label}
                    </span>
                    <span className="text-[10px] text-stone-500 block truncate">
                      {t.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-2xs p-4 space-y-3.5">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
          <Settings className="w-4 h-4 text-stone-700" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
            Advanced Options
          </h3>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-stone-700">
              <Volume2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Pitch</span>
            </span>
            <span className="font-mono font-bold text-stone-800 text-[11px]">
              {(modifiers?.pitch ?? 0) > 0 ? `+${modifiers?.pitch}` : modifiers?.pitch ?? 0}
            </span>
          </div>
          <input
            type="range"
            min="-2"
            max="2"
            step="1"
            value={modifiers?.pitch ?? 0}
            onChange={(e) =>
              onChangeModifiers({
                ...modifiers,
                pitch: parseInt(e.target.value, 10),
              })
            }
            className="w-full h-1.5 bg-gradient-to-r from-purple-500 via-rose-500 to-orange-500 rounded-lg appearance-none cursor-pointer accent-stone-900"
          />
        </div>

        {/* Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-stone-700">
              <Volume2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Volume</span>
            </span>
            <span className="font-mono font-bold text-stone-800 text-[11px]">
              {volume}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-gradient-to-r from-purple-500 via-rose-500 to-orange-500 rounded-lg appearance-none cursor-pointer accent-stone-900"
          />
        </div>

        {/* Toggles List */}
        <div className="space-y-2.5 pt-1 border-t border-stone-100">
          {/* Stability */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-700 font-medium">
              <Shield className="w-3.5 h-3.5 text-stone-500" />
              <span>Stability</span>
            </span>
            <button
              type="button"
              onClick={() => setStability(!stability)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                stability ? 'bg-purple-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  stability ? 'left-4.5' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Clarity Boost */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-700 font-medium">
              <Gem className="w-3.5 h-3.5 text-stone-500" />
              <span>Clarity Boost</span>
            </span>
            <button
              type="button"
              onClick={() => setClarityBoost(!clarityBoost)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                clarityBoost ? 'bg-purple-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  clarityBoost ? 'left-4.5' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Background Silence Reduction */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-700 font-medium">
              <Ear className="w-3.5 h-3.5 text-stone-500" />
              <span>Background Silence Reduction</span>
            </span>
            <button
              type="button"
              onClick={() => setSilenceReduction(!silenceReduction)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                silenceReduction ? 'bg-purple-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  silenceReduction ? 'left-4.5' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
