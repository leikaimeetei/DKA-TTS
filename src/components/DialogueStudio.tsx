import React, { useState } from 'react';
import { IndianLanguage, VoicePersona } from '../types';
import { INDIAN_LANGUAGES_INFO, INDIAN_VOICES } from '../data/voices';
import { Volume2, Loader2, Sparkles, User, MessageSquare } from 'lucide-react';

interface DialogueStudioProps {
  selectedLanguage: IndianLanguage;
  isGenerating: boolean;
  onGenerateDialogue: (
    speaker1: { name: string; voiceName: string; text: string; style: string },
    speaker2: { name: string; voiceName: string; text: string; style: string }
  ) => void;
}

const DIALOGUE_PRESETS = [
  {
    title: 'Bengaluru Tech Podcast (Indian English)',
    language: 'indian-english' as IndianLanguage,
    s1: {
      name: 'Abhay',
      voiceName: 'Puck',
      text: 'Welcome back to the studio! Today we are discussing how authentic Indian voice models are transforming communication.',
      style: 'Enthusiastic urban tech podcast host',
    },
    s2: {
      name: 'Jhanvi',
      voiceName: 'Kore',
      text: 'Exactly Abhay. Natural accents in Indian English and Hindi make voice interactions feel warm, clear, and authentic.',
      style: 'Insightful, articulate researcher with warm South Asian cadence',
    },
  },
  {
    title: 'Executive Briefing (Indian English)',
    language: 'indian-english' as IndianLanguage,
    s1: {
      name: 'Balak Ram',
      voiceName: 'Charon',
      text: 'Good morning team. We are witnessing rapid adoption of voice technology across Indian enterprises.',
      style: 'Authoritative, calm senior leader with classic Indian cadence',
    },
    s2: {
      name: 'Jhanvi',
      voiceName: 'Kore',
      text: 'Indeed Balak Ram. Clear diction and conversational warmth are proving to be the key drivers of user engagement.',
      style: 'Professional, articulate executive host',
    },
  },
  {
    title: 'सांस्कृतिक वार्तालाप (Hindi Dialogue)',
    language: 'hindi' as IndianLanguage,
    s1: {
      name: 'Abhay',
      voiceName: 'Puck',
      text: 'नमस्ते जान्हवी जी! क्या आपको लगता है कि तकनीक और डिजिटल माध्यम हिंदी भाषा को और अधिक सशक्त बना रहे हैं?',
      style: 'जिज्ञासु और शिष्ट भारतीय वार्तालाप',
    },
    s2: {
      name: 'Jhanvi',
      voiceName: 'Kore',
      text: 'बिल्कुल अभय, डिजिटल माध्यमों और शुद्ध भारतीय आवाज़ों की वजह से अब हर कोई अपनी भाषा में सहजता से संवाद कर रहा है।',
      style: 'सहज, विचारशील और मधुर उच्चारण',
    },
  },
  {
    title: 'समाचार एवं विचार-विमर्श (Hindi Discussion)',
    language: 'hindi' as IndianLanguage,
    s1: {
      name: 'Balak Ram',
      voiceName: 'Charon',
      text: 'नमस्कार। आज के विशेष सत्र में हम भारतीय नवाचार और आधुनिक तकनीक के विस्तार पर चर्चा कर रहे हैं।',
      style: 'गंभीर और स्पष्ट ब्रॉडकास्ट शैली',
    },
    s2: {
      name: 'Jhanvi',
      voiceName: 'Kore',
      text: 'बालक राम जी, शिक्षा और स्वास्थ्य के क्षेत्र में भारतीय आवाज़ों का उपयोग लाखों लोगों के लिए अत्यंत लाभकारी सिद्ध हो रहा है।',
      style: 'स्पष्ट, संतुलित और गरिमापूर्ण संवाद',
    },
  },
];

export const DialogueStudio: React.FC<DialogueStudioProps> = ({
  selectedLanguage,
  isGenerating,
  onGenerateDialogue,
}) => {
  const [s1Name, setS1Name] = useState('Abhay');
  const [s1Voice, setS1Voice] = useState<'Puck' | 'Charon'>('Puck');
  const [s1Text, setS1Text] = useState(
    'Welcome back everyone. Today we are diving deep into how Indian accent voice models are transforming accessibility across India.'
  );
  const [s1Style, setS1Style] = useState('Energetic, friendly podcast host with clear Indian English accent');

  const [s2Name, setS2Name] = useState('Jhanvi');
  const [s2Voice, setS2Voice] = useState<'Kore' | 'Zephyr'>('Kore');
  const [s2Text, setS2Text] = useState(
    'That is right Abhay. Having authentic accents in Indian English and Hindi makes speech interactions feel natural and engaging.'
  );
  const [s2Style, setS2Style] = useState('Warm, thoughtful co-host with natural Indian cadence');

  const langInfo = INDIAN_LANGUAGES_INFO[selectedLanguage];

  const handleLoadPreset = (preset: (typeof DIALOGUE_PRESETS)[0]) => {
    setS1Name(preset.s1.name);
    setS1Voice(preset.s1.voiceName as any);
    setS1Text(preset.s1.text);
    setS1Style(preset.s1.style);

    setS2Name(preset.s2.name);
    setS2Voice(preset.s2.voiceName as any);
    setS2Text(preset.s2.text);
    setS2Style(preset.s2.style);
  };

  const handleTrigger = () => {
    onGenerateDialogue(
      { name: s1Name, voiceName: s1Voice, text: s1Text, style: s1Style },
      { name: s2Name, voiceName: s2Voice, text: s2Text, style: s2Style }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              Dual Speaker Indian Dialogue Studio
            </h2>
            <span className="text-[11px] font-mono text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-semibold">
              Gemini 3.8 Flash TTS
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Two distinct Indian voice personas conversing seamlessly in one unified audio track.
          </p>
        </div>

        {/* Dialogue Presets */}
        <div className="flex flex-wrap gap-1.5">
          {DIALOGUE_PRESETS.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => handleLoadPreset(p)}
              className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors font-medium cursor-pointer"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Two Speaker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speaker 1 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                S1
              </div>
              <input
                type="text"
                value={s1Name}
                onChange={(e) => setS1Name(e.target.value)}
                className="font-bold text-stone-900 text-sm border-b border-transparent hover:border-stone-300 focus:border-amber-600 focus:outline-hidden"
              />
            </div>
            <select
              value={s1Voice}
              onChange={(e) => setS1Voice(e.target.value as any)}
              className="text-xs border border-stone-200 rounded-lg p-1.5 text-stone-700 bg-stone-50"
            >
              <option value="Puck">Voice: Puck (Energetic / Abhay / Kunwar)</option>
              <option value="Charon">Voice: Charon (Deep Baritone / Balak Ram)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Speaker 1 Speech Lines:
            </label>
            <textarea
              rows={4}
              value={s1Text}
              onChange={(e) => setS1Text(e.target.value)}
              className="w-full p-2.5 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:border-amber-600"
              placeholder="What Speaker 1 says..."
            />
          </div>

          <div className="text-xs text-stone-500">
            <span className="font-medium text-stone-700">Tone: </span>
            <span>{s1Style}</span>
          </div>
        </div>

        {/* Speaker 2 */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                S2
              </div>
              <input
                type="text"
                value={s2Name}
                onChange={(e) => setS2Name(e.target.value)}
                className="font-bold text-stone-900 text-sm border-b border-transparent hover:border-stone-300 focus:border-amber-600 focus:outline-hidden"
              />
            </div>
            <select
              value={s2Voice}
              onChange={(e) => setS2Voice(e.target.value as any)}
              className="text-xs border border-stone-200 rounded-lg p-1.5 text-stone-700 bg-stone-50"
            >
              <option value="Kore">Voice: Kore (Authentic Indian Female / Jhanvi / Chanderwali / Awah)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Speaker 2 Speech Lines:
            </label>
            <textarea
              rows={4}
              value={s2Text}
              onChange={(e) => setS2Text(e.target.value)}
              className="w-full p-2.5 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:border-amber-600"
              placeholder="What Speaker 2 says..."
            />
          </div>

          <div className="text-xs text-stone-500">
            <span className="font-medium text-stone-700">Tone: </span>
            <span>{s2Style}</span>
          </div>
        </div>
      </div>

      {/* Generate Dialogue Button */}
      <button
        type="button"
        disabled={isGenerating || !s1Text.trim() || !s2Text.trim()}
        onClick={handleTrigger}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 hover:from-amber-700 hover:via-orange-700 hover:to-rose-800 shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Dual Indian Dialogue Audio...</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            <span>Generate Dual Dialogue ({s1Name} & {s2Name})</span>
          </>
        )}
      </button>
    </div>
  );
};
