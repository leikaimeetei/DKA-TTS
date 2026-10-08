import React from 'react';
import { Smartphone, Download, Check, X, ShieldCheck, Zap, Sparkles, Wifi } from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onInstall: () => Promise<boolean>;
  isAndroid: boolean;
  isIOS: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  onInstall,
  isAndroid,
  isIOS,
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await onInstall();
      if (ok) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Install for Android & Mobile</h3>
              <p className="text-xs text-orange-100">DKA - Indian Accents TTS App</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-stone-700">
          {/* Key Advantages */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <Zap className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Native Android Performance</span>
                <p className="text-stone-500 mt-0.5">
                  Launches instantly in standalone fullscreen mode without browser URL bars.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <Wifi className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Offline Library Storage</span>
                <p className="text-stone-500 mt-0.5">
                  Access generated speech, scripts, and audio player playback even with intermittent connectivity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Keep Web & Android Synchronized</span>
                <p className="text-stone-500 mt-0.5">
                  The web version remains untouched and fully accessible on laptops, desktops, and tablets.
                </p>
              </div>
            </div>
          </div>

          {/* Action Area */}
          {isInstallable ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-700 hover:from-orange-700 hover:via-amber-700 hover:to-rose-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Add to Android Home Screen (Install)</span>
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Specific Guidance */
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
              <span className="font-bold flex items-center gap-1.5">
                <span>iOS Installation Steps:</span>
              </span>
              <ol className="list-decimal list-inside space-y-1 text-stone-600">
                <li>Tap the <strong>Share</strong> button in Safari toolbar.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> in the top-right corner.</li>
              </ol>
            </div>
          ) : (
            /* Android Browser Instructions when prompt is not yet active */
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <span>Android Chrome / Edge / Brave Steps:</span>
              </span>
              <ol className="list-decimal list-inside space-y-1 text-stone-600">
                <li>Tap the three dots menu (<strong>⋮</strong>) in your browser top right.</li>
                <li>Select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                <li>Confirm to add DKA TTS to your app drawer and home screen.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Web & Android cross-platform enabled</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 font-semibold text-stone-700 hover:text-stone-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
