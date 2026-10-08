import React, { useState, useEffect } from 'react';
import { IndianLanguage, VoicePersona, GeneratedSpeech, SpeechModifiers } from './types';
import { INDIAN_LANGUAGES_INFO, INDIAN_VOICES } from './data/voices';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { StudioBanner } from './components/StudioBanner';
import { LanguageSelector } from './components/LanguageSelector';
import { VoiceSelector } from './components/VoiceSelector';
import { ScriptEditor } from './components/ScriptEditor';
import { RightControlPanel } from './components/RightControlPanel';
import { DialogueStudio } from './components/DialogueStudio';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AccentGuideModal } from './components/AccentGuideModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  generateIndianSpeech,
  loadSpeechHistory,
  saveSpeechToHistory,
  deleteSpeechFromHistory,
  clearSpeechHistory,
} from './services/ttsService';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentNavTab, setCurrentNavTab] = useState<string>('tts');
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>('indian-english');
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>(INDIAN_VOICES[0]); // Jhanvi
  const [text, setText] = useState<string>(INDIAN_LANGUAGES_INFO['indian-english'].sampleText);
  const [modifiers, setModifiers] = useState<SpeechModifiers>({
    speakingRate: 0.95,
    pitch: 0,
    emotion: 'Conversational & Warm',
    accentFlavor: 'Pan-Indian Metro Neutral',
    energy: 'balanced',
    customPrompt: '',
  });
  const [activeMode, setActiveMode] = useState<'single' | 'dialogue'>('single');

  const [currentSpeech, setCurrentSpeech] = useState<GeneratedSpeech | null>(null);
  const [history, setHistory] = useState<GeneratedSpeech[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAndroidOpen, setIsAndroidOpen] = useState(false);
  const [studioWallpaper, setStudioWallpaper] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('dhatwal_full_wallpaper') === 'true') {
      return localStorage.getItem('dhatwal_custom_backdrop') || '/dhatwal-valley-bg.svg';
    }
    return null;
  });

  const { isInstallable, install, isAndroid, isIOS } = usePWAInstall();

  // Load history from IndexedDB on initial render
  useEffect(() => {
    loadSpeechHistory().then((saved) => {
      setHistory(saved);
      if (saved.length > 0) {
        setCurrentSpeech(saved[0]);
      }
    });
  }, []);

  // Language change handler
  const handleSelectLanguage = (lang: IndianLanguage) => {
    setSelectedLanguage(lang);

    // If current voice doesn't support the new language, find the first persona that does
    if (!selectedVoice.languages.includes(lang)) {
      const match = INDIAN_VOICES.find((v) => v.languages.includes(lang));
      if (match) setSelectedVoice(match);
    }

    // Update text with language sample if empty or currently matching other sample
    const oldInfo = INDIAN_LANGUAGES_INFO[selectedLanguage];
    if (!text.trim() || text.trim() === oldInfo.sampleText.trim()) {
      setText(INDIAN_LANGUAGES_INFO[lang].sampleText);
    }
  };

  // Solo speech generation
  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await generateIndianSpeech({
        text: text.trim(),
        language: selectedLanguage,
        voiceName: selectedVoice.geminiVoice,
        personaName: selectedVoice.name,
        model: 'gemini-3.8-flash-tts',
        stylePrompt: `${modifiers.emotion}. ${modifiers.accentFlavor}. ${modifiers.customPrompt || ''}`.trim(),
        speakingRate: modifiers.speakingRate,
        pitch: modifiers.pitch,
        emotion: modifiers.emotion,
        accentFlavor: modifiers.accentFlavor,
        energy: modifiers.energy,
      });

      const speechItem: GeneratedSpeech = {
        id: `speech_${Date.now()}`,
        text: text.trim(),
        language: selectedLanguage,
        voiceName: res.voiceName,
        personaName: selectedVoice.name,
        model: res.model,
        audioBase64: res.audioBase64,
        mimeType: res.mimeType || 'audio/wav',
        timestamp: Date.now(),
        isDialogue: false,
      };

      setCurrentSpeech(speechItem);
      const updatedList = saveSpeechToHistory(speechItem);
      setHistory(updatedList);

      if (res.isClientFallback) {
        setErrorMessage(
          'Notice: Speech played using the local Indian voice engine while Gemini TTS rate limits reset.'
        );
      }
    } catch (err: any) {
      console.error('TTS Generation error:', err);
      setErrorMessage(
        err.message || 'Failed to generate Indian speech. Please try again in a moment.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Dual dialogue generation
  const handleGenerateDialogue = async (
    s1: { name: string; voiceName: string; text: string; style: string },
    s2: { name: string; voiceName: string; text: string; style: string }
  ) => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await generateIndianSpeech({
        text: `${s1.name}: ${s1.text} ${s2.name}: ${s2.text}`,
        language: selectedLanguage,
        voiceName: 'Puck',
        personaName: `${s1.name} & ${s2.name}`,
        model: 'gemini-3.8-flash-tts',
        dialogue: true,
        dialogueSpeakers: [
          { name: s1.name, voiceName: s1.voiceName, text: s1.text, style: s1.style },
          { name: s2.name, voiceName: s2.voiceName, text: s2.text, style: s2.style },
        ],
      });

      const speechItem: GeneratedSpeech = {
        id: `dialogue_${Date.now()}`,
        text: `${s1.name}: ${s1.text} | ${s2.name}: ${s2.text}`,
        language: selectedLanguage,
        voiceName: res.voiceName,
        personaName: `${s1.name} & ${s2.name}`,
        model: res.model,
        audioBase64: res.audioBase64,
        mimeType: res.mimeType || 'audio/wav',
        timestamp: Date.now(),
        isDialogue: true,
      };

      setCurrentSpeech(speechItem);
      const updatedList = saveSpeechToHistory(speechItem);
      setHistory(updatedList);
    } catch (err: any) {
      console.error('Dialogue TTS error:', err);
      setErrorMessage(err.message || 'Failed to generate dual dialogue audio.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteSpeechFromHistory(id);
    setHistory(updated);
    if (currentSpeech?.id === id) {
      setCurrentSpeech(updated[0] || null);
    }
  };

  const handleClearHistory = () => {
    clearSpeechHistory();
    setHistory([]);
    setCurrentSpeech(null);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex font-sans selection:bg-amber-200 selection:text-amber-900 pb-[env(safe-area-inset-bottom)] relative overflow-x-hidden">
      {/* Optional Full Page Mountain Valley Backdrop Wallpaper */}
      {studioWallpaper && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-10 overflow-hidden">
          <img
            src={studioWallpaper}
            alt=""
            className="w-full h-full object-cover filter blur-[1px]"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Dark Left Sidebar */}
      <div className="hidden md:block shrink-0 relative z-10">
        <Sidebar
          currentTab={currentNavTab}
          onSelectTab={setCurrentNavTab}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
        />
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header */}
        <TopHeader
          onInstallAndroid={() => setIsAndroidOpen(true)}
          onInstallPWA={() => setIsAndroidOpen(true)}
        />

        {/* Content Canvas */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-rose-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="font-bold text-rose-600 hover:text-rose-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left / Center Content Column */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              {/* Studio Banner */}
              <StudioBanner
                activeMode={activeMode}
                onModeChange={(mode) => setActiveMode(mode)}
                onOpenAndroid={() => setIsAndroidOpen(true)}
                onOpenGuide={() => setIsGuideOpen(true)}
                onOpenHistory={() => setIsHistoryOpen(true)}
                historyCount={history.length}
                onToggleFullPageWallpaper={(active, url) => {
                  setStudioWallpaper(active ? url : null);
                }}
              />

              {activeMode === 'single' ? (
                <>
                  {/* 01. SELECT LANGUAGE & ACCENT CADENCE */}
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onSelectLanguage={handleSelectLanguage}
                  />

                  {/* 02. CHOOSE INDIAN VOICE PERSONA */}
                  <VoiceSelector
                    selectedLanguage={selectedLanguage}
                    selectedVoice={selectedVoice}
                    onSelectVoice={setSelectedVoice}
                  />

                  {/* 03. SCRIPT & AUDIO DIRECTION */}
                  <ScriptEditor
                    text={text}
                    onChangeText={setText}
                    selectedLanguage={selectedLanguage}
                    selectedVoice={selectedVoice}
                  />
                </>
              ) : (
                <DialogueStudio
                  selectedLanguage={selectedLanguage}
                  isGenerating={isGenerating}
                  onGenerateDialogue={handleGenerateDialogue}
                />
              )}
            </div>

            {/* Right Column: Preview & Download Panel */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20">
              <RightControlPanel
                currentSpeech={currentSpeech}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                selectedLanguage={selectedLanguage}
                selectedVoice={selectedVoice}
                currentText={text}
                modifiers={modifiers}
                onChangeModifiers={setModifiers}
                onInsertTag={(tag) =>
                  setText((prev) => (prev ? prev + ' ' : '') + tag + ' ')
                }
              />
            </div>
          </div>
        </main>
      </div>

      {/* Drawers and Modals */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectSpeech={(speech) => setCurrentSpeech(speech)}
        onDeleteSpeech={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />

      <AccentGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <AndroidInstallModal
        isOpen={isAndroidOpen}
        onClose={() => setIsAndroidOpen(false)}
        isInstallable={isInstallable}
        onInstall={install}
        isAndroid={isAndroid}
        isIOS={isIOS}
      />
    </div>
  );
}
