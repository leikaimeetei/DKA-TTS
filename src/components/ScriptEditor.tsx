import React, { useState } from 'react';
import { IndianLanguage, VoicePersona } from '../types';
import { INDIAN_LANGUAGES_INFO } from '../data/voices';
import { SAMPLE_SCRIPTS } from '../data/sampleScripts';
import { PronunciationGuideModal } from './PronunciationGuideModal';
import {
  BookOpen,
  FlaskConical,
  Wand2,
  FileText,
  Clock,
  Wind,
} from 'lucide-react';
import { estimateReadingTimeSeconds, processScriptHelper } from '../services/ttsService';

interface ScriptEditorProps {
  text: string;
  onChangeText: (text: string) => void;
  selectedLanguage: IndianLanguage;
  selectedVoice: VoicePersona;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  text,
  onChangeText,
  selectedLanguage,
  selectedVoice,
}) => {
  const [isProcessingHelper, setIsProcessingHelper] = useState(false);
  const [helperNotice, setHelperNotice] = useState<string | null>(null);
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);

  const langInfo = INDIAN_LANGUAGES_INFO[selectedLanguage];
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = estimateReadingTimeSeconds(text);

  const availableSamples = SAMPLE_SCRIPTS.filter(
    (s) => s.language === selectedLanguage
  );

  const handleInsertPause = (pauseText: string) => {
    onChangeText((text ? text + ' ' : '') + pauseText + ' ');
  };

  const handlePhoneticReplace = (originalTerm: string, phoneticTerm: string) => {
    if (!originalTerm || !text) return;
    const regex = new RegExp(originalTerm, 'gi');
    const updated = text.replace(regex, phoneticTerm);
    onChangeText(updated);
  };

  const handleInsertPhoneticText = (snippet: string) => {
    onChangeText((text ? text + ' ' : '') + snippet.trim() + ' ');
  };

  const handleScriptAction = async (
    mode: 'translate' | 'transliterate' | 'enhance' | 'pronunciation'
  ) => {
    if (!text.trim()) {
      setHelperNotice('Please enter some text in the script box first.');
      return;
    }

    setIsProcessingHelper(true);
    setHelperNotice(null);
    try {
      const result = await processScriptHelper(text, selectedLanguage, mode);
      onChangeText(result);
      if (mode === 'translate') {
        setHelperNotice(`Translated script into ${langInfo.name}.`);
      } else if (mode === 'transliterate') {
        setHelperNotice(`Converted script to phonetic Romanized text.`);
      } else if (mode === 'pronunciation') {
        setHelperNotice(`Optimized scientific names and technical terms for pronunciation.`);
      } else {
        setHelperNotice(`Enhanced script with natural Indian pacing.`);
      }
      setTimeout(() => setHelperNotice(null), 4000);
    } catch (err: any) {
      setHelperNotice(err.message || 'Script assistance failed.');
      setTimeout(() => setHelperNotice(null), 5000);
    } finally {
      setIsProcessingHelper(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header and Quick Samples Drawer button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <span className="text-orange-600">03.</span>
            <span>SCRIPT & AUDIO DIRECTION</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Compose in {langInfo.name} on the left, and adjust Indian cadence, pitch & mood on the side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPronunciationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200/80 rounded-xl transition-colors cursor-pointer border border-amber-300 shadow-2xs"
            title="Scientific names, botanical taxa, acronyms & pronunciation guide"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-800" />
            <span>Pronunciation Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSamplesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <span>Sample Scripts ({availableSamples.length})</span>
          </button>

          {text && (
            <button
              type="button"
              onClick={() => onChangeText('')}
              className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Script Box */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all flex flex-col">
        {/* Helper Toolbar */}
        <div className="px-3.5 py-2 bg-stone-50/80 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Pacing Toolbar */}
          <div className="flex flex-wrap items-center gap-1 text-stone-600">
            <span className="font-semibold text-stone-700 flex items-center gap-1 text-[11px] mr-1">
              <Wind className="w-3.5 h-3.5 text-stone-400" />
              <span>Pacing:</span>
            </span>
            <button
              type="button"
              onClick={() => handleInsertPause(',')}
              className="px-2 py-0.5 bg-white border border-stone-200 rounded hover:bg-stone-100 font-mono text-[11px] cursor-pointer"
              title="Insert breath comma (0.2s pause)"
            >
              · (0.2s) ·
            </button>
            <button
              type="button"
              onClick={() => handleInsertPause('...')}
              className="px-2 py-0.5 bg-white border border-stone-200 rounded hover:bg-stone-100 font-mono text-[11px] cursor-pointer"
              title="Insert ellipsis pause (0.5s pause)"
            >
              · (0.5s) ·
            </button>
            <button
              type="button"
              onClick={() => handleInsertPause('. ')}
              className="px-2 py-0.5 bg-white border border-stone-200 rounded hover:bg-stone-100 font-mono text-[11px] cursor-pointer"
              title="Insert sentence boundary (0.7s gap)"
            >
              · (0.7s) ·
            </button>
            <button
              type="button"
              onClick={() => handleInsertPause('—')}
              className="px-2 py-0.5 bg-white border border-stone-200 rounded hover:bg-stone-100 font-mono text-[11px] cursor-pointer"
              title="Insert dramatic gap"
            >
              · (Gap) ·
            </button>
            <button
              type="button"
              onClick={() => handleInsertPause('<breath>')}
              className="px-2 py-0.5 bg-orange-50 border border-orange-300 text-orange-800 rounded font-mono text-[11px] cursor-pointer font-bold"
              title="Insert natural breath audio mark"
            >
              &lt;breath&gt;
            </button>
          </div>

          {/* AI Helper buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={isProcessingHelper || !text.trim()}
              onClick={() => handleScriptAction('pronunciation')}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-lg text-xs transition-colors disabled:opacity-40 font-medium cursor-pointer"
              title="Auto-detect and fix pronunciation for technical terms"
            >
              <FlaskConical className="w-3 h-3 text-amber-700" />
              <span>Fix Terms</span>
            </button>

            <button
              type="button"
              disabled={isProcessingHelper || !text.trim()}
              onClick={() => handleScriptAction('enhance')}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 text-stone-700 hover:text-amber-800 hover:border-amber-300 rounded-lg text-xs transition-colors disabled:opacity-40 cursor-pointer"
              title="Polish script pacing"
            >
              <Wand2 className="w-3 h-3 text-amber-600" />
              <span>Polish</span>
            </button>

            <button
              type="button"
              disabled={isProcessingHelper || !text.trim()}
              onClick={() => handleScriptAction('transliterate')}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 text-stone-700 hover:text-amber-800 hover:border-amber-300 rounded-lg text-xs transition-colors disabled:opacity-40 cursor-pointer"
              title="Convert script to phonetic Latin/Romanized spelling"
            >
              <FileText className="w-3 h-3 text-amber-600" />
              <span>Romanize</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={`Enter or paste your text here in ${langInfo.name}...`}
            rows={5}
            className="w-full resize-y text-stone-900 placeholder:text-stone-400 text-sm leading-relaxed focus:outline-hidden font-normal"
            style={{
              fontFamily:
                selectedLanguage === 'hindi'
                  ? "'Noto Sans Devanagari', system-ui, sans-serif"
                  : "inherit",
            }}
          />
        </div>

        {/* Notice strip */}
        {helperNotice && (
          <div className="px-4 py-1.5 bg-amber-50 text-amber-800 border-t border-amber-100 text-xs flex items-center justify-between">
            <span>{helperNotice}</span>
            <button
              type="button"
              onClick={() => setHelperNotice(null)}
              className="text-amber-700 hover:text-amber-950 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Footer Metrics */}
        <div className="px-4 py-2 bg-stone-50/60 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span>{charCount} characters</span>
            <span aria-hidden="true">·</span>
            <span>{wordCount} words</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-stone-600">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Est. ~{estimatedSeconds}s</span>
            </span>
          </div>

          <div className="text-[11px] text-stone-400">
            Native {langInfo.name} Indian Accent Engine
          </div>
        </div>
      </div>

      {/* Sample Scripts Modal */}
      {showSamplesModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  Pre-Trained Authentic Indian Scripts
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Showing scripts for {langInfo.name} ({langInfo.nativeName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSamplesModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {availableSamples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    onChangeText(sample.text);
                    setShowSamplesModal(false);
                  }}
                  className="p-4 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/30 cursor-pointer transition-all text-left space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 text-sm group-hover:text-amber-800">
                      {sample.title}
                    </span>
                    <span className="text-xs text-stone-500">{sample.category}</span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {sample.text}
                  </p>
                  <div className="text-[11px] text-amber-700 font-medium">
                    Click to load into editor →
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSamplesModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pronunciation & Terms Modal */}
      <PronunciationGuideModal
        isOpen={showPronunciationModal}
        onClose={() => setShowPronunciationModal(false)}
        onApplyPhoneticReplacement={handlePhoneticReplace}
        onInsertText={handleInsertPhoneticText}
      />
    </div>
  );
};
