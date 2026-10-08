import React from 'react';
import { GeneratedSpeech } from '../types';
import { INDIAN_LANGUAGES_INFO } from '../data/voices';
import { Play, Download, Trash2, X, Clock, FileAudio } from 'lucide-react';
import { downloadMp3File } from '../services/ttsService';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedSpeech[];
  onSelectSpeech: (speech: GeneratedSpeech) => void;
  onDeleteSpeech: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectSpeech,
  onDeleteSpeech,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Generated Speech Library</h3>
              <p className="text-[11px] text-stone-500">
                {history.length} {history.length === 1 ? 'recording' : 'recordings'} saved locally
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs">No generated speech yet.</p>
              <p className="text-[11px] text-stone-400">
                Synthesize a script to automatically store it in your studio history.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const langInfo = INDIAN_LANGUAGES_INFO[item.language] || {
                name: item.language,
                nativeName: '',
              };
              const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/20 transition-all text-left space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900 text-xs">
                          {item.personaName}
                        </span>
                        <span className="text-[11px] text-stone-400">·</span>
                        <span className="text-[11px] text-amber-800 font-medium font-serif">
                          {langInfo.nativeName} ({langInfo.name})
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{dateStr}</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSpeech(item);
                          onClose();
                        }}
                        className="p-1.5 rounded-md bg-stone-100 hover:bg-amber-600 hover:text-white text-stone-700 transition-colors"
                        title="Load into Audio Player"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadMp3File(
                            item.audioBase64,
                            `dka_tts_${item.language}_${item.personaName}_${item.timestamp}.mp3`
                          )
                        }
                        className="p-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                        title="Download MP3"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSpeech(item.id)}
                        className="p-1.5 rounded-md hover:bg-rose-50 hover:text-rose-600 text-stone-400 transition-colors"
                        title="Delete recording"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
